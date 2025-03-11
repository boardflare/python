import * as React from "react";
import FunctionDialog from "./FunctionDialog";

const Save = ({ isOpen, selectedFunction, onDismiss, onRun }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
                <h3 className="text-xl font-semibold mb-2">Function Saved</h3>
                <p className="mb-4">Do you want to run the function now?</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onRun}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Run Function
                    </button>
                    <button
                        onClick={onDismiss}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Save;
