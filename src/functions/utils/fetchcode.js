async function getFunctionFromSettings(name) {
    try {
        await Office.onReady();
        return await Excel.run(async (context) => {
            const settings = context.workbook.settings;
            const setting = settings.getItem(name);
            setting.load("value");
            await context.sync();
            console.log('setting.value:', setting.value);
            return setting.value;
        });
    } catch (error) {
        console.error('Failed to get from settings:', error);
        return null;
    }
}

export async function fetchCode(source) {
    let code;

    if (source.startsWith('workbook-settings:')) {
        try {
            const name = source.replace('workbook-settings:', '').trim();
            if (!name) {
                throw new Error('Function name not found in settings reference');
            }
            const functionData = await getFunctionFromSettings(name);
            if (functionData) {
                return functionData.code + (functionData.resultLine || '');
            } else {
                throw new Error(`Function "${name}" not found in workbook settings`);
            }
        } catch (error) {
            throw new Error(`Failed to parse settings reference: ${error.message}`);
        }
    } else if (source.startsWith('https://')) {
        try {
            const response = await fetch(source);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`URL does not exist:\n ${source}\n Status: ${response.status} ${response.statusText}`);
                } else if (response.status === 401) {
                    throw new Error(`URL requires authorization:\n ${source}\n Status: ${response.status} ${response.statusText}`);
                } else {
                    throw new Error(`Error fetching code from:\n ${source}\n Status: ${response.status}`);
                }
            }
            code = await response.text();
            if (source.endsWith('.ipynb')) {
                code = JSON.parse(code);
                const cells = code.cells.filter(cell => cell.cell_type === 'code');
                const functionCell = cells.find(cell => cell.metadata?.tags?.includes('function'));
                if (functionCell) {
                    // Regular Jupyter notebooks store source as an array of strings
                    const functionCellSource = functionCell.source.join('');
                    return functionCellSource;
                } else {
                    throw new Error('No code cell containing "function" tag found.');
                }
            }
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error(`Error fetching code from URL:\n ${source}\n This might be due to missing CORS headers.\n Original error: ${error.message}`);
            } else {
                throw new Error(`Error fetching code from URL:\n ${source}\n Error: ${error.message}`);
            }
        }
        // Loads code using path only
    } else if (source.endsWith('.ipynb') || source.endsWith('.py')) {
        try {
            const response = await fetch(`https://functions.boardflare.com/notebooks/${source}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch code from path. Status: ${response.status}`);
            }
            code = await response.text();
            if (source.endsWith('.ipynb')) {
                code = JSON.parse(code);
                const cells = code.cells.filter(cell => cell.cell_type === 'code');
                const functionCell = cells.find(cell => cell.metadata?.tags?.includes('function'));
                if (functionCell) {
                    // Regular Jupyter notebooks store source as an array of strings
                    const functionCellSource = functionCell.source.join('');
                    return functionCellSource;
                } else {
                    throw new Error('No code cell containing "function" tag found.');
                }
            }
        } catch (error) {
            throw error; // Simply rethrow the error instead of trying jupyterlite
        }
    } else {
        // Use code string as is
        code = source;
    }

    // Add resultLine to code string if it's not from a URL or notebook
    if (!source.startsWith('https://') && !source.endsWith('.ipynb') && !source.endsWith('.py')) {
        // Use code string as is and append result line
        const name = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)/)?.[1]?.toLowerCase();
        if (name) {
            const args = code.match(/def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\((.*?)\)/)?.[1]?.split(',')?.length || 0;
            const argList = Array.from({ length: args }, (_, i) => `arg${i + 1}`).join(', ');
            code += `\n\nresult = ${name}(${argList})`;
        }
    }

    return code;
}