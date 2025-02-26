import * as React from "react";

const FunctionDialog = ({
    isOpen,
    onClose,
    selectedFunction
}) => {
    const [selectedCell, setSelectedCell] = React.useState("");
    const [functionArgs, setFunctionArgs] = React.useState({});
    const [error, setError] = React.useState("");
    const [isSelectingRange, setIsSelectingRange] = React.useState(false);
    const [selectingParamName, setSelectingParamName] = React.useState(null);

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
        setError(""); // Clear error when user makes changes
    };

    const toggleRangeSelection = async (paramName) => {
        try {
            if (isSelectingRange) {
                // End range selection
                setIsSelectingRange(false);
                setSelectingParamName(null);
                await Excel.run(async (context) => {
                    // Get the selected range
                    const range = context.workbook.getSelectedRange();
                    range.load("address");
                    await context.sync();
                    const address = range.address.split("!")[1]; // Remove sheet name
                    handleArgumentChange(selectingParamName, address);
                });
            } else {
                // Start range selection
                setIsSelectingRange(true);
                setSelectingParamName(paramName);
            }
        } catch (error) {
            setError(error.message);
        }
    };

    // Add selection change handler
    React.useEffect(() => {
        if (!isSelectingRange) return;

        const handleSelectionChange = async () => {
            try {
                await Excel.run(async (context) => {
                    const range = context.workbook.getSelectedRange();
                    range.load("address");
                    await context.sync();
                    const address = range.address.split("!")[1];
                    handleArgumentChange(selectingParamName, address);
                });
            } catch (error) {
                console.error("Selection change error:", error);
            }
        };

        Office.context.document.addHandlerAsync(
            Office.EventType.DocumentSelectionChanged,
            handleSelectionChange
        );

        return () => {
            Office.context.document.removeHandlerAsync(
                Office.EventType.DocumentSelectionChanged,
                handleSelectionChange
            );
        };
    }, [isSelectingRange, selectingParamName]);

    const handleSubmit = async () => {
        if (!selectedFunction || !selectedCell) return;

        try {
            // Validate required arguments
            const missingArgs = (selectedFunction.parameters || [])
                .filter(p => !p.has_default && !functionArgs[p.name]);

            if (missingArgs.length > 0) {
                setError(`Missing required arguments: ${missingArgs.map(p => p.name).join(", ")}`);
                return;
            }

            await Excel.run(async (context) => {
                const range = context.workbook.worksheets.getActiveWorksheet().getRange(selectedCell);

                // Construct function call with proper argument handling
                const args = (selectedFunction.parameters || []).map(param => {
                    const value = functionArgs[param.name];
                    if (!value && param.has_default) return '""'; // Empty string for optional params
                    if (!value) return ""; // Empty string for missing required params (shouldn't happen due to validation)

                    // If value looks like a cell reference (A1, $B$2, etc), don't wrap in quotes
                    const isCellRef = /^\$?[A-Za-z]+\$?\d+$/.test(value) ||
                        /^[A-Za-z]+\d+:[A-Za-z]+\d+$/.test(value);
                    return isCellRef ? value : `"${value}"`;
                }).join(",");

                const formula = `=${selectedFunction.name.toUpperCase()}(${args})`;
                range.formulas = [[formula]];
                await context.sync();
            });

            onClose();
        } catch (error) {
            setError(error.message);
            console.error("Error inserting function:", error);
        }
    };

    if (!isOpen || !selectedFunction) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <h2 className="text-xl mb-4">Insert Function: {selectedFunction.name}</h2>

                <div className="mb-4">
                    <label className="block mb-2">Selected Cell</label>
                    <input
                        type="text"
                        value={selectedCell}
                        readOnly
                        className="w-full px-2 py-1 border rounded bg-gray-100"
                    />
                </div>

                <div className="mb-4 p-2 bg-gray-50 rounded">
                    <h3 className="font-bold">{selectedFunction.signature}</h3>
                    {selectedFunction.description && (
                        <p className="text-sm text-gray-600 mt-1">{selectedFunction.description}</p>
                    )}
                </div>

                <div className="mb-4">
                    <h3 className="font-bold mb-2">Arguments</h3>
                    {(selectedFunction.parameters || []).map((param, index) => (
                        <div key={`${param.name}-${index}`} className="mb-2">
                            <label className="block mb-1">
                                {param.name}
                                {!param.has_default && <span className="text-red-500">*</span>}
                                {param.has_default && <span className="text-gray-500"> (optional)</span>}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={functionArgs[param.name] || ""}
                                    onChange={(e) => handleArgumentChange(param.name, e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded"
                                    placeholder={`Enter value or cell reference${param.has_default ? ' (optional)' : ''}`}
                                />
                                <button
                                    onClick={() => toggleRangeSelection(param.name)}
                                    className={`px-2 py-1 border rounded ${isSelectingRange && selectingParamName === param.name
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {isSelectingRange && selectingParamName === param.name ? '✓' : '📑'}
                                </button>
                            </div>
                        </div>
                    ))}
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
            </div>
        </div>
    );
};

export default FunctionDialog;
