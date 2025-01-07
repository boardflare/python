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

            // Calculate total columns needed (3 columns per test case: 1 for data, 2 for gap)
            const test_cases = parsedCode.test_cases || [];
            const totalColumns = Math.max(test_cases.length * 3, 1); // Ensure at least 1 column

            // Add explanation text in first column then merge
            const explanationRange = sheet.getRangeByIndexes(0, 0, 1, 1);
            explanationRange.values = [[`Example invocations of the ${parsedCode.name.toUpperCase()} function based on the test_cases array are shown below. If a test case returns an array more than two columns wide, use it as your last test case, otherwise you will get a #SPILL! error.  This sheet is overwritten on each save. `]];
            explanationRange.format.fill.color = "#FFFFE0";

            // Merge cells first
            if (totalColumns > 1) {
                sheet.getRangeByIndexes(0, 0, 1, totalColumns).merge();
            }

            // Set wrap text adjust row height
            explanationRange.format.wrapText = true;
            explanationRange.format.rowHeight = 40;
            explanationRange.format.verticalAlignment = 'Top';

            // Create header row with proper dimensions
            const headerValues = [];
            for (let i = 0; i < totalColumns; i++) {
                headerValues.push(i % 3 === 0 ? `Example ${(i / 3) + 1} Result` : "");
            }
            const headerRange = sheet.getRangeByIndexes(1, 0, 1, totalColumns);
            headerRange.values = [headerValues];

            // Format headers and set column widths
            test_cases.forEach((_, index) => {
                const columnIndex = index * 3;
                // Set width for test case column using proper Excel API method
                const columnRange = sheet.getRangeByIndexes(0, columnIndex, 1, 1);
                columnRange.format.columnWidth = 200;

                const exampleHeaderRange = sheet.getRangeByIndexes(1, columnIndex, 1, 1);
                exampleHeaderRange.format.fill.color = "#D9D9D9";
                exampleHeaderRange.format.font.bold = true;
                exampleHeaderRange.format.borders.getItem('EdgeBottom').style = 'Continuous';
            });

            if (test_cases.length > 0) {
                context.workbook.application.suspendApiCalculationUntilNextSync();

                test_cases.forEach((test_case, index) => {
                    const columnIndex = index * 3;
                    const args = Array.isArray(test_case) ? test_case : [test_case];
                    const formattedArgs = args.map(arg => {
                        if (typeof arg === 'string') return `"${arg}"`;
                        if (Array.isArray(arg)) {
                            if (Array.isArray(arg[0])) {
                                // Handle 2D arrays using Excel array constant syntax
                                return `{${arg.map(row => row.join(',')).join(';')}}`;
                            }
                            // Handle 1D arrays
                            return `{${arg.join(',')}}`;
                        }
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

        } catch (error) {
            console.error("Excel API Error:", error);
            throw error;
        }
    }).catch(error => {
        console.error("Failed to update demo sheet:", error);
        throw error;
    });
}