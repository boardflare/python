import * as React from "react";
import {
    makeStyles,
    Button,
    Dialog,
    DialogSurface,
    DialogTrigger,
} from "@fluentui/react-components";
import CreateWizard from "./CreateWizard";

const useStyles = makeStyles({
    root: {
        padding: "1rem",
        height: "100%"
    },
    content: {
        maxWidth: "800px",
        margin: "0 auto"
    },
    surface: {
        padding: 0,
        border: "none",
        overflow: "hidden",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 0
    }
});

const HomeTab = () => {
    const styles = useStyles();
    const [open, setModalOpen] = React.useState(false);

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <Dialog
                    modalType="alert"
                    open={open}
                    onOpenChange={(e, data) => setModalOpen(data.open)}
                >
                    <DialogTrigger>
                        <Button appearance="primary">Create New Function</Button>
                    </DialogTrigger>
                    <DialogSurface className={styles.surface}>
                        <CreateWizard />
                    </DialogSurface>
                </Dialog>

                <h1>Welcome to Python Excel Add-in</h1>
                <p>This add-in allows you to write and execute Python code directly in Excel.</p>
                <p>Get started by:</p>
                <ul>
                    <li>Switch to the Editor tab to write Python functions</li>
                    <li>Use the Console tab to see execution output</li>
                    <li>Check the Help tab for detailed instructions</li>
                </ul>
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

export default HomeTab;
