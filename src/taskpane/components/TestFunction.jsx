import * as React from "react";
import PropTypes from "prop-types";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { runPy } from "../../functions/runpy/controller";
import { EventTypes } from "../utils/constants";
import { parsePython } from "../utils/codeparser";

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
        whiteSpace: "pre-wrap"
    },
    error: {
        color: "red",
    },
    header: {
        fontWeight: "bold",
        marginTop: tokens.spacingVerticalM,
        marginBottom: tokens.spacingVerticalS,
    }
});

export const TestFunction = ({ code }) => {
    const styles = useStyles();
    const [output, setOutput] = React.useState([]);
    const [isRunning, setIsRunning] = React.useState(false);
    const [parsedData, setParsedData] = React.useState(null);

    React.useEffect(() => {
        try {
            const parsed = parsePython(code);
            console.log('Parsed data:', parsed); // Add this debug line
            setParsedData(parsed);
        } catch (error) {
            console.error('Failed to parse code:', error);
        }
    }, [code]);

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

    const formatExampleAsMatrix = (example) => {
        return example.map(arg => [[arg]]);
    };

    const handleRun = async () => {
        if (!parsedData) return;

        setIsRunning(true);
        setOutput([]);
        try {
            // Run each example
            for (let i = 0; i < parsedData.examples.length; i++) {
                const example = parsedData.examples[i];
                setOutput(prev => [...prev, { type: 'header', message: `Running Example ${i + 1}: ${JSON.stringify(example)}` }]);
                const result = await runPy(parsedData.code, parsedData.examplesAsRunpyArgs[i]);
                setOutput(prev => [...prev, { type: 'log', message: JSON.stringify(result) }]);
            }
        } catch (error) {
            setOutput(prev => [...prev, { type: 'error', message: error.toString() }]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputRow}>
                <Button
                    onClick={handleRun}
                    disabled={isRunning || !parsedData?.code}
                >
                    Run Code with Examples
                </Button>
            </div>
            <div className={styles.console}>
                {output.map((item, index) => (
                    <div
                        key={index}
                        className={
                            item.type === 'error' ? styles.error :
                                item.type === 'header' ? styles.header :
                                    undefined
                        }
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
