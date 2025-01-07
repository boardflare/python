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
                Displays any STDOUT and STDERR messages as well as any other runtime errors. Use the Clear button to remove all messages or Cancel to stop the current operation.
            </p>
            <div>
                <button onClick={handleCancel} className="mr-2 px-2 py-1 bg-gray-500 text-white rounded">Cancel</button>
                <button onClick={onClear} className="px-2 py-1 bg-blue-500 text-white rounded">Clear</button>
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
