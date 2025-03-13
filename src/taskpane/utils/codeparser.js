import { execPython } from "../../functions/exec/controller";
import { pyLogs } from './logs';
import { getExecEnv } from './constants';
import astParserCode from './astParser.py';

export async function parsePython(rawCode) {
    try {
        // Safely encode the Python code to avoid issues with triple quotes
        const encodedCode = btoa(
            String.fromCharCode.apply(null, new TextEncoder().encode(rawCode))
        );

        // First use Python AST parser with the base64 encoded code
        const parseCode = `
${astParserCode}

# Parse the function using the safely encoded code
result = parse_python_code_safe("${encodedCode}")
`;

        const rawResult = await execPython({ code: parseCode, arg1: null }, false);
        let pyResult;
        try {
            pyResult = JSON.parse(rawResult);
        } catch (e) {
            throw new Error(`Failed to parse JSON: ${e.message}, rawResult: ${rawResult}`);
        }

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
        const execEnv = getExecEnv();

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
        const codeRef = `"${name}"`;
        const formula = parameters.length > 0
            ? `=LAMBDA(${parameters.map(p => p.has_default ? `[${p.name}]` : p.name).join(', ')}, ${execEnv}(${codeRef}, ${paramFormula}))`
            : `=LAMBDA(${execEnv}(${codeRef}))`;

        // Build the execFormula for direct EXEC usage
        const execFormula = parameters.length > 0
            ? `=${execEnv}(${codeRef}, ${parameters.map((_, i) => `arg${i + 1}`).join(', ')})`
            : `=${execEnv}(${codeRef})`;

        // Extract Excel demo
        const excelDemoMatch = rawCode.match(/^# Excel usage:\s*(.+?)$/m);
        const excelExample = excelDemoMatch
            ? excelDemoMatch[1].trim()
            : null;

        // Build execExample by converting any existing example to use EXEC format
        let execExample = null;
        if (excelExample) {
            execExample = excelExample.replace(
                new RegExp(`=${name.toUpperCase()}\\((.*?)\\)`, 'i'),
                `=${execEnv}(${codeRef},$1)`
            );
        }

        const result = {
            name,
            signature,
            description,
            code,
            resultLine,
            formula,         // Named lambda formula
            execFormula,     // Direct EXEC formula
            execExample,     // Example using EXEC format
            timestamp,
            uid,
            excelExample,    // Original example
            parameters  // Add parameters to the result
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