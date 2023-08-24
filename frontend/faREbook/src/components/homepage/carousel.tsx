import React, { useState } from 'react';
import { GrNext, GrPrevious } from 'react-icons/gr';
import styles from "../../styles/style.module.scss";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const ManualCarousel = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    };

    return (
        <div className={styles.manualCarousel}>
            <div className={styles.carouselContent}>
                {items.length > 1 && (
                    <div className={styles.carouselButtonLeft} onClick={handlePrev}>
                        <MdNavigateBefore className={styles.carouselIcon} />
                    </div>
                )}
                <div className={styles.mediaContainer}>
                    {items[currentIndex].endsWith('.mp4') || items[currentIndex].endsWith('.webm') ? (
                        <video controls>
                            <source src={items[currentIndex]} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className={styles.imageContainer}>
                            <img src={items[currentIndex]} alt={`Media ${currentIndex}`} className={styles.imageCarousel} />
                        </div>
                    )}
                </div>
                {items.length > 1 && (
                    <div className={styles.carouselButtonRight} onClick={handleNext}>
                        <MdNavigateNext className={styles.carouselIcon} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualCarousel;
