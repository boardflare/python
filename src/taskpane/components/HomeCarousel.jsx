import * as React from "react";
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
    }
});

const IMAGES = [
    "https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/sea-full-img.jpg",
    "https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/bridge-full-img.jpg",
    "https://fabricweb.azureedge.net/fabric-website/assets/images/swatch-picker/park-full-img.jpg",
];

const BannerCard = ({ children, imageSrc, index }) => {
    const styles = useStyles();
    return (
        <CarouselCard
            className={styles.bannerCard}
            aria-label={`${index + 1} of ${IMAGES.length}`}
            id={`feature-${index}`}
        >
            <Image fit="cover" src={imageSrc} role="presentation" />
            <div className={styles.cardContainer}>
                {children}
            </div>
        </CarouselCard>
    );
};

const HomeCarousel = () => {
    return (
        <Carousel groupSize={1} circular>
            <CarouselViewport>
                <CarouselSlider>
                    <BannerCard imageSrc={IMAGES[0]} index={0}>
                        <h2>Write Python Code</h2>
                        <p>Create custom functions using the Editor tab</p>
                    </BannerCard>
                    <BannerCard imageSrc={IMAGES[1]} index={1}>
                        <h2>Execute in Excel</h2>
                        <p>Run your Python code directly in your spreadsheets</p>
                    </BannerCard>
                    <BannerCard imageSrc={IMAGES[2]} index={2}>
                        <h2>View Results</h2>
                        <p>Check execution output in the Console tab</p>
                    </BannerCard>
                </CarouselSlider>
            </CarouselViewport>
            <CarouselNavContainer layout="inline">
                <CarouselNav>
                    {(index) => (
                        <CarouselNavButton aria-label={`Slide ${index + 1}`} />
                    )}
                </CarouselNav>
            </CarouselNavContainer>
        </Carousel>
    );
};

export default HomeCarousel;
