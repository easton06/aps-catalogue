const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const express = require("express");

const app = express();

app.use(express.json());

// If modifying these scopes, delete token.json.
const SCOPES = [
	"https://www.googleapis.com/auth/spreadsheets.readonly",
	"https://www.googleapis.com/auth/drive.metadata.readonly",
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: "authorized_user",
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1rbRfMUygG0GbeTRiIdTd7qSXQtifdIDRndOC0LO6GBw/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {string} sheet The sheet to extract data range from
 * @param {string} col The last alphabetic column of the extracted data range
 * @returns {any[][]}
 */
async function listSheet(auth, sheet, col) {
	const sheets = google.sheets({ version: "v4", auth });
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: "1rbRfMUygG0GbeTRiIdTd7qSXQtifdIDRndOC0LO6GBw",
		range: `${sheet}!A1:${col ?? "L"}`,
	});
	const rows = res.data.values;
	if (!rows || rows.length === 0) {
		console.log("No data found.");
		return [[]];
	}
	return rows;
}

/**
 * Lists the names and IDs of a specified folder with ID
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 * @param {string} folderId id of the folder of the files parents to
 * @returns {drive_v3.Schema$File[] | undefined}
 */
async function listFiles(authClient, folderId) {
	const drive = google.drive({ version: "v3", auth: authClient });
	const res = await drive.files.list({
		fields: "nextPageToken, files(id, name)",
		q: `'${folderId}' in parents and trashed = false`,
	});
	const files = res.data.files;
	if (files.length === 0) {
		console.log("No files found.");
		return undefined;
	} else {
		return files;
	}
}

authorize()
	.then((auth) => {
		listFiles(auth, "1AU0YvPpzdqHpiHblPfHrhEA-B4soIB--").then(async (picFolders) => {
			console.log(picFolders);
			if (picFolders !== undefined) {
				var picFiles = [];
				await Promise.all(
					picFolders.map(async (curr) => {
						await listFiles(auth, curr.id).then((files) => {
							picFiles = files.length
								? picFiles.length
									? [...files, ...picFiles]
									: [...files]
								: picFiles.length
								? [...picFiles]
								: [];
						});
					})
				);

				const picObject = picFiles.reduce((previousObject, currentObject) => {
					return Object.assign(previousObject, {
						[currentObject.name]: currentObject.id,
					});
				}, {});
				console.log(picObject);
				const port = 5555;

				/**
				 * convert .png and .jpeg entry with google image export id
				 * e.g. RBN20_img.jpg(PS20_RBNS4-6) -> {export_id}(PS20_RBNS4-6)
				 * @param {string} s the entry to convert
				 * @returns {string} picObject
				 */
				function getPicObject(s) {
					const b = s.indexOf("(");
					if (b >= 0) return picObject[s.slice(0, b)] + s.slice(b);
					else return picObject[s];
				}

				app.get("/aps/:sheet", (req, res) => {
					listSheet(auth, req.params.sheet)
						.then((data) => {
							for (let i = 0; i < data.length; i++) {
								for (let j = 0; j < data[i].length; j++) {
									// convert empty string for json use (json deletes entry with empty string)
									if (data[i][j] === "") data[i][j] = null;
									else if (data[i][j].includes(".jpg") || data[i][j].includes(".png") || data[i][j].includes(".webp")) {
										// convert .png and .jpeg entry with google image export id
										if (data[i][j].includes(",")) {
											data[i][j] = data[i][j].split(", ").map(getPicObject).join(", ");
										} else data[i][j] = getPicObject(data[i][j]);
									}
								}
							}
							console.log(data);

							res.status(200).send({ status: "ok", value: data });
						})
						.catch((e) => {
							if (e["code"] !== undefined) res.status(e["code"]).send({ status: "error", value: e.errors[0].message });
							console.error(e);
						});
				});

				app.get("/aps/:sheet/:col", (req, res) => {
					listSheet(auth, req.params.sheet, req.params.col)
						.then((data) => {
							for (let i = 0; i < data.length; i++) {
								for (let j = 0; j < data[i].length; j++) {
									// convert empty string for json use (json deletes entry with empty string)
									if (data[i][j] === "") data[i][j] = null;
									else if (data[i][j].includes(".jpg") || data[i][j].includes(".png") || data[i][j].includes(".webp"))
										if (data[i][j].includes(",")) {
											// convert .png and .jpeg entry with google image export id
											data[i][j] = data[i][j].split(", ").map(getPicObject).join(", ");
										} else data[i][j] = getPicObject(data[i][j]);
								}
							}
							console.log(data);

							res.status(200).send({ status: "ok", value: data });
						})
						.catch((e) => {
							if (e["code"] !== undefined) res.status(e["code"]).send({ status: "error", value: e.errors[0].message });
							console.error(e);
						});
				});

				app.listen(port, () => {
					console.log(`app is currently listening on port ${port}`);
				});
			} else console.log("Picture Folders not found");
		});
	})
	.catch(console.error);
