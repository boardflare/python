import * as React from "react";
import PropTypes from "prop-types";
import { Button, makeStyles, tokens, Dropdown } from "@fluentui/react-components";
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
    },
    error: {
        color: "red",
    },
    dropdown: {
        minWidth: "200px"
    }
});

export const TestFunction = ({ code }) => {
    const styles = useStyles();
    const [selectedExample, setSelectedExample] = React.useState(null);
    const [output, setOutput] = React.useState([]);
    const [isRunning, setIsRunning] = React.useState(false);
    const [parsedData, setParsedData] = React.useState(null);

    React.useEffect(() => {
        try {
            const parsed = parsePython(code);
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

    const handleRun = async () => {
        if (!selectedExample || !parsedData) return;

        setIsRunning(true);
        setOutput([]);
        try {
            const result = await runPy(parsedData.code, selectedExample);
            setOutput(prev => [...prev, { type: 'log', message: JSON.stringify(result) }]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputRow}>
                <Dropdown
                    className={styles.dropdown}
                    placeholder="Select an example"
                    value={selectedExample}
                    onOptionSelect={(e, data) => setSelectedExample(data.optionValue)}
                    disabled={isRunning || !parsedData}
                    options={(parsedData?.examples || []).map((example, index) => ({
                        id: index.toString(),
                        value: example,
                        text: `Example ${index + 1}: ${JSON.stringify(example)}`
                    }))}
                />
                <Button
                    onClick={handleRun}
                    disabled={isRunning || !selectedExample || !parsedData}
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
