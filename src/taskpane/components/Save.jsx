import * as React from "react";
import FunctionDialog from "./FunctionDialog";

const Save = ({ isOpen, selectedFunction, onDismiss }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-2 rounded-lg shadow-lg max-w-sm w-full mx-1">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Run your saved function:</h3>
                        <div className="bg-gray-50 rounded mt-2">
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
