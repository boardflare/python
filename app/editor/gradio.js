import { initFunctionDropdowns, addCodeUpdateHandler, saveFunction } from './shared.js';

export function initGradioEditor() {
    let currentCode = '';
    let gradioReady = false;

    function createGradioComponent() {
        return new Promise((resolve) => {
            const container = document.getElementById('gradioContainer');
            if (!container) {
                resolve();
                return;
            }

            // Save current code if editor exists
            const existingCode = extractGradioCode();
            if (existingCode) {
                currentCode = existingCode;
            }

            container.innerHTML = '';
            const gradioLite = document.createElement('gradio-lite');
            gradioLite.setAttribute('layout', 'vertical');
            gradioLite.setAttribute('playground', '');

            const defaultCode = currentCode || `# Install requirements:
import micropip
await micropip.install(['pandas', 'matplotlib', 'textdistance==4.6.3'])

# Function code: arg1, arg2, ... will be inserted by RUNPY
import numpy
import textdistance

def greet(name):
    test = textdistance.hamming('text', 'test')
    return "Hello, " + name + str(test) + "!"

# Demo code: This will NOT be used by RUNPY
import gradio as gr
gr.Interface(greet, "textbox", "textbox", examples=[["Bob"], ["Sally"]],
live=True,submit_btn=gr.Button("Submit", visible=False),clear_btn=gr.Button("Clear", visible=False),flagging_mode="never").launch()`;

            gradioLite.appendChild(document.createTextNode(defaultCode));
            container.appendChild(gradioLite);

            // Wait for Gradio to initialize
            const observer = new MutationObserver((mutations, obs) => {
                if (document.querySelector('.cm-content')) {
                    obs.disconnect();
                    gradioReady = true;
                    resolve();
                }
            });

            observer.observe(container, {
                childList: true,
                subtree: true
            });
        });
    }

    function extractGradioCode() {
        const codeContent = document.querySelector('.cm-content');
        if (codeContent) {
            const codeLines = Array.from(codeContent.querySelectorAll('.cm-line'))
                .map(line => line.textContent)
                .join('\n');
            return codeLines;
        }
    }

    function insertCode(code) {
        if (!gradioReady) {
            setTimeout(() => insertCode(code), 100);
            return;
        }

        try {
            const codeContent = document.querySelector('.cm-content');
            if (codeContent) {
                // Clear existing lines
                const existingLines = codeContent.querySelectorAll('.cm-line');
                existingLines.forEach(line => line.textContent = '');

                // Insert new code line by line
                const lines = code.split('\n');
                lines.forEach((line, index) => {
                    if (index < existingLines.length) {
                        existingLines[index].textContent = line;
                    } else {
                        const newLine = document.createElement('div');
                        newLine.className = 'cm-line';
                        newLine.textContent = line;
                        codeContent.appendChild(newLine);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to insert code:', error);
        }
    }

    async function saveGradioCode() {
        const code = extractGradioCode();
        await saveFunction(code, document.getElementById('saveNotification'));
    }

    // Initialize Gradio editor
    async function init() {
        await createGradioComponent();

        // Register code update handler
        addCodeUpdateHandler((code) => {
            insertCode(code);
        });

        // Initialize dropdowns
        initFunctionDropdowns();

        // Save button handler
        document.getElementById('saveButton')?.addEventListener('click', saveGradioCode);
    }

    init();
}