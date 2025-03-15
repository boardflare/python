import * as React from "react";
import { execPython } from "../../functions/exec/controller";
import { saveFunctionToSettings, getFunctionFromSettings } from "../utils/workbookSettings";

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
    const [activeField, setActiveField] = React.useState(null); // Track which field is waiting for range selection
    const [saveArgs, setSaveArgs] = React.useState(false);

    // Reference to store the event handler for cleanup
    const selectionHandlerRef = React.useRef(null);

    // Strip $ signs and validate cell references
    const isValidCellReference = (ref) => {
        if (!ref) return false;
        // Remove $ signs before validation
        const normalizedRef = ref.replace(/\$/g, '');
        // Match both single cells (A1) and ranges (A1:B2) in one pattern
        return /^[A-Za-z]+\d+(?::[A-Za-z]+\d+)?$/.test(normalizedRef);
    };

    // Modify setSelectedCell to use updated validation
    const handleCellChange = (value) => {
        setSelectedCell(value);
        if (!value) {
            setError("Target cell is required");
        } else if (!isValidCellReference(value)) {
            setError("Invalid cell reference format");
        } else {
            setError("");
        }
    };

    // Add helper function to check if a field is empty or invalid
    const isFieldEmpty = (paramName, value) => {
        if (paramName === 'targetCell') {
            return !value || !isValidCellReference(value);
        }
        return !value;
    };

    // Define the selection changed handler
    const handleSelectionChange = React.useCallback(async (event) => {
        // Get the current activeField value from a ref to avoid stale closure
        const currentActiveField = activeFieldRef.current;
        if (!currentActiveField) return;

        try {
            await Excel.run(async (context) => {
                const range = context.workbook.getSelectedRange();
                range.load("address");
                await context.sync();

                // Extract the cell reference without the sheet name
                let address = range.address;
                if (address.includes('!')) {
                    address = address.split('!')[1];
                }

                console.log(`Selection changed to: ${address} for field: ${currentActiveField}`);

                if (currentActiveField === 'targetCell') {
                    handleCellChange(address);
                } else {
                    handleArgumentChange(currentActiveField, address);
                }
            });
        } catch (error) {
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
                        const sheet = context.workbook.worksheets.getActiveWorksheet();

                        // Register the selection changed event handler
                        sheet.onSelectionChanged.add(handleSelectionChange);

                        // Store reference to the current handler for cleanup
                        selectionHandlerRef.current = handleSelectionChange;

                        await context.sync();
                        console.log("Selection change handler registered");
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
                        await Excel.run(async (context) => {
                            const sheet = context.workbook.worksheets.getActiveWorksheet();

                            if (selectionHandlerRef.current) {
                                sheet.onSelectionChanged.remove(selectionHandlerRef.current);
                                selectionHandlerRef.current = null;
                            }

                            await context.sync();
                            console.log("Selection change handler removed");
                        });
                    } catch (error) {
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

            // Try to load saved args
            const loadSavedArgs = async () => {
                try {
                    const savedFunction = await getFunctionFromSettings(selectedFunction.name);
                    if (savedFunction?.args) {
                        setFunctionArgs(savedFunction.args);
                    } else {
                        // Initialize arguments with empty strings or default values
                        const newArgs = {};
                        selectedFunction.parameters?.forEach(param => {
                            newArgs[param.name] = "";
                        });
                        setFunctionArgs(newArgs);
                    }
                } catch (error) {
                    console.error("Error loading saved args:", error);
                }
            };

            loadSavedArgs();
        }
    }, [isOpen, selectedFunction]);

    const handleArgumentChange = (paramName, value) => {
        setFunctionArgs(prev => ({
            ...prev,
            [paramName]: value
        }));
        setError("");
    };

    // Activate range selection for a specific field
    const handleFocus = (fieldName) => {
        setActiveField(fieldName);
        console.log(`Activated range selection for field: ${fieldName}`);
    };

    const handleSubmit = async () => {
        // Deactivate range selection when submitting
        setActiveField(null);

        if (!selectedFunction) return;

        // Add validation for targetCell
        if (!selectedCell) {
            setError("Target cell is required");
            return;
        }

        if (!isValidCellReference(selectedCell)) {
            setError("Invalid cell reference format");
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
                const range = context.workbook.worksheets.getActiveWorksheet().getRange(selectedCell);

                if (insertResult) {
                    // Prepare arguments as matrices
                    const argMatrices = [];
                    for (const param of selectedFunction.parameters || []) {
                        const value = functionArgs[param.name];
                        if (!value && param.has_default) {
                            argMatrices.push([["__OMITTED__"]]);
                            continue;
                        }

                        const isCellRef = isValidCellReference(value);

                        if (isCellRef) {
                            // Get values from the referenced range
                            const argRange = context.workbook.worksheets.getActiveWorksheet().getRange(value);
                            argRange.load("values");
                            await context.sync();
                            argMatrices.push(argRange.values);
                        } else {
                            // Convert scalar value to single-element matrix
                            argMatrices.push([[value || "__OMITTED__"]]);
                        }
                    }

                    const result = await execPython({
                        code: selectedFunction.name,
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
                        if (!value && param.has_default) return '"__OMITTED__"';
                        if (!value) return '"__OMITTED__"';

                        const isCellRef = isValidCellReference(value);
                        return isCellRef ? value : `"${value}"`;
                    }).join(",");

                    const formula = `=${selectedFunction.name.toUpperCase()}(${args})`;
                    range.formulas = [[formula]];
                }
                await context.sync();
            });

            if (saveArgs) {
                await saveFunctionToSettings({
                    ...selectedFunction,
                    args: functionArgs
                });
            }

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
        <div className="p-2">
            <div className=" bg-gray-50 rounded">
                <h3 className="font-bold">{selectedFunction.signature}</h3>
                {selectedFunction.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedFunction.description}</p>
                )}
            </div>

            <div className="mt-2 mb-2">
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
                            onFocus={() => handleFocus(param.name)}
                            onClick={() => handleFocus(param.name)}
                            data-param={param.name}
                            className={`w-full px-2 py-1 border rounded ${activeField === param.name ? 'border-blue-500 border-2' :
                                !param.has_default && isFieldEmpty(param.name, functionArgs[param.name]) ? 'border-red-500' : ''
                                }`}
                            placeholder="Click here, then select range in sheet"
                        />
                    </div>
                ))}
            </div>

            <div className="mb-2">
                <label className="block mb-1">
                    Insert function into cell:
                    <span className="text-red-500">*</span>
                </label>
                <input
                    id="targetCell"
                    type="text"
                    value={selectedCell}
                    onChange={(e) => handleCellChange(e.target.value)}
                    onFocus={() => handleFocus('targetCell')}
                    onClick={() => handleFocus('targetCell')}
                    className={`w-full px-2 py-1 border rounded ${activeField === 'targetCell' ? 'border-blue-500 border-2' :
                        isFieldEmpty('targetCell', selectedCell) ? 'border-red-500' : ''
                        }`}
                    placeholder="Click here, then select cell"
                />
            </div>

            <div className="mb-1">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={insertResult}
                        onChange={(e) => setInsertResult(e.target.checked)}
                        className="rounded"
                    />
                    <span>Insert function result only,  will not recalculate.</span>
                </label>
            </div>

            <div className="mb-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={saveArgs}
                        onChange={(e) => setSaveArgs(e.target.checked)}
                        className="rounded"
                    />
                    <span>Save function arguments for next time</span>
                </label>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <button
                    onClick={() => { setActiveField(null); onClose(); }}
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
