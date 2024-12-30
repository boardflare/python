import * as React from "react";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        height: "100%"
    }
});

const HelpTab = () => {
    const styles = useStyles();

    return (
        <div className={styles.root}>
            <div>
                Excel functions using Python! See{" "}
                <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener">
                    video
                </a>{" "}
                and{" "}
                <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener">
                    docs
                </a>
                .
                🛟<a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener">
                    Feedback Please!
                </a>
            </div>
        </div>
    );
};

export default HelpTab;
