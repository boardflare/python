import * as React from "react";
import PropTypes from "prop-types";
import { Input, Button, makeStyles, tokens } from "@fluentui/react-components";
import { runPy } from "../../functions/runpy/controller";
import { ConsoleEvents, EventTypes } from "../utils/constants";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalM,
        flex: 1,
    },
    inputRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        alignItems: "center",
    },
    console: {
        fontFamily: "monospace",
        backgroundColor: "#f0f0f0",
        padding: tokens.spacingVerticalM,
        borderRadius: "4px",
        flex: 1,
        overflowY: "auto",
    },
    error: {
        color: "red",
    }
});

export const TestFunction = ({ code }) => {
    const styles = useStyles();
    const [arg1, setArg1] = React.useState("");
    const [output, setOutput] = React.useState([]);
    const [isRunning, setIsRunning] = React.useState(false);

    React.useEffect(() => {
        const handleLog = (event) => {
            setOutput(prev => [...prev, { type: 'log', message: event.detail }]);
        };

        const handleError = (event) => {
            setOutput(prev => [...prev, { type: 'error', message: event.detail }]);
        };

        window.addEventListener(EventTypes.LOG, handleLog);
        window.addEventListener(EventTypes.ERROR, handleError);

        return () => {
            window.removeEventListener(EventTypes.LOG, handleLog);
            window.removeEventListener(EventTypes.ERROR, handleError);
        };
    }, []);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput([]);
        try {
            const result = await runPy(code, arg1);
            setOutput(prev => [...prev, { type: 'log', message: JSON.stringify(result) }]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputRow}>
                <Input
                    value={arg1}
                    onChange={(e) => setArg1(e.target.value)}
                    placeholder="Enter argument value"
                    disabled={isRunning}
                />
                <Button
                    onClick={handleRun}
                    disabled={isRunning}
                >
                    Run
                </Button>
            </div>
            <div className={styles.console}>
                {output.map((item, index) => (
                    <div
                        key={index}
                        className={item.type === 'error' ? styles.error : undefined}
                    >
                        {item.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

TestFunction.propTypes = {
    code: PropTypes.string.isRequired
};
