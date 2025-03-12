import * as React from "react";
import { execPython } from "../../functions/exec/controller";

const FunctionDialog = ({
    isOpen,
    onClose,
    selectedFunction,
    embedded = false
}) => {
    const [selectedCell, setSelectedCell] = React.useState("");
    const [functionArgs, setFunctionArgs] = React.useState({});
    const [error, setError] = React.useState("");
    const [insertResult, setInsertResult] = React.useState(false);

    // Reset state when dialog opens
    React.useEffect(() => {
        if (isOpen && selectedFunction) {
            setError("");
            setFunctionArgs({});

            // Get selected cell when dialog opens
            Excel.run(async (context) => {
                const range = context.workbook.getSelectedRange();
                range.load("address");
                await context.sync();
                setSelectedCell(range.address.split("!")[1]); // Remove sheet name
            });

            // Initialize arguments with empty strings or default values
            const newArgs = {};
            selectedFunction.parameters?.forEach(param => {
                newArgs[param.name] = "";
            });
            setFunctionArgs(newArgs);
        }
    }, [isOpen, selectedFunction]);

    const handleArgumentChange = (paramName, value) => {
        setFunctionArgs(prev => ({
            ...prev,
            [paramName]: value
        }));
        setError("");
    };

    const handleFocus = async () => {
        try {
            await Excel.run(async (context) => {
                const range = context.workbook.getSelectedRange();
                range.load("address");
                await context.sync();
                const address = range.address.split("!")[1]; // Remove sheet name

                // Get the focused input's parameter name from the event
                const activeElement = document.activeElement;
                if (activeElement.id === 'targetCell') {
                    setSelectedCell(address);
                } else {
                    const paramName = activeElement.getAttribute('data-param');
                    if (paramName) {
                        handleArgumentChange(paramName, address);
                    }
                }
            });
        } catch (error) {
            setError(`Could not get selected range: ${error.message}`);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFunction || !selectedCell) return;

        try {
            const missingArgs = (selectedFunction.parameters || [])
                .filter(p => !p.has_default && !functionArgs[p.name]);

            if (missingArgs.length > 0) {
                setError(`Missing required arguments: ${missingArgs.map(p => p.name).join(", ")}`);
                return;
            }

            await Excel.run(async (context) => {
                const range = context.workbook.worksheets.getActiveWorksheet().getRange(selectedCell);

                if (insertResult) {
                    // Prepare arguments as matrices
                    const argMatrices = [];
                    for (const param of selectedFunction.parameters || []) {
                        const value = functionArgs[param.name];
                        if (!value && param.has_default) {
                            argMatrices.push([[""]]);
                            continue;
                        }

                        const isCellRef = /^\$?[A-Za-z]+\$?\d+$/.test(value) ||
                            /^[A-Za-z]+\d+:[A-Za-z]+\d+$/.test(value);

                        if (isCellRef) {
                            // Get values from the referenced range
                            const argRange = context.workbook.worksheets.getActiveWorksheet().getRange(value);
                            argRange.load("values");
                            await context.sync();
                            argMatrices.push(argRange.values);
                        } else {
                            // Convert scalar value to single-element matrix
                            argMatrices.push([[value]]);
                        }
                    }

                    const result = await execPython({
                        code: selectedFunction.code + selectedFunction.resultLine,
                        arg1: argMatrices
                    });

                    // Resize range if result is a 2D matrix
                    if (Array.isArray(result) && Array.isArray(result[0])) {
                        const numRows = result.length;
                        const numCols = result[0].length;
                        const newRange = range.getResizedRange(numRows - 1, numCols - 1);
                        newRange.values = result;
                    } else {
                        range.values = result;
                    }
                } else {
                    // Original formula insertion code
                    const args = (selectedFunction.parameters || []).map(param => {
                        const value = functionArgs[param.name];
                        if (!value && param.has_default) return '""';
                        if (!value) return "";

                        const isCellRef = /^\$?[A-Za-z]+\$?\d+$/.test(value) ||
                            /^[A-Za-z]+\d+:[A-Za-z]+\d+$/.test(value);
                        return isCellRef ? value : `"${value}"`;
                    }).join(",");

                    const formula = `=${selectedFunction.name.toUpperCase()}(${args})`;
                    range.formulas = [[formula]];
                }
                await context.sync();
            });

            onClose();
        } catch (error) {
            setError(error.message);
            console.error("Error inserting function:", error);
        }
    };

    if (!isOpen) return null;

    if (!selectedFunction.name) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                    <h2 className="text-xl mb-4">No Function Selected</h2>
                    <p className="mb-4">Please select a function to use first.</p>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // For embedded mode, return just the form content without modal wrapper
    const content = (
        <>
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl">Insert function into cell:</h2>
                <input
                    id="targetCell"
                    type="text"
                    value={selectedCell}
                    onChange={(e) => setSelectedCell(e.target.value)}
                    onFocus={handleFocus}
                    className="px-2 py-1 border rounded w-24"
                    placeholder="Select cell"
                />
            </div>

            <div className="mb-4 p-2 bg-gray-50 rounded">
                <h3 className="font-bold">{selectedFunction.signature}</h3>
                {selectedFunction.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedFunction.description}</p>
                )}
            </div>

            <div className="mb-4">
                {(selectedFunction.parameters || []).map((param, index) => (
                    <div key={`${param.name}-${index}`} className="mb-2">
                        <label className="block mb-1">
                            {param.name}
                            {!param.has_default && <span className="text-red-500">*</span>}
                            {param.has_default && <span className="text-gray-500"> (optional)</span>}
                        </label>
                        <input
                            type="text"
                            value={functionArgs[param.name] || ''}
                            onChange={(e) => handleArgumentChange(param.name, e.target.value)}
                            onFocus={handleFocus}
                            data-param={param.name}
                            className="w-full px-2 py-1 border rounded"
                            placeholder={`Select cell(s) first then click here`}
                        />
                    </div>
                ))}
            </div>

            <div className="mb-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={insertResult}
                        onChange={(e) => setInsertResult(e.target.checked)}
                        className="rounded"
                    />
                    <span>Insert result instead of formula</span>
                </label>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!selectedCell}
                >
                    OK
                </button>
            </div>
        </>
    );

    if (embedded) {
        return content;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                {content}
            </div>
        </div>
    );
};

export default FunctionDialog;
