import * as React from "react";
import { abortController } from "../../functions/utils/common";

const OutputTab = ({ logs, onClear, setLogs }) => {
    const handleCancel = () => {
        abortController.abort();
        setLogs([...logs, "Operation cancelled"]);
    };

    return (
        <div className="p-4 h-full flex flex-col gap-4">
            <p>
                This panel displays the output and error messages from your script execution.
                Use the Clear button to remove all messages or Cancel to stop the current operation.
            </p>
            <div>
                <button onClick={handleCancel} className="mr-2 p-2 bg-red-500 text-white rounded">Cancel</button>
                <button onClick={onClear} className="p-2 bg-blue-500 text-white rounded">Clear</button>
            </div>
            <div className="bg-gray-100 p-2 font-mono flex-grow overflow-auto">
                {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                ))}
            </div>
        </div>
    );
};

export default OutputTab;
