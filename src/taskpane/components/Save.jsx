import * as React from "react";
import FunctionDialog from "./FunctionDialog";

const Save = ({ isOpen, selectedFunction, onDismiss }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Function Saved</h3>
                        <div className="bg-gray-50 rounded">
                            <FunctionDialog
                                isOpen={true}
                                onClose={onDismiss}
                                selectedFunction={selectedFunction}
                                embedded={true} // Add this prop
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Save;
