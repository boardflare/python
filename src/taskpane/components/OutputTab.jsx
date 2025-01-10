import * as React from "react";
import { abortController } from "../../functions/runpy/queue";

const OutputTab = ({ logs, onClear, setLogs }) => {
    const handleCancel = () => {
        abortController.abort();
        setLogs([...logs, "Operation cancelled"]);
    };

    return (
        <div className="p-4 h-full flex flex-col gap-4">
            <p>
                Displays STDOUT and STDERR messages. Clear removes all messages and Cancel stops the current operation.
            </p>
            <div>
                <button onClick={handleCancel} className="mr-2 px-2 py-1 bg-gray-500 text-white rounded">Cancel</button>
                <button onClick={onClear} className="px-2 py-1 bg-blue-500 text-white rounded">Clear</button>
            </div>
            <div className="bg-gray-100 p-2 font-mono flex-grow overflow-auto">
                {logs.map((log, index) => (
                    <React.Fragment key={index}>
                        {log.split('\n').map((line, lineIndex) => (
                            <div key={`${index}-${lineIndex}`} className="break-words">{line}</div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default OutputTab;
