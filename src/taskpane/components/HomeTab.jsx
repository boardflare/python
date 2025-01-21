import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import { feedback } from "../utils/logs";
import LLM from "./LLM";

const HomeTab = ({ onTabClick, setGeneratedCode }) => {
    const [notification, setNotification] = React.useState("");
    const [feedbackText, setFeedbackText] = React.useState("");
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const notificationTimeoutRef = React.useRef();
    const [isLLMLoading, setIsLLMLoading] = React.useState(false);

    React.useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    const showNotification = (message, type = "success") => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification({ message, type });
        notificationTimeoutRef.current = setTimeout(() => {
            setNotification("");
        }, 5000);
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await feedback({ text: feedbackText });
            showNotification("Feedback submitted successfully. Thanks!", "success");
            setFeedbackText("");
        } catch (error) {
            console.error("Error submitting feedback:", error);
            showNotification("Error submitting feedback", "error");
        }
    };

    const handleLLMSuccess = (generatedCode) => {
        setGeneratedCode(generatedCode); // Directly set the code
        onTabClick('editor');
    };

    return (
        <>
            <div className="p-1 mb-32">
                <h2 className="text-center text-lg font-semibold mb-2">Python functions in Excel 🧪</h2>
                <div className="py-1 border-gray-300 rounded-lg p-2 mb-2">
                    <p><span className="font-bold">Step 1:</span> Write a Python function in the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('editor')}>editor</span>.</p>
                    <div className="py-2 h-[75px]">
                        <MonacoEditor
                            value={DISPLAY_CODE}
                            onMount={(editor) => {
                                editor.updateOptions({ readOnly: true });
                            }}
                        />
                    </div>
                </div>
                <div className="py-1 border-gray-300 rounded-lg p-2 mb-2">
                    <p><span className="font-bold">Step 2:</span> Save it to create a LAMBDA function.</p>
                    <div className="p-1 mt-1 bg-white"><code>=HELLO("Annie")</code> <br /><code>Hello Annie!</code></div>
                </div>
                <p className="m-2">Check out the <a href="https://whistlernetworks.sharepoint.com/:p:/s/Boardflare/EavKXzTcSmJArk1FadRoH40BaFTd1xrff2cw3bGSRs3AFg?rtime=Mhp28Ns33Ug" target="_blank" rel="noopener" className="text-blue-500 underline">slideshow</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>. Use the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('editor')}>code editor</span> to create and edit functions. Import example functions on the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('functions')}>functions</span> tab.</p>
                <div className="text-center mt-4">
                    <button
                        onClick={() => setIsLLMOpen(true)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Create Function with AI ✨
                    </button>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0">
                {notification && (
                    <div className={`p-2 text-center ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"}`}>
                        {notification.message}
                    </div>
                )}
                <form onSubmit={handleFeedbackSubmit} className="mb-2 p-2">
                    <textarea
                        id="feedback"
                        value={feedbackText}
                        placeholder="Bug? Suggestion? Your feedback is critical to making this add-in more useful for everyone. If you'd like a response, please email us.  Thanks! 🙂"
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="4"
                        required
                    ></textarea>
                    <div className="flex justify-between items-center mt-2">
                        <button
                            type="submit"
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Submit Feedback
                        </button>
                        <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Email Support🛟</a>
                    </div>
                </form>
            </div>
            <LLM
                isOpen={isLLMOpen}
                onClose={() => setIsLLMOpen(false)}
                onSuccess={handleLLMSuccess}
                isLoading={isLLMLoading}
            />
        </>
    );
};

export default HomeTab;
