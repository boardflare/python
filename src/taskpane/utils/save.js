import { pyLogs } from './logs';
import { saveFunctionToSettings, saveFunctionWithDelay } from './workbookSettings';
import { updateNameManager } from './nameManager';
import { saveFile, formatAsNotebook, TokenExpiredError } from './drive';
import { EventTypes } from './constants';

export async function saveWorkbookOnly(parsedFunction) {
    try {
        // First save the function to settings
        try {
            // Try the standard method, without delay
            await saveFunctionToSettings(parsedFunction);
        } catch (saveError) {
            // Only retry with delay if we have the specific cell edit mode error code
            if (saveError.code === "InvalidOperationInCellEditMode") {
                try {
                    // Dispatch event to notify user to exit cell edit mode
                    window.dispatchEvent(new CustomEvent(EventTypes.SAVE, {
                        detail: {
                            type: "error",
                            message: saveError.message
                        }
                    }));

                    // Then try the method with delayForCellEdit
                    await saveFunctionWithDelay(parsedFunction);

                    // Dispatch event to clear the error message
                    window.dispatchEvent(new CustomEvent(EventTypes.SAVE, {
                        detail: {
                            type: "clear"
                        }
                    }));
                } catch (delayError) {
                    // Both methods failed
                    pyLogs({ message: delayError.message, code: parsedFunction.name, ref: "saveFunctionWithDelay_failed" });
                    throw delayError; // Re-throw to be caught by outer catch
                }
            } else {
                // For other errors, don't try the delay method
                throw saveError; // Re-throw to be caught by outer catch
            }
        }

        // Now try to update the name manager
        try {
            await updateNameManager(parsedFunction);
            parsedFunction.noName = false; // Reset noName flag if name is updated successfully
        } catch (nameErr) {
            parsedFunction.noName = true;
            await saveFunctionToSettings(parsedFunction); // No need to retry with delay because cell editing mode would have been cleared above.

            pyLogs({
                message: `Message: ${nameErr.message}  Code:${nameErr?.code}`,
                code: parsedFunction.formula,
                ref: 'saved_as_noname'
            });
        }
        pyLogs({
            message: `${parsedFunction.name} saved to workbook`,
            code: parsedFunction.code,
            ref: 'save_workbook_success'
        });
    } catch (error) {
        pyLogs({ message: `Message: ${error.message}  Code:${error?.code}`, code: parsedFunction.code, ref: 'save_workbook_error' });
        throw error;
    }

    return parsedFunction;
}

export async function saveToOneDriveOnly(parsedFunction) {
    const notebook = formatAsNotebook(parsedFunction);
    try {
        await saveFile(notebook, `${parsedFunction.name}.ipynb`);
        pyLogs({ message: `[OneDrive] Successfully saved ${parsedFunction.name}.ipynb`, code: parsedFunction.code, ref: 'onedrive_save_success' });
    } catch (error) {
        if (!(error instanceof TokenExpiredError)) {
            pyLogs({ message: `[OneDrive] Error saving file: ${error.message},  Code:${error?.code}`, code: JSON.stringify(error), ref: 'onedrive_save_error' });
            throw new Error(`There was an error saving to OneDrive. Try saving again. Error: ${error.message}`);
        }
        throw error;
    }
    return parsedFunction;
}
