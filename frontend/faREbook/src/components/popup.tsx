import React from "react";
import styles from "../styles/style.module.scss";
import { AiOutlineClose } from "react-icons/ai";
import lightstyles from "../styles/style.module.scss"
import darkstyles from "../styles/dark.module.scss"

function Popup(props) {

    const styles = props.darkTheme ? darkstyles : lightstyles;

    return (props.trigger) ? (
        <div className={styles.popup}>
            <div className={styles.popupInner}>
                <button className={styles.closeBtn} onClick={() => props.setTrigger(false)}><AiOutlineClose style={{width: '20px', height: '20px'}}/></button>
                {props.children}
            </div>
        </div>
    ) : "";
}

export default Popup;