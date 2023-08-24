import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "../../styles/style.module.scss";

const ProgressBar = ({ duration, activeIndex, storiesData }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setProgress(0); // Reset progress when active index changes
    }, [activeIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (progress < 100) {
                setProgress(progress + 1);
            }
        }, duration / 100);

        return () => clearInterval(interval);
    }, [progress, duration]);

    return (
        <div className={styles.progressBarContainer}>
            {storiesData.getStoriesByUserId.map((_, index) => (
                <>
                    <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                </>
            ))}
        </div>
    );
};

ProgressBar.propTypes = {
    duration: PropTypes.number.isRequired,
    activeIndex: PropTypes.number.isRequired,
};

export default ProgressBar;