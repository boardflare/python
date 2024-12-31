import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DEFAULT_CODE } from "../utils/constants";
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
        position: "relative",
        display: "flex",
        minHeight: 0 // Important for flex child
    },
    textContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "absolute",
        left: "10%",
        top: "25%",
        background: tokens.colorNeutralBackground1,
        padding: "18px",
        maxWidth: "270px",
        width: "50%",
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
    const totalPages = IMAGES.length;

    return (
        <Carousel
            className={styles.carousel}
            groupSize={1}
            circular
            activeIndex={activeIndex}
            onActiveIndexChange={(e, data) => setActiveIndex(data.index)}
        >
            <CarouselViewport className={styles.viewport}>
                <CarouselSlider className={styles.slider}>
                    <CarouselCard
                        className={styles.cardContainer}
                        aria-label={`1 of ${IMAGES.length}`}
                        id="feature-0"
                    >
                        <div className={styles.editorContainer}>
                            <MonacoEditor value={DEFAULT_CODE} />
                        </div>
                        <div className={styles.textContainer}>
                            <h2>Execute in Excel</h2>
                            <p>Run your Python code directly in your spreadsheets</p>
                        </div>
                    </CarouselCard>
                    <CarouselCard
                        className={styles.cardContainer}
                        aria-label={`2 of ${IMAGES.length}`}
                        id="feature-1"
                    >
                        <Image fit="cover" src={IMAGES[1]} role="presentation" />
                        <div className={styles.textContainer}>
                            <h2>Execute in Excel</h2>
                            <p>Run your Python code directly in your spreadsheets</p>
                        </div>
                    </CarouselCard>
                    <CarouselCard
                        className={styles.cardContainer}
                        aria-label={`3 of ${IMAGES.length}`}
                        id="feature-2"
                    >
                        <Image fit="cover" src={IMAGES[2]} role="presentation" />
                        <div className={styles.textContainer}>
                            <h2>View Results</h2>
                            <p>Check execution output in the Console tab</p>
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
