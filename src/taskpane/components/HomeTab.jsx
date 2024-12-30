import * as React from "react";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        padding: "1rem",
        height: "100%"
    },
    content: {
        maxWidth: "600px",
        margin: "0 auto"
    }
});

const HomeTab = () => {
    const styles = useStyles();

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <h1>Welcome to Python Excel Add-in</h1>
                <p>This add-in allows you to write and execute Python code directly in Excel.</p>
                <p>Get started by:</p>
                <ul>
                    <li>Switch to the Editor tab to write Python functions</li>
                    <li>Use the Console tab to see execution output</li>
                    <li>Check the Help tab for detailed instructions</li>
                </ul>
            </div>
        </div>
    );
};

export default HomeTab;
