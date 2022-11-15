import ghpagesAdapter from 'svelte-adapter-ghpages';
import preprocess from 'svelte-preprocess';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dirname, 'build/pug-compiler-explorer');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		paths: {
			base: '/pug-compiler-explorer'
		},
		adapter: ghpagesAdapter({
			// default options are shown
			pages: outDir,
			assets: outDir
		})
	}
};

export default config;
