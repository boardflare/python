import * as React from "react";
import { makeStyles, Text } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        padding: "1rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
    },
    console: {
        backgroundColor: "#f5f5f5",
        padding: "0.5rem",
        fontFamily: "monospace",
        flexGrow: 1,
        overflow: "auto"
    }
});

const OutputTab = ({ logs, onClear, setLogs }) => {
    const styles = useStyles();

    const handleCancel = () => {
        setLogs([...logs, "Cancel operation not implemented yet"]);
    };

    return (
        <div className={styles.root}>
            <Text>
                This panel displays the output and error messages from your script execution.
                Use the Clear button to remove all messages or Cancel to stop the current operation.
            </Text>
            <div>
                <button onClick={handleCancel}>Cancel</button>
                <button onClick={onClear}>Clear</button>
            </div>
            <div className={styles.console}>
                {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                ))}
            </div>
        </div>
    );
};

export default OutputTab;
