import { loadMonacoEditor } from './monaco-loader';
import type {
	CancellationToken,
	editor as MEditor,
	IDisposable,
	languages,
	Range as MRange
} from 'monaco-editor';

export type ProvideCodeActions = (
	model: MEditor.ITextModel,
	range: MRange,
	context: languages.CodeActionContext,
	token: CancellationToken
) => languages.ProviderResult<languages.CodeActionList>;
export type Result = {
	setModelLanguage: (language: string) => void;
	setLeftValue: (value: string) => void;
	setRightValue: (value: string) => void;
	setLeftMarkers: (markers: MEditor.IMarkerData[]) => void;
	setRightMarkers: (markers: MEditor.IMarkerData[]) => void;
	getLeftEditor: () => MEditor.IStandaloneCodeEditor;
	disposeEditor: () => void;
	registerCodeActionProvider: (provideCodeActions: ProvideCodeActions) => void;
};
/** Setup editor */
export async function setup({
	init,
	listeners,
	useDiffEditor,
	rootElement
}: {
	init: {
		value: string;
		language: string;
		markers?: MEditor.IMarkerData[];
		right?: { value: string; markers?: MEditor.IMarkerData[] };
		readOnly?: boolean;
	};
	listeners?: {
		onChangeValue?: (value: string) => void;
		onDidChangeCursorPosition?: (evt: MEditor.ICursorPositionChangedEvent) => void;
		onFocus?: () => void;
	};
	useDiffEditor: boolean;
	rootElement: HTMLElement;
}): Promise<Result> {
	const monaco = await loadMonacoEditor();
	const language = init.language;

	const options = {
		value: init.value,
		readOnly: init.readOnly,
		theme: 'vs-dark',
		language,
		automaticLayout: true,
		fontSize: 14,
		// tabSize: 2,
		minimap: {
			enabled: false
		},
		renderControlCharacters: true,
		renderIndentGuides: true,
		renderValidationDecorations: 'on' as const,
		renderWhitespace: 'boundary' as const,
		scrollBeyondLastLine: false
	};

	if (useDiffEditor) {
		const diffEditor = monaco.editor.createDiffEditor(rootElement, {
			originalEditable: true,
			...options
		});
		const original = monaco.editor.createModel(init.value, language);
		const modified = monaco.editor.createModel(init.right?.value || '', language);

		const leftEditor = diffEditor.getOriginalEditor();
		const rightEditor = diffEditor.getModifiedEditor();
		rightEditor.updateOptions({ readOnly: true });
		diffEditor.setModel({ original, modified });
		original.onDidChangeContent(() => {
			const value = original.getValue();
			listeners?.onChangeValue?.(value);
		});
		leftEditor.onDidChangeCursorPosition((evt) => {
			listeners?.onDidChangeCursorPosition?.(evt);
		});
		leftEditor.onDidFocusEditorText(() => {
			listeners?.onFocus?.();
		});

		const registerCodeActionProvider = buildRegisterCodeActionProvider(leftEditor, language);

		const result: Result = {
			setModelLanguage: (lang) => {
				for (const model of [original, modified]) {
					monaco.editor.setModelLanguage(model, lang);
				}
				registerCodeActionProvider.setLanguage(lang);
			},
			setLeftValue: (code) => {
				const value = original.getValue();
				if (code !== value) {
					original.setValue(code);
				}
			},
			setRightValue: (code) => {
				const value = modified.getValue();
				if (code !== value) {
					modified.setValue(code);
				}
			},
			setLeftMarkers: (markers) => {
				void updateMarkers(leftEditor, markers);
			},
			setRightMarkers: (markers) => {
				void updateMarkers(rightEditor, markers);
			},
			getLeftEditor: () => leftEditor,

			registerCodeActionProvider: registerCodeActionProvider.register,
			disposeEditor: () => {
				registerCodeActionProvider.dispose();
				leftEditor.getModel()?.dispose();
				rightEditor.getModel()?.dispose();
				leftEditor.dispose();
				rightEditor.dispose();
				diffEditor.dispose();
			}
		};
		if (init.markers) result.setLeftMarkers(init.markers);
		if (init.right?.markers) result.setRightMarkers(init.right?.markers);

		return result;
	}
	const standaloneEditor = monaco.editor.create(rootElement, options);

	standaloneEditor.onDidChangeModelContent(() => {
		const value = standaloneEditor.getValue();
		listeners?.onChangeValue?.(value);
	});
	standaloneEditor.onDidChangeCursorPosition((evt) => {
		listeners?.onDidChangeCursorPosition?.(evt);
	});
	standaloneEditor.onDidFocusEditorText(() => {
		listeners?.onFocus?.();
	});

	const registerCodeActionProvider = buildRegisterCodeActionProvider(standaloneEditor, language);
	const result: Result = {
		setModelLanguage: (lang) => {
			const model = standaloneEditor.getModel();
			if (model) {
				monaco.editor.setModelLanguage(model, lang);
			}
			registerCodeActionProvider.setLanguage(lang);
		},
		setLeftValue: (code) => {
			const value = standaloneEditor.getValue();
			if (code !== value) {
				standaloneEditor.setValue(code);
			}
		},
		setRightValue: () => {
			/* noop */
		},
		setLeftMarkers: (markers) => {
			void updateMarkers(standaloneEditor, markers);
		},
		setRightMarkers: () => {
			/* noop */
		},
		getLeftEditor: () => standaloneEditor,

		registerCodeActionProvider: registerCodeActionProvider.register,
		disposeEditor: () => {
			registerCodeActionProvider.dispose();
			standaloneEditor.getModel()?.dispose();
			standaloneEditor.dispose();
		}
	};
	if (init.markers) result.setLeftMarkers(init.markers);
	return result;

	/** Update markers */
	function updateMarkers(editor: MEditor.IStandaloneCodeEditor, markers: MEditor.IMarkerData[]) {
		const model = editor.getModel()!;
		const id = editor.getId();
		monaco.editor.setModelMarkers(
			model,
			id,
			JSON.parse(JSON.stringify(markers)) as MEditor.IMarkerData[]
		);
	}

	function buildRegisterCodeActionProvider(
		editor: MEditor.IStandaloneCodeEditor,
		initLanguage: string
	): {
		setLanguage: (lang: string) => void;
		register: (provideCodeActions: ProvideCodeActions) => void;
		dispose: () => void;
	} {
		let codeActionProviderDisposable: IDisposable = {
			dispose: () => {
				// void
			}
		};
		let currProvideCodeActions: ProvideCodeActions | null = null;
		let currLanguage = initLanguage;

		function register() {
			codeActionProviderDisposable.dispose();
			codeActionProviderDisposable = monaco.languages.registerCodeActionProvider(currLanguage, {
				provideCodeActions(model, ...args) {
					if (!currProvideCodeActions || editor.getModel()!.uri !== model.uri) {
						return {
							actions: [],
							dispose() {
								/* nop */
							}
						};
					}
					return currProvideCodeActions(model, ...args);
				}
			});
		}

		return {
			setLanguage: (lang) => {
				currLanguage = lang;
				register();
			},
			register: (provideCodeActions) => {
				currProvideCodeActions = provideCodeActions;
				register();
			},
			dispose() {
				codeActionProviderDisposable.dispose();
			}
		};
	}
}
