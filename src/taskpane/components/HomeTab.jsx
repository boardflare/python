import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import { feedback } from "../utils/logs";

const HomeTab = ({ onTabClick }) => {
    const [notification, setNotification] = React.useState("");
    const [feedbackText, setFeedbackText] = React.useState("");
    const notificationTimeoutRef = React.useRef();

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

    return (
        <>
            <div className="p-1 mb-24">
                <h2 className="text-center text-lg font-semibold mb-2">Python functions in Excel</h2>
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
                <p className="mb-1">Check out the <a href="https://www.boardflare.com/apps/excel/python/tutorial" target="_blank" rel="noopener" className="text-blue-500 underline">tutorial video</a> and <a href="https://www.boardflare.com/apps/excel/python/documentation" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>. Use the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('editor')}>code editor</span> to create and edit functions. You can also import pre-built functions from a Jupyter notebook on the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('functions')}>Functions</span> tab.</p>
                {notification && (
                    <div className={`mt-2 text-center p-2 rounded ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"}`}>
                        {notification.message}
                    </div>
                )}
                <form onSubmit={handleFeedbackSubmit} className="fixed bottom-0 left-0 right-0 m-2 p-2 rounded-t-lg">
                    <textarea
                        id="feedback"
                        value={feedbackText}
                        placeholder="Bug? Suggestion? Rant? All feedback is welcome. Thanks!🙂"
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
        </>
    );
};

export default HomeTab;
