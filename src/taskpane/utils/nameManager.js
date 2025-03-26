import { pyLogs } from './logs';
import { DEBUG_FLAGS } from './constants';

export async function updateNameManager(parsedCode) {
    // Simulate failure if debug flag is set
    if (DEBUG_FLAGS.FORCE_NAME_MANAGER_FAIL) {
        throw new Error("Simulated name manager failure for testing");
    }

    const excelName = parsedCode.name.toUpperCase();

    return await Excel.run(async (context) => {
        const namedItem = context.workbook.names.getItemOrNullObject(excelName);
        namedItem.load(['isNullObject']);
        await context.sync();

        // Delete existing name if it exists
        if (!namedItem.isNullObject) {
            try {
                namedItem.delete();
                await context.sync();
            } catch (deleteError) {
                throw new Error(`[Name Deletion] Failed to delete existing name '${excelName}'. Error: ${deleteError.message}`);
            }
        }

        let newNamedItem;
        try {
            newNamedItem = context.workbook.names.add(excelName, parsedCode.formula, parsedCode.description);
            await context.sync();
            pyLogs({
                code: parsedCode.formula,
                ref: 'nameManager_add_success',
            });
        } catch (createError) {
            // Retry with semicolons instead of commas
            try {
                const modifiedFormula = parsedCode.formula.replace(/,/g, ';');
                newNamedItem = context.workbook.names.add(excelName, modifiedFormula, parsedCode.description);
                await context.sync();
                pyLogs({
                    code: modifiedFormula,
                    ref: 'nameManager_add_success_retry',
                });
            } catch (retryError) {
                throw new Error(`Failed to create name with retry. Formula: ${parsedCode.formula}. Error: ${retryError.message}.`);
            }
        }
    });
}