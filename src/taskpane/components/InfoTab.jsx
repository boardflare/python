import * as React from "react";
import { abortController } from "../../functions/utils/queue";

const InfoTab = ({ logs, onClear, setLogs }) => {
    const handleCancel = () => {
        abortController.abort();
        setLogs([...logs, "Operation cancelled"]);
    };

    return (
        <div className="p-2 h-full flex flex-col gap-2">
            <div className="flex flex-row justify-center items-center gap-3 mb-2 text-md">
                <a
                    href="https://www.boardflare.com/apps/excel/python"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    <span role="img" aria-label="Documentation">📖</span>
                    <span className="underline">Documentation</span>
                </a>
                <a
                    href="https://www.boardflare.com/company/support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    <span role="img" aria-label="Support">🛟</span>
                    <span className="underline">Support</span>
                </a>
            </div>
            <div className="flex flex-row items-start gap-2 mb-2">
                <div className="flex-1 min-w-0 break-words">
                    STDOUT and STDERR will be shown below.
                </div>
                <div className="flex-shrink-0 flex flex-row gap-2">
                    <button onClick={handleCancel} className="px-2 py-1 bg-gray-500 text-white rounded">Cancel</button>
                    <button onClick={onClear} className="px-2 py-1 bg-blue-500 text-white rounded">Clear</button>
                </div>
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

export default InfoTab;
