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
    bannerCard: {
        alignContent: "center",
        borderRadius: tokens.borderRadiusLarge,
        height: "300px",
        textAlign: "left",
        position: "relative",
    },
    cardContainer: {
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
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '80%',
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

const HomeCarousel = () => {
    const styles = useStyles();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const totalPages = IMAGES.length;

    return (
        <Carousel
            groupSize={1}
            circular
            activeIndex={activeIndex}
            onActiveIndexChange={(e, data) => setActiveIndex(data.index)}
        >
            <CarouselViewport>
                <CarouselSlider>
                    <CarouselCard
                        className={styles.bannerCard}
                        aria-label={`1 of ${IMAGES.length}`}
                        id="feature-0"
                    >
                        <div className={styles.editorContainer}>
                            <MonacoEditor value={DEFAULT_CODE} />
                        </div>
                    </CarouselCard>
                    <CarouselCard
                        className={styles.bannerCard}
                        aria-label={`2 of ${IMAGES.length}`}
                        id="feature-1"
                    >
                        <Image fit="cover" src={IMAGES[1]} role="presentation" />
                        <div className={styles.cardContainer}>
                            <h2>Execute in Excel</h2>
                            <p>Run your Python code directly in your spreadsheets</p>
                        </div>
                    </CarouselCard>
                    <CarouselCard
                        className={styles.bannerCard}
                        aria-label={`3 of ${IMAGES.length}`}
                        id="feature-2"
                    >
                        <Image fit="cover" src={IMAGES[2]} role="presentation" />
                        <div className={styles.cardContainer}>
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

export default HomeCarousel;
