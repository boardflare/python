import { initFunctionDropdowns, addCodeUpdateHandler, saveFunction } from './shared.js';

// Make editor accessible globally
window.monacoEditor = null;

const DEFAULT_CODE = `def hello(name):
    """Say hello to someone
    
    Args:
        name (str): Person's name
        
    Returns:
        str: Greeting message
    """
    return f"Hello {name}!"`;

export function initMonacoEditor() {
    return new Promise((resolve) => {
        window.require.config({
            paths: {
                vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs'
            }
        });

        window.require(['vs/editor/editor.main'], function () {
            window.monacoEditor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
                value: DEFAULT_CODE,
                language: 'python',
                theme: 'vs',
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true
            });

            // Register code update handler
            addCodeUpdateHandler((code) => {
                if (window.monacoEditor) {
                    window.monacoEditor.setValue(code);
                }
            });

            // Initialize dropdowns
            initFunctionDropdowns();

            // Layout handling
            document.getElementById('editor-tab').addEventListener('shown.bs.tab', () => {
                if (window.monacoEditor) window.monacoEditor.layout();
            });

            // Button handlers
            document.getElementById('saveBtn').addEventListener('click', async () => {
                const code = window.monacoEditor?.getValue();
                await saveFunction(code, document.getElementById('editorNotification'));
            });

            document.getElementById('cancelBtn').addEventListener('click', () => {
                console.log('Cancel clicked');
            });

            resolve();
        });
    });
}