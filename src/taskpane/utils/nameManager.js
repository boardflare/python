import { pyLogs } from './logs';

export async function updateNameManager(parsedCode) {
    try {
        const excelName = parsedCode.name.toUpperCase();

        return await Excel.run(async (context) => {
            const namedItem = context.workbook.names.getItemOrNullObject(excelName);
            namedItem.load(['formula', 'comment', 'isNullObject']);
            await context.sync();

            if (namedItem.isNullObject) {
                let newNamedItem;
                try {
                    // First create the name
                    newNamedItem = context.workbook.names.add(excelName, parsedCode.formula);
                    await context.sync();
                } catch (createError) {
                    throw new Error(`Failed to create name '${excelName}': ${createError.message}`);
                }

                try {
                    // Then set its properties
                    newNamedItem.visible = true;
                    if (parsedCode.description) {
                        newNamedItem.comment = parsedCode.description;
                        await context.sync();
                    }
                } catch (descriptionError) {
                    throw new Error(`Created name '${excelName}' but failed to set description: ${descriptionError.message}`);
                }
            } else {
                // Update existing name if needed
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
    } catch (error) {
        console.error("Name manager error:", error);
        await pyLogs({
            errorMessage: error.message,
            code: JSON.stringify(parsedCode) || null,
            ref: 'nameManager_error'
        });
        throw error;
    }
}