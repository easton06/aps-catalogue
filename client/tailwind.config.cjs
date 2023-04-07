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
			fontSize: {
				// sm: '1.75rem',
				// base: '2.19rem',
				// xl: '3.33rem',
				// '2xl': '1.56rem',
				// '3xl': '3.42rem',
				// '4xl': '5.34rem',
				// '5xl': '6.68rem',
				sm: '3rem',
				base: '4rem',
				lg: '5rem',
				xl: '6rem',
				'2xl': '7rem',
				'3xl': '8rem',
				'4xl': '10rem',
				'5xl': '12rem',
				'6xl': '16rem',
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
