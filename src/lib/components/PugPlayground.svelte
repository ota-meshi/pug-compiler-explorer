<script lang="ts">
	import MonacoEditor from './MonacoEditor.svelte';
	import lex from 'pug-lexer';
	// @ts-expect-error -- no type
	import parse from 'pug-parser';
	// @ts-expect-error -- no type
	import generateCode from 'pug-code-gen';
	// @ts-expect-error -- no type
	import runtimeWrap from 'pug-runtime/wrap';
	import { deserializeState } from './state/deserialize';
	import { serializeState } from './state/serialize';

	const DEFAULT_CODE = `p #{name}'s Pug source code!

- for (var x = 0; x < 3; x++)
  li item`;
	const state = deserializeState(
		(typeof window !== 'undefined' && window.location.hash.slice(1)) || ''
	);
	let code = state.code || DEFAULT_CODE;
	let outType: 'ast' | 'tokens' | 'fn' | 'html' = state.outType || 'html';
	let time = '';

	let output = {
		tokens: '',
		ast: '',
		fn: '',
		html: ''
	};
	$: {
		const start = Date.now();

		let tokens, tokensError: string | undefined;
		try {
			tokens = lex(code);
		} catch (e: unknown) {
			tokensError = errotToString(e);
		}
		let ast;
		let astError = tokensError;
		if (tokens) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- no type
				ast = parse([...tokens], { filename: 'index.pug' });
			} catch (e: unknown) {
				astError = errotToString(e);
			}
		}
		let fn: string | undefined;
		let fnError = astError;
		if (ast) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- no type
				fn = generateCode(ast, {
					pretty: true,
					compileDebug: false
				});
			} catch (e: unknown) {
				fnError = errotToString(e);
			}
		}
		let html: string | undefined;
		let htmlError = fnError;
		if (fn) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- no type
				html = runtimeWrap(fn)({
					name: 'Timothy'
				});
			} catch (e: unknown) {
				htmlError = errotToString(e);
			}
		}

		time = `${Date.now() - start}ms`;

		output = {
			tokens: tokensError || JSON.stringify(tokens, null, 2),
			ast: astError || JSON.stringify(ast, null, 2),
			fn: fnError || fn || '',
			html: htmlError || html?.trim() || ''
		};
	}

	/** Run function */
	function errotToString(e: unknown): string {
		console.error(e);
		return `Error: ${(e as Error).message}\n${JSON.stringify(e, null, 2)}`;
	}

	$: serializedString = (() => {
		const serializeCode = DEFAULT_CODE === code ? undefined : code;
		const serializeOutType = outType === 'html' ? undefined : outType;
		return serializeState({
			code: serializeCode,
			outType: serializeOutType
		});
	})();
	$: {
		if (typeof window !== 'undefined') {
			window.location.replace(`#${serializedString}`);
		}
	}
	function onUrlHashChange() {
		const newSerializedString =
			(typeof window !== 'undefined' && window.location.hash.slice(1)) || '';
		if (newSerializedString !== serializedString) {
			const state = deserializeState(newSerializedString);
			code = state.code || DEFAULT_CODE;
			outType = state.outType || 'html';
		}
	}
</script>

<svelte:window on:hashchange={onUrlHashChange} />

<div class="playground-root">
	<div class="playground-tools">
		<span style:margin-left="16px">{time}</span>
	</div>
	<div class="playground-content">
		<div class="pug">
			<MonacoEditor bind:code language="pug" />
		</div>
		<div class="out">
			<div class="out-type">
				<label>
					<input type="radio" bind:group={outType} name="outType" value="tokens" />
					Tokens
				</label>
				<label>
					<input type="radio" bind:group={outType} name="outType" value="ast" />
					AST
				</label>
				<label>
					<input type="radio" bind:group={outType} name="outType" value="fn" />
					Function
				</label>
				<label>
					<input type="radio" bind:group={outType} name="outType" value="html" />
					HTML
				</label>
			</div>
			<div class="out-value">
				<div style:display={outType === 'tokens' ? 'block' : 'none'} class="out-value-main">
					<MonacoEditor code={output.tokens} readOnly language="json" />
				</div>
				<div style:display={outType === 'ast' ? 'block' : 'none'} class="out-value-main">
					<MonacoEditor code={output.ast} readOnly language="json" />
				</div>
				<div style:display={outType === 'fn' ? 'block' : 'none'} class="out-value-main">
					<MonacoEditor code={output.fn} readOnly language="javascript" />
				</div>
				<div style:display={outType === 'html' ? 'block' : 'none'} class="out-value-main">
					<MonacoEditor code={output.html} readOnly language="html" />
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.playground-root {
		height: calc(100vh - 110px);
		height: calc(100dvh - 110px);
	}
	.playground-tools {
		height: 24px;
		text-align: end;
	}
	.playground-content {
		display: flex;
		flex-wrap: wrap;
		height: calc(100% - 24px);
		border: 1px solid #cfd4db;
		background-color: #282c34;
		color: #fff;
	}
	.pug,
	.out {
		width: 50%;
		height: 100%;
	}
	.out {
		display: flex;
		flex-direction: column;
	}
	.out-value {
		flex-grow: 1;
	}
	.out-value-main {
		height: 100%;
	}
</style>
