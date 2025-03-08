export function sanitizeSheetName(name) {
    // Excel worksheet name constraints
    const MAX_LENGTH = 31;
    const INVALID_CHARS = /[\[\]:*?\/\\]/g;
    const DEFAULT_NAME = "Demo_Sheet";

    // Handle invalid or empty input
    if (!name || typeof name !== 'string') {
        return DEFAULT_NAME;
    }

    // Remove invalid characters and trim spaces
    let sanitized = name.trim().replace(INVALID_CHARS, '');

    // If empty after sanitization, use default
    if (sanitized.length === 0) {
        return DEFAULT_NAME;
    }

    // Truncate if too long
    if (sanitized.length > MAX_LENGTH) {
        sanitized = sanitized.substring(0, MAX_LENGTH);
    }

    return sanitized;
}

// Remove the insertWorksheetFromBase64 function from here

export async function singleDemo(parsedCode) {
    return Excel.run(async (context) => {
        let sheet;
        try {
            // Create sheet name based on function name
            const sheetName = sanitizeSheetName(parsedCode.name.toUpperCase());
            sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            await context.sync();

            // If sheet exists, delete it and recreate
            if (!sheet.isNullObject) {
                sheet.delete();
                await context.sync();
            }

            // Create new sheet
            sheet = context.workbook.worksheets.add(sheetName);
            await context.sync();

            // Add "Function:" label in A1
            const functionLabelRange = sheet.getRangeByIndexes(0, 0, 1, 1);
            functionLabelRange.values = [["Function:"]];
            functionLabelRange.format.font.bold = true;

            // Add function signature in B1
            const signatureRange = sheet.getRangeByIndexes(0, 1, 1, 1);
            signatureRange.values = [[parsedCode.signature]];
            signatureRange.format.verticalAlignment = 'Top';

            // Add "Description:" label in A2
            const descLabelRange = sheet.getRangeByIndexes(1, 0, 1, 1);
            descLabelRange.values = [["Description:"]];
            descLabelRange.format.font.bold = true;

            // Add description in B2
            const descRange = sheet.getRangeByIndexes(1, 1, 1, 1);
            descRange.values = [[parsedCode.description]];
            descRange.format.verticalAlignment = 'Top';

            // Add "Example:" label in A4
            const exampleLabelRange = sheet.getRangeByIndexes(3, 0, 1, 1);
            exampleLabelRange.values = [["Example:"]];
            exampleLabelRange.format.font.bold = true;

            try {
                // Add excelExample code to cell B4
                const codeRange = sheet.getRangeByIndexes(3, 1, 1, 1);
                codeRange.values = [[parsedCode.excelExample]];
                await context.sync();
            } catch (exampleError) {
                // Retry with semicolons instead of commas
                try {
                    const modifiedExample = parsedCode.excelExample.replace(/,/g, ';');
                    const codeRange = sheet.getRangeByIndexes(3, 1, 1, 1);
                    codeRange.values = [[modifiedExample]];
                    await context.sync();
                } catch (retryError) {
                    // If both attempts fail, write error message to B4
                    const errorRange = sheet.getRangeByIndexes(3, 1, 1, 1);
                    errorRange.values = [[`Error in example code: ${exampleError.message}`]];
                    errorRange.format.fill.color = "#FFE0E0";
                    console.error("Failed to add example code:", exampleError);
                }
            }

            // Set column widths
            sheet.getRange("A:A").format.columnWidth = 70;
            // sheet.getRange("B:B").format.columnWidth = 300;

            // Activate the sheet
            sheet.activate();
            await context.sync();
        } catch (error) {
            if (sheet) {
                try {
                    const errorRange = sheet.getRangeByIndexes(2, 1, 1, 1);
                    errorRange.values = [[`An error occurred: ${error.message}`]];
                    errorRange.format.fill.color = "#FFE0E0";
                    await context.sync();
                } catch (writeError) {
                    console.error("Failed to write error message to sheet:", writeError);
                }
            }
            console.error("Excel API Error:", error);
            throw error;
        }
    }).catch(error => {
        console.error("Failed to update demo sheet:", error);
        throw error;
    });
}

export async function multiDemo(parsedFunctions, sheetName = "ExampleFunctions") {
    return Excel.run(async (context) => {
        try {
            sheetName = sanitizeSheetName(sheetName);
            let sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            await context.sync();

            // If sheet exists, delete it
            if (!sheet.isNullObject) {
                sheet.delete();
                await context.sync();
            }

            // Create new sheet
            sheet = context.workbook.worksheets.add(sheetName);
            await context.sync();

            // Add explanation row using getRangeByIndexes for valid syntax
            const explanationRange = sheet.getRangeByIndexes(0, 0, 1, 3);
            explanationRange.merge();
            explanationRange.getCell(0, 0).values = [["Note that you will see #BUSY! for a few seconds on the first use of a function, subsequent uses will be much faster."]];
            explanationRange.format.fill.color = "#FFFFE0";
            explanationRange.format.horizontalAlignment = "Center";

            // Add header row just below the explanation row
            const headerRange = sheet.getRangeByIndexes(1, 0, 1, 3);
            headerRange.values = [["Function", "Description", "Example Use"]];
            headerRange.format.fill.color = "#D9D9D9";
            headerRange.format.font.bold = true;

            for (const [index, parsedFunction] of parsedFunctions.entries()) {
                const dataRow = index + 2;
                const functionRange = sheet.getRange(`A${dataRow + 1}`);
                const descriptionRange = sheet.getRange(`B${dataRow + 1}`);
                const exampleRange = sheet.getRange(`C${dataRow + 1}`);

                functionRange.values = [[parsedFunction.signature]];
                descriptionRange.values = [[parsedFunction.description]];

                try {
                    exampleRange.values = [[parsedFunction.excelExample]];
                    await context.sync();
                } catch (exampleError) {
                    // Retry with semicolons instead of commas
                    try {
                        const modifiedExample = parsedFunction.excelExample.replace(/,/g, ';');
                        exampleRange.values = [[modifiedExample]];
                        await context.sync();
                    } catch (retryError) {
                        exampleRange.values = [[`Error in example: ${exampleError.message}`]];
                        exampleRange.format.fill.color = "#FFE0E0";
                        await context.sync();
                    }
                }
                exampleRange.format.horizontalAlignment = "Left";
            }

            // Set column widths
            sheet.getRange("A:A").format.columnWidth = 250;
            sheet.getRange("B:B").format.columnWidth = 400;
            sheet.getRange("C:C").format.columnWidth = 150;

            sheet.activate();
            await context.sync();

        } catch (error) {
            console.error("Excel API Error:", error);
            throw error;
        }
    }).catch(error => {
        console.error("Failed to create demo sheet:", error);
        throw error;
    });
}