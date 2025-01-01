import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DEFAULT_CODE } from "../utils/constants";
import { TestFunction } from "./TestFunction";
import {
    makeStyles,
    Image,
    tokens,
    Carousel,
    CarouselCard,
    CarouselNav,
    CarouselNavButton,
    CarouselNavContainer,
    CarouselViewport,
    CarouselSlider,
    Button,
} from "@fluentui/react-components";

const useStyles = makeStyles({
    carousel: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0 // Important for flex child
    },
    viewport: {
        flex: 1,
        minHeight: 0 // Important for flex child
    },
    slider: {
        height: '100%'
    },
    cardContainer: {
        alignContent: "center",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        minHeight: 0 // Important for flex child
    },
    textContainer: {
        display: "flex",
        flexDirection: "column",
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
        "& h2": {
            margin: 0,
            marginBottom: tokens.spacingVerticalS
        },
        "& p": {
            margin: 0
        }
    },
    editorContainer: {
        flex: 1,
        minHeight: 0 // Important for flex child
    },
    footer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "auto",
        padding: `${tokens.spacingVerticalS} ${tokens.spacingVerticalXXL} ${tokens.spacingVerticalXXL} ${tokens.spacingVerticalXXL}`,
    },
});

const IMAGES = [
    "https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/sea-full-img.jpg",
    "https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/bridge-full-img.jpg",
    "https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/park-full-img.jpg",
];

const CreateWizard = () => {
    const styles = useStyles();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [code, setCode] = React.useState(DEFAULT_CODE);
    const totalPages = IMAGES.length;

    const handleEditorMount = (editor) => {
        editor.onDidChangeModelContent(() => {
            setCode(editor.getValue());
        });
    };

    return (
        <Carousel
            className={styles.carousel}
            groupSize={1}
            activeIndex={activeIndex}
            onActiveIndexChange={(e, data) => setActiveIndex(data.index)}
        >
            <CarouselViewport className={styles.viewport}>
                <CarouselSlider className={styles.slider}>
                    <CarouselCard
                        className={styles.cardContainer}
                        id="code-function"
                    >
                        <div className={styles.textContainer}>
                            <h2>Step 1: Code Function</h2>
                            <p>Pro Tip: Drag your task pane wider for more room!</p>
                        </div>
                        <div className={styles.editorContainer}>
                            <MonacoEditor value={DEFAULT_CODE} onMount={handleEditorMount} />
                        </div>
                    </CarouselCard>
                    <CarouselCard
                        className={styles.cardContainer}
                        id="test-function"
                    >
                        <div className={styles.textContainer}>
                            <h2>Step 2: Test Function</h2>
                            <p>Click the button below to test your function using the examples you provided.</p>
                        </div>
                        <TestFunction code={code} />
                    </CarouselCard>
                    <CarouselCard
                        className={styles.cardContainer}
                        id="save-function"
                    >
                        <Image fit="cover" src={IMAGES[2]} role="presentation" />
                        <div className={styles.textContainer}>
                            <h2>Step 3: Save Function</h2>
                            <p>Click Save to store this function locally in your workbook.</p>
                        </div>
                    </CarouselCard>
                </CarouselSlider>
            </CarouselViewport>
            <div className={styles.footer}>
                <Button onClick={() => setActiveIndex(activeIndex - 1)}>
                    Previous
                </Button>

                <CarouselNav appearance="brand">
                    {(index) => (
                        <CarouselNavButton aria-label={`Carousel Nav Button ${index}`} />
                    )}
                </CarouselNav>

                <Button appearance="primary" onClick={() => setActiveIndex(activeIndex + 1)}>
                    Next
                </Button>
            </div>
        </Carousel>
    );
};

export default CreateWizard;
