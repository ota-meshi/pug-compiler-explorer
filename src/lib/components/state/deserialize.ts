/**
 * Deserialize a given serialized string then update this object.
 * @param {string} serializedString A serialized string.
 * @returns {object} The deserialized state.
 */
export function deserializeState(serializedString: string): {
	code?: string;
	outType?: 'ast' | 'tokens' | 'fn' | 'html';
} {
	const state: {
		code?: string;
		outType?: 'ast' | 'tokens' | 'fn' | 'html';
	} = {
		code: undefined,
		outType: undefined
	};

	if (serializedString === '') {
		return state;
	}

	try {
		const safeJsonString = window.atob(serializedString);
		const uint8Arr = Uint8Array.from(safeJsonString, (c) => c.charCodeAt(0));
		const jsonText = new TextDecoder().decode(uint8Arr);
		const json = JSON.parse(jsonText) as {
			code?: string;
			outType?: 'ast' | 'tokens' | 'fn' | 'html';
		};

		if (typeof json === 'object' && json != null) {
			if (typeof json.code === 'string') {
				state.code = json.code;
			}
			if (json.outType && ['ast', 'tokens', 'fn', 'html'].includes(json.outType)) {
				state.outType = json.outType;
			}
		}
	} catch (error) {
		// eslint-disable-next-line no-console -- Demo
		console.error(error);
	}

	return state;
}
