import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from "../../styles/style.module.scss";

const CarouselReelsComponent = ({ reels }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reels.length);
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + reels.length) % reels.length);
    };

    return (
        <>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}> 
                <button onClick={handlePrevious}><FaChevronLeft /></button>
                <div>
                    <h1 style={{ color: 'white' }}>{reels[currentIndex].Caption} {reels[currentIndex].MediaUrl}</h1>
                    <video 
                        key={reels[currentIndex].MediaUrl}
                        muted 
                        loop 
                        preload="auto" 
                        autoPlay={true} 
                        className={styles.reelsVid}>
                        <source src={reels[currentIndex].MediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <p style={{ position: 'absolute', left: '50%', bottom: '5%', transform: 'translate(-50%, 80%)', textAlign: 'center', color: 'white', width: '20%' }}>
                        {reels[currentIndex].someOtherText}
                    </p>
                    <p style={{ position: 'absolute', left: '37.7%', bottom: '5%', transform: 'translate(50%, 80%)', textAlign: 'center', color: 'white', width: '20%' }}>
                        Like
                    </p>
                    <p style={{ position: 'absolute', left: '37.7%', bottom: '15%', transform: 'translate(50%, 70%)', textAlign: 'center', color: 'white', width: '20%' }}>
                        Button
                    </p>
                </div>
                <button onClick={handleNext}><FaChevronRight /></button>
            </div>
        </>
    );
};

export default CarouselReelsComponent;
