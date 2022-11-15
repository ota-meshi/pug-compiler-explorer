import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import './src/build-system/build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

function getPkg(moduleName: string) {
	// eslint-disable-next-line no-shadow -- name
	const { name, homepage, version } = JSON.parse(
		fs.readFileSync(`./node_modules/${moduleName}/package.json`, 'utf8')
	) as { name: string; homepage: string; version: string };

	return { name, homepage, version };
}

const config: UserConfig = {
	plugins: [sveltekit()],
	define: {
		__DEPS_PKGS__: {
			'pug-lexer': getPkg('pug-lexer'),
			'pug-parser': getPkg('pug-parser'),
			'pug-code-gen': getPkg('pug-code-gen'),
			'pug-runtime': getPkg('pug-runtime')
		},
		'process.env.BABEL_TYPES_8_BREAKING': 'null'
	},
	resolve: {
		alias: {
			'pug-parser': path.join(dirname, './src/shim/pug-parser.mjs')
		}
	}
};

export default config;
