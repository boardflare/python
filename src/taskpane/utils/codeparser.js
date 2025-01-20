import { pyLogs } from './logs';

export function parsePython(rawCode) {
    try {
        // Extract function definition
        const functionMatch = rawCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([\s\S]*?)\)(?:\s*->\s*[^:]+)?\s*:/);
        if (!functionMatch) {
            throw new Error("No function definition found. Your code must be wrapped in a function, e.g. def my_function(first, second):");
        }

        const name = functionMatch[1].toLowerCase();
        const params = functionMatch[2].trim();

        // Enhanced args parsing with validation
        const args = params.split(',')
            .filter(arg => arg.trim())
            .map(arg => {
                const trimmedArg = arg.trim();

                if (trimmedArg.startsWith('*')) {
                    throw new Error("Variable arguments (*args/**kwargs) are not supported");
                }

                const paramMatch = trimmedArg.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[^=]+)?(?:\s*=\s*(.+))?$/);

                if (!paramMatch) {
                    throw new Error(`Invalid parameter format: ${trimmedArg}`);
                }

                const paramName = paramMatch[1];
                const defaultValue = paramMatch[2];

                if (/\d/.test(paramName)) {
                    throw new Error(`Parameter names cannot contain numbers.  Issue causing error: ${paramName}`);
                }

                if (defaultValue) {
                    throw new Error(`Default values are not supported for function parameters at this time.  Issue causing error: ${paramName}=${defaultValue}`);
                }

                return paramName;
            });

        // Extract first line of docstring to use as description.
        const docstringMatch = rawCode.match(/def.*?:\s*(?:'''|""")(.*?)(?:\n|'''|""")/s);
        const description = docstringMatch
            ? docstringMatch[1].trim().slice(0, 255)
            : 'No description available';

        // Generate resultLine to call function with arg1, arg2, etc.
        const argList = args.length > 0 ? args.map((_, index) => `arg${index + 1}`).join(', ') : '';
        const resultLine = `\n\nresult = ${name.toLowerCase()}(${argList})`;
        const code = rawCode.trim();

        // Determine which EXEC environment to use
        let execEnv = 'BOARDFLARE.EXEC';
        if (window.location.hostname === 'localhost') {
            execEnv = 'LOCAL.EXEC';
        } else if (window.location.pathname.toLowerCase().includes('preview')) {
            execEnv = 'PREVIEW.EXEC';
        } else if (window.location.hostname === 'python-insider.boardflare.com') {
            execEnv = 'BFINSIDER.EXEC';
        }

        // Excel named lambda signature
        const signature = `${name.toUpperCase()}(${params})`;

        // Excel named lambda formula
        const timestamp = new Date().toISOString();
        const uid = "anonymous";
        const tableRef = `"https://getcode.boardflare.workers.dev/?uid=${uid}&timestamp=${timestamp}&name=${name}&return=code"`;
        const settingsRef = `"workbook-settings:${name}"`;
        const codeRef = settingsRef;
        const formula = `=LAMBDA(${args.join(', ')}, ${execEnv}(${codeRef}, ${args.join(', ')}))`;

        // Extract Excel demo
        const excelDemoMatch = rawCode.match(/^# Excel usage:\s*(.+?)$/m);
        const excelExample = excelDemoMatch
            ? excelDemoMatch[1].trim()
            : null;

        const result = {
            name,
            signature,
            description,
            code,
            resultLine,
            formula,
            timestamp,
            uid,
            excelExample
        };

        return result;
    } catch (error) {
        pyLogs({
            errorMessage: error.message,
            code: rawCode,
            ref: 'codeparser_error'
        })
        throw error;  // Re-throw to maintain existing error handling behavior
    }
}