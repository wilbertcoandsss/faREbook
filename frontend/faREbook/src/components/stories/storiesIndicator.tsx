import React, { useEffect, useState } from "react";
import styles from "../../styles/style.module.scss";
import chroma from "chroma-js"
import ProgressBar from "./progressbar";

const Indicators = ({ storiesData, activeIndex }) => {

    return (
        <div style={{ display: 'flex', background: storiesData.getStoriesByUserId[activeIndex].FontColor ? storiesData.getStoriesByUserId[activeIndex].FontColor : 'black', padding: '8px', paddingTop: '15px', borderRadius: '10px', flexDirection: 'column' }}>
            <div className={styles.indicatorContainer}>
                {storiesData.getStoriesByUserId.map((_, index) => (
                    <>
                        <div
                            key={index}
                            style={{
                                backgroundColor: activeIndex === index ? "#fff" : storiesData.getStoriesByUserId[activeIndex].BgColor
                            }}
                            className={`${styles.indicator} ${activeIndex === index ? styles.active : ''}`}
                        ></div>
                    </>
                ))}
            </div>
        </div>
    );
};

export default Indicators;
