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

            // Calculate total columns needed (3 columns per example: 1 for data, 2 for gap)
            const examples = parsedCode.examples || [];
            const totalColumns = Math.max(examples.length * 3, 1); // Ensure at least 1 column

            // Add explanation text in first column then merge
            const explanationRange = sheet.getRangeByIndexes(0, 0, 1, 1);
            explanationRange.values = [[`Example invocations of the ${parsedCode.name.toUpperCase()} function based on the examples array. This sheet is overwritten on each save.`]];
            // explanationRange.format.wrapText = true;
            explanationRange.format.fill.color = "#FFFFE0";

            // Merge after setting the value
            if (totalColumns > 1) {
                sheet.getRangeByIndexes(0, 0, 1, totalColumns).merge();
            }

            // Create header row with proper dimensions
            const headerValues = [];
            for (let i = 0; i < totalColumns; i++) {
                headerValues.push(i % 3 === 0 ? `Example ${(i / 3) + 1} Result` : "");
            }
            const headerRange = sheet.getRangeByIndexes(1, 0, 1, totalColumns);
            headerRange.values = [headerValues];

            // Format headers and set column widths
            examples.forEach((_, index) => {
                const columnIndex = index * 3;
                // Set width for example column using proper Excel API method
                const columnRange = sheet.getRangeByIndexes(0, columnIndex, 1, 1);
                columnRange.format.columnWidth = 200;

                const exampleHeaderRange = sheet.getRangeByIndexes(1, columnIndex, 1, 1);
                exampleHeaderRange.format.fill.color = "#D9D9D9";
                exampleHeaderRange.format.font.bold = true;
                exampleHeaderRange.format.borders.getItem('EdgeBottom').style = 'Continuous';
            });

            if (examples.length > 0) {
                context.workbook.application.suspendApiCalculationUntilNextSync();

                examples.forEach((example, index) => {
                    const columnIndex = index * 3;
                    const args = Array.isArray(example) ? example : [example];
                    const formattedArgs = args.map(arg => {
                        if (typeof arg === 'string') return `"${arg}"`;
                        if (Array.isArray(arg)) return `{${arg.join(';')}}`;
                        return arg;
                    });
                    // Ensure formula is in 2D array format
                    const formula = [[`=${parsedCode.name.toUpperCase()}(${formattedArgs.join(', ')})`]];

                    const dataRange = sheet.getRangeByIndexes(2, columnIndex, 1, 1);
                    dataRange.values = formula;
                    dataRange.format.wrapText = true;
                });
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