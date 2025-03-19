import { execPython } from "../../functions/exec/controller";
import { pyLogs } from './logs';
import { getExecEnv } from './constants';
import astParserCode from './astParser.py';

async function testSeparator(context) {
    const separatorTestName = "SEPARATORTEST";
    let separator = null;
    let namedItem;

    try {
        const worksheet = context.workbook.worksheets.getActiveWorksheet();
        namedItem = worksheet.names.getItemOrNullObject(separatorTestName);
        await context.sync();

        if (!namedItem.isNullObject) {
            namedItem.delete();
            await context.sync();
        }

        try {
            const refersToFormula = "=SUM(1,2)";
            namedItem = worksheet.names.add(separatorTestName, refersToFormula);
            await context.sync();
            namedItem.delete();
            await context.sync();
            separator = ",";
        } catch {
            separator = ";";
        }

        pyLogs({
            code: separator,
            ref: 'separator_test'
        });

        return separator;
    } catch (error) {
        pyLogs({
            message: error.message,
            ref: 'separator_test_error'
        });
        return ",";  // Default to comma if test fails
    }
}

export async function parsePython(rawCode) {
    try {
        // Test for correct separator at the start
        const separator = await Excel.run(async context => {
            return await testSeparator(context);
        });

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

        // Excel named lambda formula with ISOMITTED handling - now using detected separator
        const paramFormula = parameters.map((param, index) => {
            if (param.has_default) {
                return `IF(ISOMITTED(${param.name})${separator} "__OMITTED__"${separator} ${param.name})`
            }
            return param.name;
        }).join(separator);

        const timestamp = new Date().toISOString();
        const uid = "anonymous";
        const codeRef = `"${name}"`;
        const formula = parameters.length > 0
            ? `=LAMBDA(${parameters.map(p => p.has_default ? `[${p.name}]` : p.name).join(separator)}${separator} ${execEnv}(${codeRef}${separator}${paramFormula}))`
            : `=LAMBDA(${execEnv}(${codeRef}))`;

        // Build the execFormula for direct EXEC usage
        const execFormula = parameters.length > 0
            ? `=${execEnv}(${codeRef}, ${parameters.map((_, i) => `arg${i + 1}`).join(',')})`
            : `=${execEnv}(${codeRef})`;

        // Extract Excel demo.  Strangely, when global separator is ";", and formula contains an array constant as a parameter, the formula must use commas!  WTF?
        const excelDemoMatch = rawCode.match(/^# Excel usage:\s*(.+?)$/m);
        const excelExample = excelDemoMatch
            ? excelDemoMatch[1].trim()
            : null;

        // Build execExample by converting any existing example to use EXEC format
        let execExample = null;
        if (excelExample) {
            execExample = excelExample.replace(
                new RegExp(`=${name.toUpperCase()}\\((.*?)\\)`, 'i'),
                (match, args) => `=${execEnv}(${codeRef}, ${args.split(separator).join(',')})`
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
            message: error.message,
            code: rawCode,
            ref: 'codeparser_error'
        })
        throw error;
    }
}