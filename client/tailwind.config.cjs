/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				"brand": "#D40C0C",
				"background": "#D5F2E3",
				"shade": "#478E6F",
				"accent": "#003E1F",
				"font": "01110A",
				"lbg": "#EDFAF3"
			},
			outlineOffset: {
				n1: '-1px',
				n2: '-2px',
				n4: '-4px',
				3: '3px'
			},
		},
		fontFamily: {
			sans: ['"Josefin Sans"', "sans-serif"],
			serif: ['"Lora"', "Georgia", "serif"],
			display: ['"Angkor"', "display"],
			link: ['"Helvetica"', "display"],
			script: ['"Croissant"', "display"],
		},
	},
	plugins: [],
}
