import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import LLM from "./LLM";
import { SignInButton } from "./Auth";
import { pyLogs } from "../utils/logs";
import { abortController } from "../../functions/utils/queue";

const Output = ({ logs, onClear, setLogs }) => {
    const handleCancel = () => {
        abortController.abort();
        setLogs([...logs, "Operation cancelled"]);
    };

    return (
        <div className="p-2 h-full flex flex-col gap-4">
            <div className="p-0 font-mono flex-1 min-h-40 max-h-96 overflow-auto">
                {logs.map((log, index) => (
                    <React.Fragment key={index}>
                        {log.split('\n').map((line, lineIndex) => (
                            <div key={`${index}-${lineIndex}`} className="break-words">{line}</div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
            <div>
                <button
                    onClick={handleCancel}
                    className="mr-2 px-2 py-1 bg-gray-500 text-white rounded"
                    title="Cancel stops the current operation."
                >
                    Cancel
                </button>
                <button
                    onClick={onClear}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    title="Clear removes all messages."
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

const HelpTab = ({ handleTabSelect, setGeneratedCode, setSelectedFunction, loadFunctions, selectedFunction, error, logs, onClear, setLogs }) => {
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const [isWebPlatform, setIsWebPlatform] = React.useState(false);
    const [localError, setLocalError] = React.useState(error || null);

    React.useEffect(() => {
        setLocalError(error);
    }, [error]);

    React.useEffect(() => {
        try {
            setIsWebPlatform(Office?.context?.diagnostics?.platform === 'OfficeOnline');
        } catch (error) {
            console.warn('Failed to detect Office platform:', error);
            setIsWebPlatform(false);
        }
    }, []);

    const handleLLMSuccess = (savedFunction, prompt) => {
        setSelectedFunction({ ...savedFunction, source: 'workbook', prompt });
        handleTabSelect('editor');
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {localError && (
                <div className="p-2 text-red-600 bg-red-50 mb-2 text-center">
                    {localError}
                </div>
            )}

            <div className="shrink-0">
                <div className="px-4 py-2 bg-gray-100 font-bold text-center">
                    How it works
                </div>
                <div className="p-2">
                    <div className="border-gray-300 rounded-lg py-0">
                        <p>
                            <span className="font-bold">Step 1:</span> Write a Python function in the
                            <span className="ml-1 text-blue-500 underline cursor-pointer" onClick={() => handleTabSelect({ target: { value: 'editor' } })}>
                                editor
                            </span>.
                        </p>
                        <div className="py-1 h-16">
                            <MonacoEditor
                                value={DISPLAY_CODE}
                                onMount={(editor) => {
                                    editor.updateOptions({ readOnly: true });
                                }}
                            />
                        </div>
                    </div>
                    <div className="py-1">
                        <p><span className="font-bold">Step 2:</span> Save it to create a custom function.</p>
                        <div className="bg-white"><code>=HELLO("Annie")</code> <br />
                            {selectedFunction?.noName && (
                                <p className="mt-1 text-yellow-600">
                                    Named functions are not supported on this version of Excel.  Use <code>=BOARDFLARE.EXEC("hello", "Annie")</code> instead.
                                </p>
                            )}
                        </div>
                        <p className="mt-1">
                            Check out the slideshow and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>.
                        </p>
                    </div>
                </div>
            </div>
            {/* Output Section */}
            <div className="mt-0">
                <div className="px-4 py-2 bg-gray-100 font-bold text-center">Output Logs</div>
                <Output logs={logs} onClear={onClear} setLogs={setLogs} />
            </div>
            <LLM
                isOpen={isLLMOpen}
                onClose={() => setIsLLMOpen(false)}
                onSuccess={handleLLMSuccess}
                loadFunctions={loadFunctions}
            />
            <div className="fixed bottom-3 w-full flex justify-between items-center mt-2 px-3">
                <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Email Us!🛟</a>
                {!isWebPlatform && <SignInButton loadFunctions={loadFunctions} />}
            </div>
        </div>
    );
};

export default HelpTab;
