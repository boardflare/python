import { execPython } from "../../functions/exec/controller";
import { pyLogs } from './logs';
import astParserCode from './astParser.py';

export async function parsePython(rawCode) {
    try {
        // First use Python AST parser
        const parseCode = `
${astParserCode}

# Parse the function
result = parse_python_code('''
${rawCode}
''')
`;

        const rawResult = await execPython({ code: parseCode, arg1: null });
        const pyResult = JSON.parse(rawResult);

        if (!pyResult || pyResult.error) {
            throw new Error(pyResult.error || "Failed to parse Python code");
        }

        const name = pyResult.name.toLowerCase();
        const parameters = pyResult.parameters.map(param => param.name);
        const description = pyResult.description;

        // Generate resultLine to call function with arg1, arg2, etc.
        const argList = parameters.length > 0 ? parameters.map((_, index) => `arg${index + 1}`).join(', ') : '';
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
        const signature = parameters.length > 0
            ? `${name.toUpperCase()}(${parameters.join(', ')})`
            : `${name.toUpperCase()}()`;

        // Excel named lambda formula
        const timestamp = new Date().toISOString();
        const uid = "anonymous";
        const tableRef = `"https://getcode.boardflare.workers.dev/?uid=${uid}&timestamp=${timestamp}&name=${name}&return=code"`;
        const settingsRef = `"workbook-settings:${name}"`;
        const codeRef = settingsRef;
        const formula = parameters.length > 0
            ? `=LAMBDA(${parameters.join(', ')}, ${execEnv}(${codeRef}, ${parameters.join(', ')}))`
            : `=LAMBDA(${execEnv}(${codeRef}))`;

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
        throw error;
    }
}