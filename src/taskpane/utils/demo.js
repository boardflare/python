export function sanitizeSheetName(name) {
    // Excel worksheet name constraints
    const MAX_LENGTH = 31;
    const INVALID_CHARS = /[\[\]:*?\/\\]/g;

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