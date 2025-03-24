import { pyLogs } from './logs';
import { saveFunctionToSettings } from './workbookSettings';
import { updateNameManager } from './nameManager';
import { saveFile, formatAsNotebook, TokenExpiredError } from './drive';

export async function saveWorkbookOnly(parsedFunction) {
    try {
        await saveFunctionToSettings(parsedFunction);
        try {
            await updateNameManager(parsedFunction);
            parsedFunction.noName = false; // Reset noName flag if name is updated successfully
        } catch (nameErr) {
            parsedFunction.noName = true;
            await saveFunctionToSettings(parsedFunction); // Update settings with noName flag
            pyLogs({
                message: `[NameManager] Error: ${nameErr.message}`,
                code: parsedFunction.formula,
                ref: 'saved_as_noname'
            });
        }
        pyLogs({
            message: `[Save] Function ${parsedFunction.name} saved to workbook`,
            code: parsedFunction.code,
            ref: 'save_workbook_success'
        });
    } catch (err) {
        pyLogs({ message: `[Save] Error saving to workbook: ${err.message}`, code: parsedFunction.code, ref: 'save_workbook_error' });
        throw err;
    }
    return parsedFunction;
}

export async function saveToOneDriveOnly(parsedFunction) {
    const notebook = formatAsNotebook(parsedFunction);
    try {
        await saveFile(notebook, `${parsedFunction.name}.ipynb`);
        pyLogs({ message: `[OneDrive] Successfully saved ${parsedFunction.name}.ipynb`, code: parsedFunction.code, ref: 'onedrive_save_success' });
    } catch (err) {
        if (!(err instanceof TokenExpiredError)) {
            pyLogs({ message: `[OneDrive] Error saving file: ${err.message}`, code: JSON.stringify(err), ref: 'onedrive_save_error' });
            throw new Error(`There was an error saving to OneDrive. Try saving again. Error: ${err.message}`);
        }
        throw err;
    }
    return parsedFunction;
}
