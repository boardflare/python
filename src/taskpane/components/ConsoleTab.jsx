import * as React from "react";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        padding: "1rem",
        height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    console: {
        backgroundColor: "#f5f5f5",
        padding: "0.5rem",
        fontFamily: "monospace",
        flexGrow: 1,
        overflow: "auto"
    }
});

const ConsoleTab = ({ logs, onClear }) => {
    const styles = useStyles();

    const handleCancel = () => {
        // Implement cancel functionality
        console.log("Operation cancelled");
    };

    return (
        <div className={styles.root}>
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

export default ConsoleTab;
