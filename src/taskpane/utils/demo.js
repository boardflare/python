export async function addDemo(parsedCode) {
    return Excel.run(async (context) => {
        try {
            // Create sheet name based on function name
            const sheetName = `${parsedCode.name}_demo`;
            let sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            await context.sync();

            // If sheet exists, delete it and recreate
            if (!sheet.isNullObject) {
                sheet.delete();
                await context.sync();
            }

            // Create new sheet
            sheet = context.workbook.worksheets.add(sheetName);
            await context.sync();

            // Set column width for Results column
            sheet.getRangeByIndexes(0, 0, 1, 1).format.columnWidth = 300; // Results column

            // Add explanation text in A1
            const explanationRange = sheet.getRangeByIndexes(0, 0, 1, 1);
            explanationRange.values = [[`Below are example invocations of the ${parsedCode.name.toUpperCase()} function. This sheet is overwritten when the function is saved.`]];
            explanationRange.format.wrapText = true;
            explanationRange.format.fill.color = "#FFFFE0"; // Light yellow highlight

            // Set header with single column in A2
            const headerRange = sheet.getRangeByIndexes(1, 0, 1, 1);
            headerRange.values = [["Example Results"]];

            // Format headers like a table
            headerRange.format.fill.color = "#D9D9D9";
            headerRange.format.font.bold = true;
            headerRange.format.borders.getItem('EdgeBottom').style = 'Continuous';

            // Use parsed examples instead of test cases, starting from row 3
            const examples = parsedCode.examples || [];
            console.log('Parsed examples:', examples);
            if (examples.length > 0) {
                context.workbook.application.suspendApiCalculationUntilNextSync();
                const dataRange = sheet.getRangeByIndexes(2, 0, examples.length, 1);
                const values = examples.map(example => {
                    // Always treat example as array of arguments
                    const args = Array.isArray(example) ? example : [example];
                    const formattedArgs = args.map(arg => {
                        if (typeof arg === 'string') return `"${arg}"`;
                        if (Array.isArray(arg)) return `{${arg.join(';')}}`;
                        return arg;
                    });
                    return [`=${parsedCode.name.toUpperCase()}(${formattedArgs.join(', ')})`];
                });

                dataRange.values = values;
                dataRange.format.wrapText = true;
            }

            // Activate the sheet
            sheet.activate();
            await context.sync();
            await context.sync();

        } catch (error) {
            console.error("Excel API Error:", error);
            throw error;
        }
    }).catch(error => {
        console.error("Failed to update demo sheet:", error);
        throw error;
    });
}