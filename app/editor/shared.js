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
        return codeWithoutResult + (data.Demo ? '\n\n# Demo code: This will NOT be used by RUNPY\n' + data.Demo : '');
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

export function initFunctionDropdowns() {
    const dropdowns = ['functionSelect', 'functionDropdown'];

    async function updateDropdowns() {
        const functions = await getRunpyFunctions();
        const options = '<option value="">Select a function...</option>' +
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
