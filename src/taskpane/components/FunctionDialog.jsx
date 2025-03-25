import * as React from "react";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import { pyLogs } from '../utils/logs';

const FunctionDialog = ({
    isOpen,
    onClose,
    selectedFunction,
    embedded = false,
    loadFunctions
}) => {
    const [targetCell, setTargetCell] = React.useState("");
    const [functionArgs, setFunctionArgs] = React.useState({});
    const [error, setError] = React.useState("");
    const [activeField, setActiveField] = React.useState(null);
    const [saveArgs, setSaveArgs] = React.useState(true);
    const [rangeValues, setRangeValues] = React.useState({});

    // Reference to store the event handler for cleanup
    const selectionHandlerRef = React.useRef(null);

    // Modify setSelectedCell to use updated validation
    const handleTargetCellChange = (value) => {
        setTargetCell(value);
        setError("");
    };

    // Define the selection changed handler
    const handleSelectionChange = React.useCallback(async (event) => {
        const currentActiveField = activeFieldRef.current;
        if (!currentActiveField) return;

        try {
            await Excel.run(async (context) => {
                const range = context.workbook.getSelectedRange();
                range.load(["address", "worksheet"]);
                await context.sync();

                // Keep the full address including sheet name
                let address = range.address;

                if (currentActiveField === 'targetCell') {
                    handleTargetCellChange(address);
                } else {
                    handleArgumentChange(currentActiveField, address);
                }
            });
        } catch (error) {
            pyLogs({
                message: `[Selection Change] Failed to handle selection change: ${error.message}`,
                code: selectedFunction?.code || 'unknown_function', // Add null check
                ref: 'functionDialog_selection_change'
            });
            console.error("Selection change error:", error);
            setError(`Could not get selected range: ${error.message}`);
        }
    }, []); // Remove activeField dependency

    // Add a ref to track the active field
    const activeFieldRef = React.useRef(null);

    // Update the ref whenever activeField changes
    React.useEffect(() => {
        activeFieldRef.current = activeField;
    }, [activeField]);

    // Setup and cleanup for selection changed event
    React.useEffect(() => {
        if (isOpen && selectedFunction) {
            const setupSelectionHandler = async () => {
                try {
                    await Excel.run(async (context) => {
                        // Register the event at workbook level instead of worksheet
                        Office.context.document.addHandlerAsync(
                            Office.EventType.DocumentSelectionChanged,
                            handleSelectionChange
                        );

                        // Store reference to the current handler for cleanup
                        selectionHandlerRef.current = handleSelectionChange;
                    });
                } catch (error) {
                    console.error("Error setting up selection handler:", error);
                }
            };

            setupSelectionHandler();

            return () => {
                // Remove the selection handler on cleanup
                const removeSelectionHandler = async () => {
                    try {
                        if (selectionHandlerRef.current) {
                            Office.context.document.removeHandlerAsync(
                                Office.EventType.DocumentSelectionChanged,
                                { handler: selectionHandlerRef.current },
                                (result) => {
                                }
                            );
                            selectionHandlerRef.current = null;
                        }
                    } catch (error) {
                        pyLogs({
                            message: `[Selection Handler] Failed to remove selection handler: ${error.message}`,
                            code: selectedFunction.code,
                            ref: 'functionDialog_selection_cleanup'
                        });
                        console.error("Error removing selection handler:", error);
                    }
                };

                removeSelectionHandler();
            };
        }
    }, [isOpen, selectedFunction, handleSelectionChange]);

    // Reset state and get initial cell when dialog opens
    React.useEffect(() => {
        if (isOpen && selectedFunction) {
            setError("");
            setActiveField(null);
            setRangeValues({}); // Reset range values when dialog opens

            // Try to load saved args
            const loadSavedArgs = async () => {
                try {
                    if (selectedFunction?.args) {
                        setFunctionArgs(selectedFunction.args);
                    } else {
                        // Initialize arguments with empty strings or default values
                        const newArgs = {};
                        selectedFunction.parameters?.forEach(param => {
                            newArgs[param.name] = "";
                        });
                        setFunctionArgs(newArgs);
                    }
                } catch (error) {
                    pyLogs({
                        message: `Failed to load arguments: ${error.message}`,
                        code: selectedFunction.code,
                        ref: 'functionDialog_load_args'
                    });
                    console.error("Error loading args:", error);
                }
            };

            loadSavedArgs();
        }
    }, [isOpen, selectedFunction]);

    const handleArgumentChange = async (paramName, value) => {
        setFunctionArgs(prev => ({
            ...prev,
            [paramName]: value
        }));
        setError("");
    };

    // Activate range selection for a specific field
    const handleFocus = (fieldName) => {
        setActiveField(fieldName);
    };

    const handleSubmit = async () => {
        setActiveField(null);
        if (!selectedFunction) return;

        // Check for target cell defined
        if (!targetCell) {
            setError("Target cell is required");
            return;
        }

        try {
            const missingArgs = (selectedFunction.parameters || [])
                .filter(p => !p.has_default && !functionArgs[p.name]);

            if (missingArgs.length > 0) {
                setError(`Missing required arguments: ${missingArgs.map(p => p.name).join(", ")}`);
                return;
            }

            await Excel.run(async (context) => {
                let worksheet, range, formula;

                try {
                    // Assumes targetCell is always sheet-qualified (e.g., "Sheet1!A1")
                    const [sheetName, cellAddress] = targetCell.split("!");
                    worksheet = context.workbook.worksheets.getItem(sheetName);
                    range = worksheet.getRange(cellAddress);
                } catch (error) {
                    throw new Error(`Failed to get worksheet or range: ${error.message}`);
                }

                try {
                    if (selectedFunction.noName) {
                        formula = selectedFunction.execFormula;
                        // Replace argN parameters with range references or __OMITTED__
                        (selectedFunction.parameters || []).forEach((param, index) => {
                            const value = functionArgs[param.name];
                            const argPlaceholder = `arg${index + 1}`;
                            formula = formula.replace(
                                argPlaceholder,
                                value || '"__OMITTED__"'
                            );
                        });

                        try {
                            range.formulas = [[formula]];
                            await context.sync();
                        } catch (error) {
                            throw new Error(`Failed to set formula for no-name function: ${formula}. Error: ${error.message}`);
                        }
                    } else {
                        const args = (selectedFunction.parameters || [])
                            .map(param => functionArgs[param.name] || '"__OMITTED__"')
                            .join(",");
                        formula = `=${selectedFunction.name.toUpperCase()}(${args})`;

                        try {
                            range.formulas = [[formula]];
                            await context.sync();
                        } catch (error) {
                            throw new Error(`Failed to set formula for named function: ${formula}. Error: ${error.message}`);
                        }
                    }
                } catch (error) {
                    throw new Error(`Failed to set formula in range: ${error.message}`);
                }
            });

            pyLogs({
                code: selectedFunction.code,
                ref: 'functionDialog_success'
            });

            if (saveArgs) {
                try {
                    const updatedFunction = {
                        ...selectedFunction,
                        args: functionArgs
                    };
                    await saveFunctionToSettings(updatedFunction);
                } catch (error) {
                    throw new Error(`Failed to save function arguments: ${error.message}`);
                }
            }

            onClose();
        } catch (error) {
            pyLogs({
                message: error.message,
                code: selectedFunction.code,
                ref: 'functionDialog_error'
            });
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
        <div className="p-2">
            <div className="bg-gray-50 rounded">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">{selectedFunction.signature}</h3>
                    {selectedFunction.noName && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            EXEC MODE
                        </span>
                    )}
                </div>
                {selectedFunction.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedFunction.description}</p>
                )}
                {activeField && (
                    <p className="text-sm text-blue-500 mt-1">Select range in worksheet to populate the input field.</p>
                )}
            </div>

            <div className="mt-2 mb-2">
                {(selectedFunction.parameters || []).map((param, index) => (
                    <div key={`${param.name}-${index}`} className="mb-2">
                        <div className="flex items-center">
                            <label className="mr-2 whitespace-nowrap">
                                {param.name}
                                {!param.has_default && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={functionArgs[param.name] || ''}
                                onChange={(e) => handleArgumentChange(param.name, e.target.value)}
                                onFocus={() => handleFocus(param.name)}
                                readOnly
                                data-param={param.name}
                                className={`flex-1 px-2 py-1 border rounded ${activeField === param.name ? 'border-blue-500 border-2' : ''}`}
                                placeholder="Click, then select range"
                            />
                            {param.has_default && (
                                <button
                                    type="button"
                                    onClick={() => handleArgumentChange(param.name, "")}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-2 flex items-center">
                <label className="mr-2 whitespace-nowrap font-semibold">
                    Insert into cell:
                    <span className="text-red-500">*</span>
                </label>
                <input
                    id="targetCell"
                    type="text"
                    value={targetCell}
                    onChange={(e) => handleTargetCellChange(e.target.value)}
                    onFocus={() => handleFocus('targetCell')}
                    readOnly
                    className={`flex-1 px-2 py-1 border rounded ${activeField === 'targetCell' ? 'border-blue-500 border-2' : ''}`}
                    placeholder="Click, then select cell"
                />
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mb-1">
                <div>
                    Experimental 🧪
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => { setActiveField(null); onClose(); }}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={!targetCell}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white m-1 rounded-lg shadow-lg w-96">
                {content}
            </div>
        </div>
    );
};

export default FunctionDialog;
