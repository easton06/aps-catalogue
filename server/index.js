const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const express = require("express");

const app = express();

app.use(express.json());

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
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
 */
async function listSheet(auth, sheet) {
	const sheets = google.sheets({ version: "v4", auth });
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: "1rbRfMUygG0GbeTRiIdTd7qSXQtifdIDRndOC0LO6GBw",
		range: `${sheet}!A1:J`,
	});
	const rows = res.data.values;
	if (!rows || rows.length === 0) {
		console.log("No data found.");
		return;
	}
	return rows;
}

authorize()
	.then((auth) => {
		const port = 5555;

		app.get("/aps/:sheet", (req, res) => {
			listSheet(auth, req.params.sheet)
				.then((data) => {
					console.log("--------------------------------------------------");
					for (let i = 0; i < data.length; i++) {
						for (let j = 0; j < data[i].length; j++) {
							if (data[i][j] === "") data[i][j] = null;
						}
						console.log(data[i]);
					}
					console.log("--------------------------------------------------");

					res.status(200).send({ status: "ok", value: data });
				})
				.catch((e) => {
					res.status(e["code"]).send({ status: "error", value: e.errors[0].message });
				});
		});

		app.listen(port, () => {
			console.log(`app is currently listening on port ${port}`);
		});
	})
	.catch(console.error);
