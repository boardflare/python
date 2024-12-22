import { initFunctionDropdowns, addCodeUpdateHandler, saveFunction } from './shared.js';

// Make editors accessible globally
window.monacoEditor = null;
window.introMonacoEditor = null;

const DEFAULT_CODE = `# Creates custom function =HELLO(name)
def hello(name):
    """ Returns a greeting. """
    greeting = f"Hello {name}!"
    return greeting
    
# Example function arguments.
examples = ["Nancy", "Ming", "Zara"]
    `;

export function initMonacoEditor() {
    return new Promise((resolve) => {
        window.require.config({
            paths: {
                vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs'
            }
        });

        window.require(['vs/editor/editor.main'], function () {
            // Create main editor
            window.monacoEditor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
                value: DEFAULT_CODE,
                language: 'python',
                theme: 'vs',
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true
            });

            // Create intro editor
            window.introMonacoEditor = monaco.editor.create(document.getElementById('introMonaco'), {
                value: DEFAULT_CODE,
                language: 'python',
                theme: 'vs',
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                padding: { top: 8, bottom: 8, left: 0 },
                lineNumbers: 'off',
                folding: false,
                glyphMargin: false,
                lineDecorationsWidth: 0
            });

            // Register code update handler for both editors
            addCodeUpdateHandler((code) => {
                if (window.monacoEditor) window.monacoEditor.setValue(code);
                if (window.introMonacoEditor) window.introMonacoEditor.setValue(code);
            });

            // Initialize dropdowns
            initFunctionDropdowns();

            // Layout handling
            document.getElementById('editor-tab').addEventListener('shown.bs.tab', () => {
                if (window.monacoEditor) window.monacoEditor.layout();
            });

            document.getElementById('home-tab').addEventListener('shown.bs.tab', () => {
                if (window.introMonacoEditor) window.introMonacoEditor.layout();
            });

            // Button handlers
            document.getElementById('saveBtn').addEventListener('click', async () => {
                const code = window.monacoEditor?.getValue();
                await saveFunction(code, document.getElementById('editorNotification'));
            });

            document.getElementById('introSaveBtn').addEventListener('click', async () => {
                const code = window.introMonacoEditor?.getValue();
                await saveFunction(code, document.getElementById('introInfo'));
            });

            document.getElementById('cancelBtn').addEventListener('click', () => {
                console.log('Cancel clicked');
            });

            resolve();
        });
    });
}