import * as React from "react";
import { feedback } from "../utils/logs";

const Feedback = () => {
    const [feedbackText, setFeedbackText] = React.useState("");
    const [notification, setNotification] = React.useState("");
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
            showNotification("Thanks for the suggestion, we'll consider adding it!", "success");
            setFeedbackText("");
        } catch (error) {
            console.error("Error submitting feedback:", error);
            showNotification("Error submitting feedback", "error");
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0">
            {notification && (
                <div className={`p-2 text-center ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"}`}>
                    {notification.message}
                </div>
            )}
            <h2 className="text-center text-lg font-semibold">What do you want a function to do?</h2>
            <form onSubmit={handleFeedbackSubmit} className="mb-2 p-2">
                <textarea
                    id="feedback"
                    value={feedbackText}
                    placeholder="e.g. extract numbers from a string and return their sum"
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                    rows="8"
                    required
                ></textarea>
                <div className="flex justify-between items-center mt-2">
                    <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Email Us!🛟</a>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Feedback;
