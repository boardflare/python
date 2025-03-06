import { pyLogs } from './logs';
import { saveFunctionToSettings } from './workbookSettings';
import { updateNameManager } from './nameManager';
import { saveFile, formatAsNotebook, TokenExpiredError } from './drive';

export async function saveFunction(parsedFunction) {
    // Save to settings and name manager first
    try {
        await saveFunctionToSettings(parsedFunction);
        await updateNameManager(parsedFunction);
        pyLogs({ message: `[Save] Function ${parsedFunction.name} saved successfully`, code: parsedFunction.code, ref: 'save_success' });
    } catch (err) {
        pyLogs({ errorMessage: `[Save] Error: ${err.message}`, code: parsedFunction.code, ref: 'save_error' });
        throw err;
    }

    // Then try to save to OneDrive
    const notebook = formatAsNotebook(parsedFunction);
    try {
        await saveFile(notebook, `${parsedFunction.name}.ipynb`);
        pyLogs({ message: `[OneDrive] Successfully saved ${parsedFunction.name}.ipynb`, code: parsedFunction.code, ref: 'onedrive_save_success' });
    } catch (err) {
        if (!(err instanceof TokenExpiredError)) {
            pyLogs({ errorMessage: `[OneDrive] Error saving file: ${err.message}`, code: JSON.stringify(err), ref: 'onedrive_save_error' });
            throw new Error(`There was an error saving to OneDrive. Try saving again, and if the problem persists you can log out and save to workbook only for now.  Error: ${err.message}`);
        }
    }

    return parsedFunction;
}

export async function saveWorkbookOnly(parsedFunction) {
    try {
        await saveFunctionToSettings(parsedFunction);
        await updateNameManager(parsedFunction);
        pyLogs({ message: `[Save] Function ${parsedFunction.name} saved to workbook`, code: parsedFunction.code, ref: 'save_workbook_success' });
        return parsedFunction; // Ensure we return the updated function
    } catch (err) {
        pyLogs({ errorMessage: `[Save] Error saving to workbook: ${err.message}`, code: parsedFunction.code, ref: 'save_workbook_error' });
        throw err;
    }
    return parsedFunction;
}
