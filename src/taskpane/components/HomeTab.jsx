import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import LLM from "./LLM";
import { SignInButton } from "./Auth";
import pdfUrl from "../../../assets/Python-v1.3.5.pdf";
import AddFunctions from "./AddFunctions";
import { pyLogs } from "../utils/logs";

const HomeTab = ({ handleTabSelect, setGeneratedCode, setSelectedFunction, loadFunctions, selectedFunction, error }) => {
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
                    Create Functions
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
                            {isWebPlatform && (
                                <p className="mt-1 text-yellow-600">
                                    Autocomplete is not available in Excel for Web, but typing in the function name will work.
                                </p>
                            )}
                            {selectedFunction?.noName && (
                                <p className="mt-1 text-yellow-600">
                                    Named functions are not supported on this version of Excel.  Use <code>=BOARDFLARE.EXEC("hello", "Annie")</code> instead.
                                </p>
                            )}
                        </div>
                        <p className="mt-1">
                            Check out the <a href={pdfUrl} target="_blank" rel="noopener" className="text-blue-500 underline" onClick={() => pyLogs({ ref: "slideshow_clicked" })}>slideshow</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <AddFunctions loadFunctions={loadFunctions} />
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

export default HomeTab;
