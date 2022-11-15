/**
 * Serialize a given state as a base64 string.
 * @param {State} state The state to serialize.
 * @returns {string} The serialized string.
 */
export function serializeState(state: {
	code?: string;
	outType?: 'ast' | 'tokens' | 'fn' | 'html';
}): string {
	const saveData = {
		code: state.code,
		outType: state.outType
	};
	const jsonString = JSON.stringify(saveData);

	const uint8Arr = new TextEncoder().encode(jsonString);
	const safeJsonString = String.fromCharCode(...uint8Arr);
	const base64 = (typeof window !== 'undefined' && window.btoa(safeJsonString)) || safeJsonString;

	// eslint-disable-next-line no-console -- Demo
	console.log(
		`The compress rate of serialized string: ${((100 * base64.length) / jsonString.length).toFixed(
			1
		)}% (${jsonString.length}B → ${base64.length}B)`
	);

	return base64;
}
