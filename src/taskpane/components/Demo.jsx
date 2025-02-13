import React from "react";
import { multiDemo } from "../utils/demo";
import { parseNotebook } from "../utils/notebooks";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import demoFunctions from '../utils/demo_functions.ipynb';
import { updateNameManager } from "../utils/nameManager";

const demoSheetUrl = new URL("../utils/demo_sheet.xlsx", import.meta.url).href;

// Add the insertWorksheetFromBase64 function here
async function insertWorksheetFromBase64(base64String) {
    try {
        await Excel.run(async (context) => {
            const workbook = context.workbook;
            // Check if DemoFunctions sheet exists
            const sheet = context.workbook.worksheets.getItemOrNullObject('DemoFunctions');
            await context.sync();

            if (!sheet.isNullObject) {
                sheet.delete();
                await context.sync();
            }

            await workbook.insertWorksheetsFromBase64(base64String, {
                formatCell: true,
                includeFormulas: true
            });
            await context.sync();
        });
        return true;
    } catch (error) {
        console.error("Error inserting worksheet:", error);
        throw error;
    }
}

async function addFunctionsFromNotebook(notebook) {
    const functions = await parseNotebook(notebook);
    await multiDemo(functions);
    for (const func of functions) {
        await saveFunctionToSettings(func);
        await updateNameManager(func);
    }
}

const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

const Demo = ({ loadFunctions }) => {
    const handleInsertDemo = async () => {
        try {
            const response = await fetch(demoSheetUrl);
            const blob = await response.blob();
            const base64Data = await convertFileToBase64(blob);
            //await insertWorksheetFromBase64(base64Data);
            await addFunctionsFromNotebook(demoFunctions);
            await loadFunctions();
        } catch (err) {
            console.error('Failed to insert demo sheet:', err);
        }
    };

    return (
        <button
            onClick={handleInsertDemo}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
            Examples
        </button>
    );
};

export default Demo;