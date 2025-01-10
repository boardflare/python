export const remoteFunctions = async () => {
    const response = await fetch('https://functions.boardflare.com/notebooks/simple/single.ipynb');
    const notebook = await response.json();
    const codeCells = notebook.cells.filter(cell => cell.cell_type === 'code').slice(1);

    const allFunctions = codeCells.map(cell => {
        const code = cell.source.join('');
        const output = cell.outputs?.[0]?.text || [];
        const excelExample = output.find(line => line.includes('Excel:')).split('Excel: ')[1].trim();

        return { code, excel_example: excelExample };
    });

    return allFunctions;
};