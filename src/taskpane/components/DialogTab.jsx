import * as React from "react";
import {
    Button,
    Dialog,
    DialogSurface,
    DialogTrigger,
    makeStyles,
    shorthands,
} from "@fluentui/react-components";
import FunctionPicker from "./FunctionPicker";
import DialogCarousel from "./DialogCarousel";

const useStyles = makeStyles({
    surface: {
        padding: 0,
        ...shorthands.border("none"),
        overflow: "hidden",
    },
});

const DialogTab = () => {
    const styles = useStyles();
    const [open, setModalOpen] = React.useState(false);

    return (
        <div style={{ padding: "20px" }}>
            <Dialog open={open} onOpenChange={(e, data) => setModalOpen(data.open)}>
                <DialogTrigger>
                    <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogSurface className={styles.surface}>
                    <DialogCarousel onClose={() => setModalOpen(false)} />
                </DialogSurface>
            </Dialog>
            <div style={{ marginTop: "20px" }}>
                <FunctionPicker />
            </div>
        </div>
    );
};

export default DialogTab;
