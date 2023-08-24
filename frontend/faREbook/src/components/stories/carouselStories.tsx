import { useEffect, useRef, useState } from "react";
import React from "react";
import styles from "../../styles/style.module.scss";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import Indicators from "./storiesIndicator";
import proptypes from "prop-types";
import ProgressBar from "./progressbar";
import { formatDistanceToNow } from "date-fns";


const StoriesCarousel = ({ storiesData }) => {
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);

    const duration = 5000; // 5 seconds in milliseconds

    const goToPreviousStory = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(activeStoryIndex - 1);
        }
    };

    const goToNextStory = () => {
        if (activeStoryIndex < storiesData.getStoriesByUserId.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
        }
    };

    const isFirstStory = activeStoryIndex === 0;
    const isLastStory = activeStoryIndex === storiesData.getStoriesByUserId.length - 1;
    const lastUserIdRef = useRef('');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isLastStory) {
                setActiveStoryIndex(activeStoryIndex + 1);
            }
        }, duration); // Use the 'duration' constant

        const currentUserId = storiesData.getStoriesByUserId[activeStoryIndex]?.AuthorData.id;

        // Clear the timer and reset if UserID changes
        if (currentUserId !== lastUserIdRef.current) {
            clearTimeout(timer);
            setActiveStoryIndex(0); // Reset the activeStoryIndex to the beginning
        }

        // Update the lastUserIdRef
        lastUserIdRef.current = currentUserId;

        return () => clearTimeout(timer);
    }, [activeStoryIndex, isLastStory, storiesData.getStoriesByUserId]);

    const calculateTimeAgo = (timestamp) => {
        const postDate = new Date(timestamp);
        return formatDistanceToNow(postDate, { addSuffix: true });
    };

    return (
        <div className={styles.manualCarousel}>
            <div className={styles.carouselContent} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ top: '45px', position: 'absolute', zIndex: '2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <ProgressBar duration={4550} activeIndex={activeStoryIndex} storiesData={storiesData} />
                    <Indicators storiesData={storiesData} activeIndex={activeStoryIndex} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                        <img
                            src="assets/Capture.PNG"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%', // Make the image circular
                            }}
                            alt="Profile"
                        />
                        <h4 style={{ marginTop: '10px', marginBottom: '8px', color: storiesData.getStoriesByUserId[activeStoryIndex].FontColor }}>{storiesData.getStoriesByUserId[activeStoryIndex].AuthorData.firstname} {storiesData.getStoriesByUserId[activeStoryIndex].AuthorData.surname}</h4>
                        <h6 style={{ marginTop: '5px', marginBottom: '5px', color: storiesData.getStoriesByUserId[activeStoryIndex].FontColor }}>{calculateTimeAgo(storiesData.getStoriesByUserId[activeStoryIndex].Date)}</h6>
                    </div>
                </div>
                <div
                    className={styles.textStoriesPreviewInner}
                    style={{
                        width: '32%',
                        height: '78vh',
                        backgroundColor: storiesData.getStoriesByUserId[activeStoryIndex].BgColor,
                        transition: '0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    {!isFirstStory && (
                        <div className={styles.prevStoriesBtn} onClick={goToPreviousStory}>
                            <MdNavigateBefore className={styles.navStoriesBtn} />
                        </div>
                    )}
                    {storiesData.getStoriesByUserId[activeStoryIndex].MediaUrl[0] ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '100%' }}>
                                <div style={{ position: 'relative', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src={storiesData.getStoriesByUserId[activeStoryIndex].MediaUrl} alt={`Image Preview`} style={{ position: 'relative', width: '90%' }} />
                                </div>
                            </div>
                        </div>

                    ) : (
                        <div>
                            <h2
                                style={{
                                    color: storiesData.getStoriesByUserId[activeStoryIndex].FontColor,
                                    fontFamily: storiesData.getStoriesByUserId[activeStoryIndex].FontFamily,
                                    transition: '0.3s ease',
                                    textAlign: 'center'
                                }}
                            >
                                {storiesData.getStoriesByUserId[activeStoryIndex].TextContent}
                            </h2>
                        </div>
                    )}
                    {!isLastStory && (
                        <div className={styles.nextStoriesBtn} onClick={goToNextStory}>
                            <MdNavigateNext className={styles.navStoriesBtn} />
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default StoriesCarousel;

