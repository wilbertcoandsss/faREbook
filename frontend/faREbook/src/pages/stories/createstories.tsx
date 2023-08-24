import React, { useEffect, useState } from "react";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import { RiMessengerFill, RiMessengerLine } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/style.module.scss";
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlinePlus } from "react-icons/ai";
import { encryptStorage } from "../auth/login";
import { useQuery } from "@apollo/client";
import { GET_USER_BY_TOKEN } from "../../queries/userquery";
import { BiImageAdd } from "react-icons/bi";
import { PiTextAaBold } from "react-icons/pi";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
import Navbar from "../../components/homepage/navbar";

const CreateStories = () => {
    const savedTheme = localStorage.getItem('darkTheme');
    const [darkTheme, setDarkTheme] = useState(savedTheme === 'dark');

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const styles = darkTheme ? darkstyles : lightstyles;

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const navigate = useNavigate();

    const location = useLocation();
    const isHome = location.pathname;

    const token = encryptStorage.getItem("jwtToken");

    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    if (userLoading) {
        return <div>Loading</div>
    }
    else {
        console.log(userData.validateJWT);
    }

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <div className={styles.container} style={{ height: '100vh' }}>
                <div className={styles.sidebar} style={{ backgroundColor: darkTheme ? '#18191a' : 'white', color: darkTheme ? 'white' : 'black' }}>
                    <div>
                        <AiOutlineCloseCircle style={{ width: '50px', height: '50px' }} onClick={() => navigate('/')} />
                        <hr className={styles.lineBreak}></hr>
                    </div>
                    <div>
                        <h3>Your Story</h3>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                            <h3>{userData.validateJWT.firstname} {userData.validateJWT.surname}</h3>
                        </div>
                    </div>
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <button className={styles.createStoryContainer} onClick={() => navigate('/createphoto')}>
                            <BiImageAdd />
                            <h4>Create a photo story</h4>
                        </button>
                        <div style={{ margin: '30px' }}></div>
                        <button className={styles.createStoryContainer1} onClick={() => navigate('/createtext')}>
                            <PiTextAaBold />
                            <h4>Create a text story</h4>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateStories;