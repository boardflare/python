import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { FunctionsGrid } from "./FunctionsGrid";

const useStyles = makeStyles({
    root: {
        height: "100%",
        padding: "20px",
    },
});

export const FunctionsTab = ({ onEdit }) => {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <FunctionsGrid onEdit={onEdit} />
        </div>
    );
};

export default FunctionsTab;
