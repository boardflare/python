import { initFunctionDropdowns, addCodeUpdateHandler, saveFunction } from './shared.js';

// Make editors accessible globally
window.monacoEditor = null;
window.introMonacoEditor = null;

const DEFAULT_CODE = `# Code below creates =HELLO(name)

def hello(name):
    """ Returns a greeting. """
    greeting = f"Hello {name}!"
    return greeting
    
# Example arguments.
examples = ["Nancy", "Ming", "Zara"]

# Steps to create a function:

# Drag task pane open to full width.
# Update function name and code.
# Update example arguments.
# Click Save. Updates if same name.
# Use in Excel, e.g. =HELLO("Judy").
# Delete in Formulas > Name Manager.
    `;

export function initMonacoEditor() {
    return new Promise((resolve) => {
        window.require.config({
            paths: {
                vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs'
            }
        });

        window.require(['vs/editor/editor.main'], function () {
            // Always create intro editor
            window.introMonacoEditor = monaco.editor.create(document.getElementById('introMonaco'), {
                value: DEFAULT_CODE,
                language: 'python',
                theme: 'vs',
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                padding: { top: 8, bottom: 8 },
                lineNumbers: 'off',
                folding: false,
                glyphMargin: false,
                lineDecorationsWidth: 0
            });

            // Only initialize advanced editor container if feature is enabled
            const editorContainer = document.getElementById('monaco-editor-container');
            if (window.enableAdvancedFeatures && editorContainer) {
                window.monacoEditor = monaco.editor.create(editorContainer, {
                    value: DEFAULT_CODE,
                    language: 'python',
                    theme: 'vs',
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true
                });
            }

            // Register code update handler
            addCodeUpdateHandler((code) => {
                if (window.introMonacoEditor) window.introMonacoEditor.setValue(code);
                if (window.enableAdvancedFeatures && window.monacoEditor) {
                    window.monacoEditor.setValue(code);
                }
            });

            // Initialize dropdowns and event handlers
            initFunctionDropdowns();

            // Only add layout handlers for enabled features
            if (window.enableAdvancedFeatures) {
                document.getElementById('editor-tab')?.addEventListener('shown.bs.tab', () => {
                    if (window.monacoEditor) window.monacoEditor.layout();
                });
            }

            document.getElementById('home-tab')?.addEventListener('shown.bs.tab', () => {
                if (window.introMonacoEditor) window.introMonacoEditor.layout();
            });

            // Only add advanced feature button handlers if enabled
            if (window.enableAdvancedFeatures) {
                document.getElementById('saveBtn')?.addEventListener('click', async () => {
                    const code = window.monacoEditor?.getValue();
                    await saveFunction(code, document.getElementById('editorSaveNotification'));
                });
            }

            // Always add intro save and reset button handlers
            document.getElementById('introSaveBtn')?.addEventListener('click', async () => {
                const code = window.introMonacoEditor?.getValue();
                await saveFunction(code, document.getElementById('introSaveNotification'));
            });

            document.getElementById('introResetBtn')?.addEventListener('click', () => {
                if (window.introMonacoEditor) {
                    window.introMonacoEditor.setValue(DEFAULT_CODE);
                }
            });

            resolve();
        });
    });
}