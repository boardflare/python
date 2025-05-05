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

            // --- Write function signature and description at the top ---
            const signature = func.signature;
            const signatureRange = sheet.getRangeByIndexes(0, 0, 1, 20);
            signatureRange.values = [[signature, ...Array(19).fill("")]];
            signatureRange.format.font.bold = true;
            signatureRange.format.font.color = "#000000";
            signatureRange.format.font.size = 14;
            signatureRange.format.fill.color = "#E5E7EB"; // Tailwind gray-200
            // Write description in the row below signature
            const descRange = sheet.getRangeByIndexes(1, 0, 1, 1);
            descRange.values = [[func.description]];
            // Add a blank row after description
            let startRow = 3;

            let exampleIdx = 0;
            for (const test of func.test_cases || []) {
                // Get expected_rows parameter or default to 1 if not specified
                const expectedRows = test.expected_rows || 1;

                // Insert 'Example N:' and description row above each test case (N is a number)
                const exampleLabel = `Example ${exampleIdx + 1}:`;
                const exampleLabelRange = sheet.getRangeByIndexes(startRow, 0, 1, 1);
                exampleLabelRange.values = [[exampleLabel]];
                exampleLabelRange.format.font.bold = true;
                exampleLabelRange.format.fill.color = "#E0E7FF"; // Tailwind indigo-100
                const exampleDescRange = sheet.getRangeByIndexes(startRow, 1, 1, 1);
                exampleDescRange.values = [[test.description || ""]];
                exampleDescRange.format.font.bold = false;
                // Move startRow down for arguments
                startRow += 1;
                exampleIdx++;

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

                // --- Write each argument as a row: name in col 0, value in col 1 ---
                let argRow = startRow;
                for (const arg of argNames) {
                    const val = test.arguments[arg];
                    // Write parameter name as-is (no capitalization)
                    const paramLabel = arg;
                    const paramLabelRange = sheet.getRangeByIndexes(argRow, 0, 1, 1);
                    paramLabelRange.values = [[paramLabel]];
                    // paramLabelRange.format.font.bold = true;
                    // Write value(s) in col 1
                    if (Array.isArray(val) && Array.isArray(val[0])) {
                        // 2D array
                        const dataRange = sheet.getRangeByIndexes(argRow, 1, val.length, val[0].length);
                        dataRange.values = val;
                        argRow += val.length;
                    } else {
                        // Single value
                        const dataRange = sheet.getRangeByIndexes(argRow, 1, 1, 1);
                        dataRange.values = [[val]];
                        argRow += 1;
                    }
                }

                // Sync to ensure data is written
                await context.sync();

                // Find the last used row in this test case's argument block
                let lastArgRow = argRow - 1;

                // --- Write the output label and formula in the next row ---
                const outputRow = lastArgRow + 1;
                const outputLabelRange = sheet.getRangeByIndexes(outputRow, 0, 1, 1);
                outputLabelRange.values = [["Output"]];
                outputLabelRange.format.font.bold = true;
                // Removed fill color from Output label

                // Build formula string using full parameter list (logic unchanged)
                const paramList = func.parameters || [];
                let lastProvidedIdx = -1;
                paramList.forEach((param, idx) => {
                    if (argNames.includes(param.name)) {
                        lastProvidedIdx = idx;
                    }
                });
                let formula = `=${func.name.toUpperCase()}(`;
                for (let i = 0; i <= lastProvidedIdx; i++) {
                    if (i > 0) formula += ', ';
                    const param = paramList[i];
                    const testArgIdx = argNames.indexOf(param.name);
                    if (testArgIdx !== -1) {
                        // Argument provided in test case
                        // Find the row for this argument
                        let rowOffset = 0;
                        for (let j = 0; j < testArgIdx; j++) {
                            const prevVal = test.arguments[argNames[j]];
                            if (Array.isArray(prevVal) && Array.isArray(prevVal[0])) {
                                rowOffset += prevVal.length;
                            } else {
                                rowOffset += 1;
                            }
                        }
                        const val = test.arguments[param.name];
                        if (Array.isArray(val) && Array.isArray(val[0])) {
                            // Range reference
                            const startRowIdx = startRow + rowOffset;
                            const colLetter = String.fromCharCode(66); // column B
                            const endRowIdx = startRow + rowOffset + val.length - 1;
                            const endColLetter = String.fromCharCode(66 + val[0].length - 1);
                            formula += `${colLetter}${startRow + rowOffset + 1}:${endColLetter}${endRowIdx + 1}`;
                        } else {
                            // Single cell reference
                            const rowIdx = startRow + rowOffset;
                            const colLetter = String.fromCharCode(66); // column B
                            formula += `${colLetter}${rowIdx + 1}`;
                        }
                    }
                }
                formula += ')';
                // Write formula in col 1 of output row
                const formulaCell = sheet.getRangeByIndexes(outputRow, 1, 1, 1);
                formulaCell.values = [[formula]];
                // Remove bold formatting from output formula
                formulaCell.format.font.bold = false;
                formulaCell.format.font.color = "#000000";

                // Add space for the expected output rows plus two empty rows for spacing
                startRow = outputRow + expectedRows + 2;
            }

            // Set the first column (A) width to 24 after all content is written
            sheet.getRange("A:A").format.columnWidth = 70;
            await context.sync();

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