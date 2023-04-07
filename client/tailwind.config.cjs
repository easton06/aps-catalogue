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
				sm: '1.75rem',
				base: '2.19rem',
				lg: '3rem',
				xl: '5.34rem',
				'2xl': '6.68rem',
			},
			spacing: {
				0.5: '1.6rem',
				1: '3.3rem',
				2: '6.6rem',
				3: '10rem',
				4: '13.3rem',
				5: '16.6rem',
				6: '20rem',
				7: '23.3rem',
				8: '26.6rem',
				9: '30rem',
				10: '33.3rem',
				11: '36.6rem',
				12: '40rem',
				14: '46.6rem',
				16: '53.3rem',
				20: '66.6rem',
				24: '80rem',
				28: '93.3rem',
				32: '106.6rem',
				36: '120rem',
				40: '133.3rem',
				44: '146.6rem',
				48: '160rem',
				52: '173.3rem',
				56: '186.6rem',
				60: '200rem',
				64: '213.3rem',
				72: '240rem',
				80: '266.6rem',
				96: '320rem'
			}
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
