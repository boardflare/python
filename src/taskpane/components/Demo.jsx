import React from "react";
import { insertWorksheetFromBase64 } from "../utils/demo";
import { parseNotebook } from "../utils/notebooks";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import demoFunctions from '../utils/demo_functions.ipynb';
import { updateNameManager } from "../utils/nameManager";

const demoSheetUrl = new URL("../utils/demo_sheet.xlsx", import.meta.url).href;

async function addFunctionsFromNotebook(notebook) {
    const functions = await parseNotebook(notebook);
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
            await insertWorksheetFromBase64(base64Data);
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
            Add Demo
        </button>
    );
};

export default Demo;