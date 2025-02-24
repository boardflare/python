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
        const parameters = pyResult.parameters;
        const description = pyResult.description;

        // Generate resultLine to call function with kwargs for non-omitted parameters
        const argList = parameters.length > 0 ? parameters.map((param, index) => {
            return `("${param.name}", arg${index + 1} if arg${index + 1} != "__OMITTED__" else None)`
        }).join(', ') : '';
        const resultLine = `\n\nresult = ${name.toLowerCase()}(**{k: v for k, v in [${argList}] if v is not None})`;
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

        // Excel named lambda signature with optional parameters
        const signature = parameters.length > 0
            ? `${name.toUpperCase()}(${parameters.map(p => p.has_default ? `[${p.name}]` : p.name).join(', ')})`
            : `${name.toUpperCase()}()`;

        // Excel named lambda formula with ISOMITTED handling
        const paramFormula = parameters.map((param, index) => {
            if (param.has_default) {
                return `IF(ISOMITTED(${param.name}), "__OMITTED__", ${param.name})`
            }
            return param.name;
        }).join(', ');

        const timestamp = new Date().toISOString();
        const uid = "anonymous";
        const codeRef = `"workbook-settings:${name}"`;
        const formula = parameters.length > 0
            ? `=LAMBDA(${parameters.map(p => p.has_default ? `[${p.name}]` : p.name).join(', ')}, ${execEnv}(${codeRef}, ${paramFormula}))`
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