export function parsePython(rawCode) {
    if (typeof rawCode !== 'string') {
        throw new TypeError('Code must be a string');
    }

    // Extract function with handling for type hints
    const functionMatch = rawCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([\s\S]*?)\)(?:\s*->\s*[^:]+)?\s*:/);
    if (!functionMatch) throw new Error("No function definition found");

    const name = functionMatch[1].toLowerCase();
    const params = functionMatch[2].trim();

    // Args parsing to handle type hints
    const args = params.split(',')
        .filter(arg => arg.trim())
        .map(arg => {
            // Extract parameter name without type hint
            const paramMatch = arg.trim().match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*[^=]+)?(?:\s*=.*)?$/);
            return paramMatch ? paramMatch[1].trim() : arg.trim();
        });

    // Extract docstring directly from rawCode
    const docstringMatch = rawCode.match(/^\s*(?:'''|""")([^]*?)(?:'''|""")/m);
    const description = docstringMatch
        ? docstringMatch[1].split('\n')[0].trim().slice(0, 255)
        : 'No description available';

    // Generate resultLine
    const argList = args.map((_, index) => `arg${index + 1}`).join(', ');
    const resultLine = `\n\nresult = ${name.toLowerCase()}(${argList})`;
    const code = rawCode.trim();

    // Determine which runpy environment to use
    let runpyEnv = 'BOARDFLARE.RUNPY';
    if (window.location.hostname === 'localhost') {
        runpyEnv = 'LOCAL.RUNPY';
    }

    // Excel named lambda signature
    const signature = `=${name.toUpperCase()}(${params})`;

    // Excel named lambda formula
    const timestamp = new Date().toISOString();
    const uid = "anonymous";
    const tableRef = `"https://getcode.boardflare.workers.dev/?uid=${uid}&timestamp=${timestamp}&name=${name}&return=code"`;
    const settingsRef = `"workbook-settings:${name}"`;
    const codeRef = settingsRef;
    const formula = `=LAMBDA(${args.join(', ')}, ${runpyEnv}(${codeRef}, ${args.join(', ')}))`;

    return {
        name,
        signature,
        description,
        code,
        resultLine,
        formula,
        timestamp,
        uid
    };
}