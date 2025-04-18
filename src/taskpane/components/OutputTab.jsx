import * as React from "react";
import { abortController } from "../../functions/utils/queue";

const OutputTab = ({ logs, onClear, setLogs }) => {
    const handleCancel = () => {
        abortController.abort();
        setLogs([...logs, "Operation cancelled"]);
    };

    return (
        <div className="p-2 h-full flex flex-col gap-2">
            <p>
                STDOUT and STDERR will be shown here.{' '}
                See <a
                    href="https://www.boardflare.com/apps/excel/python"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                >
                    documentation
                </a> for more details.
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
