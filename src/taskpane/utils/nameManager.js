export async function updateNameManager(parsedCode) {

    // Convert name to uppercase for Excel
    const excelName = parsedCode.name.toUpperCase();
    console.log("Name manager props:", excelName, parsedCode.formula);

    return Excel.run(async (context) => {
        // Get named item or null object
        const namedItem = context.workbook.names.getItemOrNullObject(excelName);
        namedItem.load(['formula', 'comment', 'isNullObject']);
        await context.sync();

        if (namedItem.isNullObject) {
            // Create new name if it doesn't exist
            const newNamedItem = context.workbook.names.add(excelName, parsedCode.formula);
            await context.sync();
            newNamedItem.visible = true;
            if (parsedCode.description) {
                newNamedItem.comment = parsedCode.description;
            }
        } else {
            // Update existing name if formula is different
            if (namedItem.formula !== parsedCode.formula) {
                namedItem.formula = parsedCode.formula;
            }
            namedItem.visible = true;
            if (parsedCode.description && parsedCode.description !== namedItem.comment) {
                namedItem.comment = parsedCode.description;
            }
        }

        await context.sync();
    });
}