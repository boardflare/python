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

            // Set header with single column
            const headerRange = sheet.getRangeByIndexes(0, 0, 1, 1);
            headerRange.values = [["Results"]];

            // Format headers like a table
            headerRange.format.fill.color = "#D9D9D9";
            headerRange.format.font.bold = true;
            headerRange.format.borders.getItem('EdgeBottom').style = 'Continuous';

            // Use parsed examples instead of test cases
            const examples = parsedCode.examples || [];
            if (examples.length > 0) {
                const dataRange = sheet.getRangeByIndexes(1, 0, examples.length, 1);
                const values = examples.map((args, index) => {
                    const formattedArgs = args.map(arg =>
                        typeof arg === 'string' ? `"${arg}"` : arg
                    );
                    const formula = `=${parsedCode.name}(${formattedArgs.join(', ')})`;
                    return [formula];  // Only include the formula
                });

                dataRange.values = values;
                dataRange.format.wrapText = true;
            }

            // Activate the sheet
            sheet.activate();
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