import * as React from "react";

const FunctionDialog = ({
    isOpen,
    onClose,
    selectedFunction
}) => {
    const [selectedCell, setSelectedCell] = React.useState("");
    const [functionArgs, setFunctionArgs] = React.useState({});
    const [error, setError] = React.useState("");
    const [selectionState, setSelectionState] = React.useState({
        isSelecting: false,
        paramName: null,
        handler: null,
        previewValue: null  // Add preview value
    });

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
            const isCurrentlySelecting = selectionState.isSelecting;
            const currentParam = selectionState.paramName;

            // If we're already selecting this parameter, commit the selection
            if (isCurrentlySelecting && currentParam === paramName) {
                // Remove the handler
                if (selectionState.handler) {
                    await Excel.run(async (context) => {
                        context.workbook.onSelectionChanged.remove(selectionState.handler);
                        await context.sync();
                    });
                }

                // Commit the preview value to the actual arguments
                if (selectionState.previewValue) {
                    setFunctionArgs(prev => ({
                        ...prev,
                        [paramName]: selectionState.previewValue
                    }));
                }

                // Reset selection state
                setSelectionState({
                    isSelecting: false,
                    paramName: null,
                    handler: null,
                    previewValue: null
                });
            }
            // If we're selecting a different parameter, switch to it
            else {
                // Clean up existing handler if any
                if (selectionState.handler) {
                    await Excel.run(async (context) => {
                        context.workbook.onSelectionChanged.remove(selectionState.handler);
                        await context.sync();
                    });
                }

                // Set up new handler
                await Excel.run(async (context) => {
                    const handler = context.workbook.onSelectionChanged.add((eventArgs) => {
                        Excel.run(async (innerContext) => {
                            const range = innerContext.workbook.getSelectedRange();
                            range.load("address");
                            await innerContext.sync();
                            const address = range.address.split("!")[1];

                            // Update preview only
                            setSelectionState(prev => ({
                                ...prev,
                                previewValue: address
                            }));
                        });
                    });

                    // Get initial selection
                    const range = context.workbook.getSelectedRange();
                    range.load("address");
                    await context.sync();
                    const address = range.address.split("!")[1];

                    setSelectionState({
                        isSelecting: true,
                        paramName: paramName,
                        handler: handler,
                        previewValue: address
                    });
                });
            }
        } catch (error) {
            setError(`Range selection error: ${error.message}`);
            setSelectionState({
                isSelecting: false,
                paramName: null,
                handler: null,
                previewValue: null
            });
        }
    };

    const setupSelectionHandler = async (paramName) => {
        await Excel.run(async (context) => {
            const handler = context.workbook.onSelectionChanged.add((eventArgs) => {
                Excel.run(async (innerContext) => {
                    const range = innerContext.workbook.getSelectedRange();
                    range.load("address");
                    await innerContext.sync();
                    const address = range.address.split("!")[1];

                    // Only update the specific parameter being selected
                    setFunctionArgs(prev => ({
                        ...prev,
                        [paramName]: address
                    }));
                });
            });

            await context.sync();

            // Initialize with current selection
            const range = context.workbook.getSelectedRange();
            range.load("address");
            await context.sync();
            const address = range.address.split("!")[1];

            setFunctionArgs(prev => ({
                ...prev,
                [paramName]: address
            }));

            setSelectionState({
                isSelecting: true,
                paramName: paramName,
                handler: handler
            });
        });
    };

    const handleFocus = async (paramName) => {
        // Don't start a new selection if we're already selecting for this parameter
        if (selectionState.isSelecting && selectionState.paramName === paramName) {
            return;
        }
        await toggleRangeSelection(paramName);
    };

    const handleBlur = async (paramName, event) => {
        // If we're clicking the selection button, don't end the selection
        if (event.relatedTarget?.getAttribute('data-param') === paramName) {
            return;
        }

        // Only end selection if we're currently selecting this parameter
        if (selectionState.isSelecting && selectionState.paramName === paramName) {
            await toggleRangeSelection(paramName);
        }
    };

    // Clean up the event handler when dialog closes or component unmounts
    React.useEffect(() => {
        if (!isOpen && selectionState.handler) {
            Excel.run(async (context) => {
                context.workbook.onSelectionChanged.remove(selectionState.handler);
                await context.sync();
            }).catch(console.error);
            setSelectionState({
                isSelecting: false,
                paramName: null,
                handler: null
            });
        }

        return () => {
            if (selectionState.handler) {
                Excel.run(async (context) => {
                    context.workbook.onSelectionChanged.remove(selectionState.handler);
                    await context.sync();
                }).catch(console.error);
            }
        };
    }, [isOpen, selectionState.handler]);

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

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <h2 className="text-xl mb-4">Insert function into cell {selectedCell}</h2>
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
                                    value={
                                        (selectionState.isSelecting && selectionState.paramName === param.name)
                                            ? (selectionState.previewValue || '')
                                            : (functionArgs[param.name] || '')
                                    }
                                    onChange={(e) => handleArgumentChange(param.name, e.target.value)}
                                    onFocus={() => handleFocus(param.name)}
                                    onBlur={(e) => handleBlur(param.name, e)}
                                    className={`flex-1 px-2 py-1 border rounded ${selectionState.isSelecting && selectionState.paramName === param.name
                                        ? "border-blue-500 bg-blue-50"
                                        : ""
                                        }`}
                                    placeholder={`Enter value or cell reference${param.has_default ? ' (optional)' : ''}`}
                                />
                                <button
                                    data-param={param.name}
                                    onClick={() => toggleRangeSelection(param.name)}
                                    className={`px-2 py-1 border rounded ${selectionState.isSelecting && selectionState.paramName === param.name
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-gray-100'
                                        }`}
                                    title="Select range"
                                >
                                    {selectionState.isSelecting && selectionState.paramName === param.name ? '✓' : '✏️'}
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
