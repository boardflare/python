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
                let modifiedFormula; // Added: declare modifiedFormula outside for proper scope
                try {
                    newNamedItem = context.workbook.names.add(excelName, parsedCode.formula);
                    await context.sync();
                } catch (createError) {
                    try {
                        modifiedFormula = parsedCode.formula.replace(/,/g, ';'); // Now assign the value
                        newNamedItem = context.workbook.names.add(excelName, modifiedFormula);
                        await context.sync();
                        // Added log for modified formula success - updated to use parsedCode.code
                        await pyLogs({
                            errorMessage: `[Name Manager] Original formula failed for '${excelName}' with error: ${createError.message}. Modified formula succeeded with formula: ${modifiedFormula}.`,
                            code: parsedCode.code,
                            ref: 'nameManager_modifiedFormula'
                        });
                    } catch (retryError) {
                        throw new Error(`[Name Creation] Failed to create name '${excelName}'. Original formula: ${parsedCode.formula}. Modified formula: ${modifiedFormula}. Error: ${createError.message}`);
                    }
                }

                try {
                    newNamedItem.visible = true;
                    if (parsedCode.description) {
                        newNamedItem.comment = parsedCode.description;
                        await context.sync();
                    }
                } catch (descriptionError) {
                    throw new Error(`[Property Setting] Name '${excelName}' was created but failed to set properties. Description: ${parsedCode.description}. Error: ${descriptionError.message}`);
                }
            } else {
                // Update existing name if needed
                if (namedItem.formula !== parsedCode.formula) {
                    try {
                        namedItem.formula = parsedCode.formula;
                        namedItem.visible = true;
                        await context.sync();
                    } catch (formulaError) {
                        throw new Error(`[Formula Update] Failed to update formula for '${excelName}'. Original formula: ${namedItem.formula}, New formula: ${parsedCode.formula}. Error: ${formulaError.message}`);
                    }
                }

                if (parsedCode.description && parsedCode.description !== namedItem.comment) {
                    try {
                        namedItem.comment = parsedCode.description;
                        await context.sync();
                    } catch (descriptionError) {
                        throw new Error(`[Description Update] Failed to update description for '${excelName}'. Original description: ${namedItem.comment}, New description: ${parsedCode.description}. Error: ${descriptionError.message}`);
                    }
                }
            }

            await context.sync();
        });
    } catch (error) {
        console.error("[Name Manager]", error);
        await pyLogs({
            errorMessage: `[Name Manager] ${error.message}`,
            code: parsedCode.code,
            ref: 'nameManager_error'
        });
        throw error;
    }
}