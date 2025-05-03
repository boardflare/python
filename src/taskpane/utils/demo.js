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

export async function testCasesDemo(func) {
    return Excel.run(async (context) => {
        let sheet;
        try {
            // Create sheet name based on function name
            const sheetName = sanitizeSheetName(func.name.toUpperCase());
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

            let startRow = 0;
            for (const test of func.test_cases || []) {
                const argNames = Object.keys(test.arguments || {});
                const argCount = argNames.length;
                let maxArgRows = 1;
                // Determine the max number of rows for any argument (for 2D arrays)
                argNames.forEach(arg => {
                    const val = test.arguments[arg];
                    if (Array.isArray(val) && Array.isArray(val[0])) {
                        maxArgRows = Math.max(maxArgRows, val.length);
                    } else {
                        maxArgRows = Math.max(maxArgRows, 2); // header + value
                    }
                });

                // --- Insert function signature above arguments ---
                // Use func.signature directly
                const signature = func.signature;
                // Write signature in first 20 columns of the row
                const signatureRange = sheet.getRangeByIndexes(startRow, 0, 1, 20);
                signatureRange.values = [[signature, ...Array(19).fill("")]];
                signatureRange.format.font.bold = true;
                signatureRange.format.font.color = "#000000";
                signatureRange.format.font.size = 14;
                signatureRange.format.fill.color = "#E5E7EB"; // Tailwind gray-200
                // Write description in the row below signature
                const descRange = sheet.getRangeByIndexes(startRow + 1, 0, 1, 1);
                descRange.values = [[func.description]];
                // Add a blank row after description
                startRow += 3;

                // Write each argument in its own column, with a blank column between
                let col = 0;
                for (const arg of argNames) {
                    const val = test.arguments[arg];
                    // Write header (capitalize first letter)
                    const header = arg.charAt(0).toUpperCase() + arg.slice(1);
                    const headerRange = sheet.getRangeByIndexes(startRow, col, 1, 1);
                    headerRange.values = [[header]];
                    headerRange.format.font.bold = true;
                    // Write value(s)
                    if (Array.isArray(val) && Array.isArray(val[0])) {
                        // 2D array
                        const dataRange = sheet.getRangeByIndexes(startRow + 1, col, val.length, val[0].length);
                        dataRange.values = val;
                    } else {
                        // Single value
                        const dataRange = sheet.getRangeByIndexes(startRow + 1, col, 1, 1);
                        dataRange.values = [[val]];
                    }
                    col += 2; // leave a blank column between arguments
                }

                // Sync to ensure data is written
                await context.sync();

                // Find the last used row in this test case's argument block
                let lastArgRow = startRow;
                for (const arg of argNames) {
                    const val = test.arguments[arg];
                    if (Array.isArray(val) && Array.isArray(val[0])) {
                        lastArgRow = Math.max(lastArgRow, startRow + val.length);
                    } else {
                        lastArgRow = Math.max(lastArgRow, startRow + 2);
                    }
                }

                // Write the output heading above the formula
                const outputHeadingRow = lastArgRow + 1;
                const outputHeadingRange = sheet.getRangeByIndexes(outputHeadingRow, 0, 1, 1);
                outputHeadingRange.values = [["Output"]];
                outputHeadingRange.format.font.bold = true;
                outputHeadingRange.format.fill.color = "#E0E7FF"; // Tailwind indigo-100

                // Write the formula two rows below the last argument row
                const formulaRow = lastArgRow + 2;
                // Build formula string
                const formulaArgs = argNames.map((arg, idx) => {
                    const colIdx = idx * 2;
                    const val = test.arguments[arg];
                    if (Array.isArray(val) && Array.isArray(val[0])) {
                        // Range reference
                        const colLetter = String.fromCharCode(65 + colIdx);
                        const start = `${colLetter}${startRow + 2}`;
                        const end = `${String.fromCharCode(65 + colIdx + val[0].length - 1)}${startRow + 1 + val.length}`;
                        return `${colLetter}${startRow + 2}:${String.fromCharCode(65 + colIdx + val[0].length - 1)}${startRow + 1 + val.length}`;
                    } else {
                        // Single cell reference
                        const colLetter = String.fromCharCode(65 + colIdx);
                        return `${colLetter}${startRow + 2}`;
                    }
                });
                const formula = `=${func.name.toUpperCase()}(${formulaArgs.join(', ')})`;
                const formulaCell = sheet.getRangeByIndexes(formulaRow, 0, 1, 1);
                formulaCell.values = [[formula]];
                formulaCell.format.font.bold = true;
                formulaCell.format.font.color = "#1D4ED8";

                // Add a blank row after the formula for spacing before next test case
                startRow = formulaRow + 2;
            }

            // Do not auto-fit columns (removed)
            // sheet.getUsedRange().format.autofitColumns();
            sheet.activate();
            await context.sync();
        } catch (error) {
            if (sheet) {
                try {
                    const errorRange = sheet.getRangeByIndexes(1, 1, 1, 1);
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
        console.error("Failed to update test cases sheet:", error);
        throw error;
    });
}