export function parsePython(rawCode) {
    if (typeof rawCode !== 'string') {
        throw new TypeError('Code must be a string');
    }
    console.log('Parsing code:', rawCode);

    // Remove comments starting with '# Instructions,' and everything after
    const instructionsIndex = rawCode.indexOf('# Instructions,');
    const codeWithoutInstructions = instructionsIndex !== -1 ? rawCode.substring(0, instructionsIndex) : rawCode;

    // Split code at the Demo comment line, knowing there's only one
    const demoCommentPattern = /^\s*#\s*Demo\s*code\.?\s*$/m;
    const [activeCode, demoCode] = codeWithoutInstructions.split(demoCommentPattern);
    if (!activeCode) {
        throw new Error("No valid code found before Demo comment");
    }

    // Generate unique identifiers
    const timestamp = new Date().toISOString();
    const uid = "ANON:" + crypto.randomUUID();

    // Improved function pattern to better handle whitespace
    const functionMatch = activeCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([\s\S]*?)\)\s*:/);
    if (!functionMatch) throw new Error("No function definition found");

    const name = functionMatch[1].toLowerCase();
    const params = functionMatch[2].trim();
    const args = params.split(',').filter(arg => arg.trim());

    // Extract docstring with consistent trimming
    const docstringMatch = activeCode.match(/^\s*(?:'''|""")([^]*?)(?:'''|""")|^\s*["'](.+?)["']/m);
    const description = docstringMatch
        ? (docstringMatch[1] || docstringMatch[2]).trim().slice(0, 255)
        : 'No description available';

    // Parse examples from code - modified to capture complete nested arrays
    const examplesMatch = activeCode.match(/examples\s*=\s*(\[[\s\S]*\](?=\s|$))/);
    let examples = [];
    if (examplesMatch) {
        const exampleStr = examplesMatch[1].trim();
        console.log('Parsing examples:', exampleStr);
        try {
            examples = JSON.parse(exampleStr.replace(/'/g, '"'));
        } catch (e) {
            console.warn('Failed to parse examples:', e);
        }
    }

    // Generate result string
    const argList = args.map((_, index) => `arg${index + 1}`).join(', ');
    const resultLine = `\n\nresult = ${name.toLowerCase()}(${argList})`;
    const code = activeCode.trim() + resultLine;

    // Determine which runpy environment to use
    let runpyEnv = 'BOARDFLARE.RUNPY';
    if (window.location.hostname === 'localhost') {
        runpyEnv = 'LOCAL.RUNPY';
    } else if (window.location.pathname.toLowerCase().includes('preview')) {
        runpyEnv = 'PREVIEW.RUNPY';
    }

    // Create lambda formula with dynamic runpy environment and sheet references
    const signature = `${name}(${params})`;
    const codeRef = `"https://getcode.boardflare.workers.dev/?uid=${uid}&timestamp=${timestamp}&name=${name}&return=code"`;
    const formula = `=LAMBDA(${params}, ${runpyEnv}(${codeRef}, ${params}))`;

    return {
        name,
        signature,
        description,
        code,
        formula,
        timestamp,
        uid,
        demo: demoCode ? demoCode.trim() : null,
        args, // Add args array to returned object
        examples // Add examples array to returned object
    };
}