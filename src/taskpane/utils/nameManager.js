import { pyLogs } from './logs';

async function logSeparator(context) {
    const separatorTestName = "SEPARATORTEST";
    let separator;
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
            separator = ",";
        } catch {
            separator = ";";
        } finally {
            if (namedItem) {
                namedItem.delete();
                await context.sync();
            }
        }

        const testExec = CustomFunctions._association.mappings.EXEC.length?.toString()

        await pyLogs({
            errorMessage: `Separator detected as '${separator}'`,
            ref: 'separator_logger',
            code: testExec
        });
    } catch (error) {
        console.error("[Separator Logger]", error);
    }
}

export async function updateNameManager(parsedCode) {
    try {
        const excelName = parsedCode.name.toUpperCase();

        return await Excel.run(async (context) => {
            await logSeparator(context);  // Add back the await

            const namedItem = context.workbook.names.getItemOrNullObject(excelName);
            namedItem.load(['isNullObject']);
            await context.sync();

            // Delete existing name if it exists
            if (!namedItem.isNullObject) {
                try {
                    namedItem.delete();
                    await context.sync();
                } catch (deleteError) {
                    await pyLogs({
                        errorMessage: `[Name Manager] Failed to delete existing name '${excelName}'. Error: ${deleteError.message}`,
                        code: parsedCode.code,
                        ref: 'nameManager_deletion'
                    });
                    throw new Error(`[Name Deletion] Failed to delete existing name '${excelName}'. Error: ${deleteError.message}`);
                }
            }

            let newNamedItem;
            let modifiedFormula;
            try {
                newNamedItem = context.workbook.names.add(excelName, parsedCode.formula);
                await context.sync();
            } catch (createError) {
                try {
                    modifiedFormula = parsedCode.formula.replace(/,/g, ';');
                    newNamedItem = context.workbook.names.add(excelName, modifiedFormula);
                    await context.sync();
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
                throw new Error(`[Description Setting] Name '${excelName}' was created but failed to set description. Description: ${parsedCode.description}. Error: ${descriptionError.message}`);
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
        throw new Error(`Unable to add ${parsedCode.name.toUpperCase()} as named function.  This sometimes occurs due to an issue with Excel.  You can try the following:  1. Copy your code from the editor. 2. Close and reopen the workbook.  3. Paste the code and then click save again.  If the issue persists, please contact support.`);
    }
}