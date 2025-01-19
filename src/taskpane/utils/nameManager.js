import { pyLogs } from './logs';

export async function updateNameManager(parsedCode) {
    try {
        // Convert name to uppercase for Excel
        const excelName = parsedCode.name.toUpperCase();
        console.log("Name manager props:", excelName, parsedCode.formula);

        return await Excel.run(async (context) => {
            try {
                // Get named item or null object
                const namedItem = context.workbook.names.getItemOrNullObject(excelName);
                namedItem.load(['formula', 'comment', 'isNullObject']);
                await context.sync();

                if (namedItem.isNullObject) {
                    try {
                        // Create new name if it doesn't exist
                        const newNamedItem = context.workbook.names.add(excelName, parsedCode.formula);
                        await context.sync();
                        newNamedItem.visible = true;
                        if (parsedCode.description) {
                            newNamedItem.comment = parsedCode.description;
                        }
                    } catch (innerError) {
                        console.error(`Failed to create named item ${excelName}:`, innerError);
                        await pyLogs({
                            errorMessage: innerError.message,
                            code: parsedCode,
                            ref: 'nameManager_create_error'
                        });
                        throw new Error(`Failed to create name '${excelName}': ${innerError.message}`);
                    }
                } else {
                    try {
                        // Update existing name if formula is different
                        if (namedItem.formula !== parsedCode.formula) {
                            namedItem.formula = parsedCode.formula;
                        }
                        namedItem.visible = true;
                        if (parsedCode.description && parsedCode.description !== namedItem.comment) {
                            namedItem.comment = parsedCode.description;
                        }
                    } catch (innerError) {
                        console.error(`Failed to update named item ${excelName}:`, innerError);
                        await pyLogs({
                            errorMessage: innerError.message,
                            code: parsedCode,
                            ref: 'nameManager_update_error'
                        });
                        throw new Error(`Failed to update name '${excelName}': ${innerError.message}`);
                    }
                }

                await context.sync();
            } catch (contextError) {
                console.error("Excel context error:", contextError);
                await pyLogs({
                    errorMessage: contextError.message,
                    code: parsedCode || null,
                    ref: 'nameManager_context_error'
                });
                throw new Error(`Excel operation failed: ${contextError.message}`);
            }
        });
    } catch (error) {
        console.error("Name manager error:", error);
        await pyLogs({
            errorMessage: error.message,
            code: parsedCode || null,
            ref: 'nameManager_error'
        });
        throw error;
    }
}