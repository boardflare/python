import { pyLogs } from './logs';

export async function updateNameManager(parsedCode) {
    try {
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
                newNamedItem = context.workbook.names.add(excelName, parsedCode.formula);
                await context.sync();
            } catch (createError) {
                const execMapped = CustomFunctions?._association?.mappings?.EXEC?.length?.toString();
                throw new Error(`[Name Creation] Failed to create name '${excelName}'. Formula: ${parsedCode.formula}. Error: ${createError.message}. Exec mapped: ${execMapped}`);
            }

            try {
                newNamedItem.visible = true;
                if (parsedCode.description) {
                    newNamedItem.comment = parsedCode.description;
                    await context.sync();
                }
            } catch (descriptionError) {
                await pyLogs({
                    errorMessage: `[Description Setting] Name '${excelName}' was created but failed to set description. Description: ${parsedCode.description}. Error: ${descriptionError.message}`,
                    code: parsedCode.code,
                    ref: 'nameManager_description_error'
                });
            }

            await context.sync();
        });
    } catch (error) {
        await pyLogs({
            errorMessage: `[Name Manager] ${error.message}`,
            code: parsedCode.code,
            ref: 'nameManager_error'
        });
        throw new Error(`Unable to add ${parsedCode.name.toUpperCase()} as named function. This sometimes occurs due to an issue with Excel. You can try the following: 1. Copy your code from the editor. 2. Close and reopen the workbook. 3. Paste the code and then click save again. If the issue persists, please contact support.`);
    }
}