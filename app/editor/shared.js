import { parsePython } from './codeparser.js';
import { addToAzure } from './azuretable.js';
import { updateNameManager } from './nameManager.js';
import { addDemo } from './demo.js';
import { saveFunctionToSettings } from './settings.js';

export async function getRunpyFunctions() {
    try {
        await Office.onReady();
        return await Excel.run(async (context) => {
            const names = context.workbook.names.load("items");
            await context.sync();

            return names.items
                .filter(name => name.formula.includes("RUNPY"))
                .map(name => ({
                    name: name.name,
                    url: name.formula.match(/https:\/\/getcode\.boardflare\.workers\.dev[^"']*/)?.[0] || ''
                }));
        });
    } catch (error) {
        console.error('Failed to get RUNPY functions:', error);
        return [];
    }
}

export async function fetchFunctionCode(url) {
    try {
        const jsonUrl = url.replace('return=code', 'return=json');
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error('Failed to fetch code');
        const data = await response.json();
        const codeWithoutResult = data.Code.replace(/\n\s*result\s*=\s*.*$/m, '');
        return codeWithoutResult + (data.Demo ? '\n\n# Demo code.\n' + data.Demo : '');
    } catch (error) {
        console.error('Failed to fetch function code:', error);
        return null;
    }
}

// Keep track of all code update handlers
const codeUpdateHandlers = new Set();

export function addCodeUpdateHandler(handler) {
    codeUpdateHandlers.add(handler);
}

function showTemporaryNotification(element, html, duration = 3000) {
    if (element) {
        element.innerHTML = html;
        setTimeout(() => {
            element.innerHTML = '';
        }, duration);
    }
}

export async function saveFunction(code, notificationElement, saveLocal = true) {
    try {
        if (!code) return false;

        // Parse and save function
        const parsedFunction = parsePython(code);

        let saveResult;
        if (saveLocal) {
            // Use workbook-settings reference in formula
            parsedFunction.formula = parsedFunction.formula.replace(
                /(https:\/\/[^\s"']+)/,
                `workbook-settings:${parsedFunction.name}`
            );
            saveResult = await saveFunctionToSettings(parsedFunction);
        } else {
            saveResult = await addToAzure(parsedFunction);
        }

        if (saveResult) {
            await updateNameManager(parsedFunction);
            try {
                await addDemo(parsedFunction);
            } catch (demoError) {
                console.warn('Failed to create demo sheet:', demoError);
                // Continue even if demo creation fails
            }
            const refreshDropdowns = initFunctionDropdowns();
            await refreshDropdowns();
            showTemporaryNotification(
                notificationElement,
                '<div class="alert alert-success">Function saved successfully!</div>'
            );
            return true;
        } else {
            showTemporaryNotification(
                notificationElement,
                '<div class="alert alert-danger">Failed to save function.</div>'
            );
            return false;
        }
    } catch (error) {
        console.error('Failed to save code:', error);
        showTemporaryNotification(
            notificationElement,
            `<div class="alert alert-danger">Error: ${error.message}</div>`
        );
        return false;
    }
}

export function initFunctionDropdowns() {
    const dropdowns = ['functionSelect', 'functionDropdown', 'introFunctionDropdown'];

    async function updateDropdowns() {
        const functions = await getRunpyFunctions();
        const options = '<option value="">Load function...</option>' +
            functions.map(f => `<option value="${f.url}">${f.name}</option>`).join('');

        dropdowns.forEach(id => {
            const dropdown = document.getElementById(id);
            if (dropdown) {
                dropdown.innerHTML = options;
                if (!dropdown.hasChangeListener) {
                    dropdown.addEventListener('change', async (e) => {
                        const url = e.target.value;
                        if (url) {
                            // Sync other dropdown
                            dropdowns.forEach(otherId => {
                                const other = document.getElementById(otherId);
                                if (other && other !== e.target) {
                                    other.value = url;
                                }
                            });
                            // Load and broadcast function code
                            const code = await fetchFunctionCode(url);
                            if (code) {
                                codeUpdateHandlers.forEach(handler => handler(code));
                            }
                        }
                    });
                    dropdown.hasChangeListener = true;
                }
            }
        });
    }

    Office.onReady().then(updateDropdowns);
    return updateDropdowns;
}
