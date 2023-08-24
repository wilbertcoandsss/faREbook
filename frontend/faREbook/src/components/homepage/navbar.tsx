import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
// import styles from "../styles/"
import { AiOutlineSearch, AiFillHome, AiOutlineHome } from "react-icons/ai"
import { BiUser, BiSolidUser, BiGroup, BiSolidGroup, BiMoon, BiSun } from "react-icons/bi"
import { RiMessengerFill, RiMessengerLine } from "react-icons/ri"
import { IoIosNotificationsOutline, IoIosNotifications } from "react-icons/io"
import { encryptStorage } from "../../pages/auth/login";
import { useQuery } from "@apollo/client";
import { GET_USER_BY_TOKEN } from "../../queries/userquery";
import CryptoJS from 'crypto-js';
import { CgMenuGridO } from "react-icons/cg";
import { MdDarkMode } from "react-icons/md";
import { Moon } from 'react-ionicons'


function Navbar({ darkTheme, setDarkTheme }) {

    const imageUrl = `${window.location.origin}/assets/fblogonew.webp`;

    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname;
    const isProfile = location.pathname.startsWith('/profile/')

    const [searchText, setSearchText] = useState('');

    const handleChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleThemeToggle = () => {
        setDarkTheme(!darkTheme);
    };

    console.log(darkTheme)

    const styles = darkTheme ? darkstyles : lightstyles;

    const token = encryptStorage.getItem("jwtToken");
    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const [load, setLoad] = useState(false);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setLoad(true);

        if (searchText.trim() !== '') {
            setTimeout(() => {
                setLoad(false)
                navigate(`/search/${encodeURIComponent(searchText)}`);
            }, 1000); // Wait for 3 seconds (3000 milliseconds) before navigating
        }
    };

    const handleLinkProfile = () => {
        const name = `${userData.validateJWT.firstname}.${userData.validateJWT.surname}.${userData.validateJWT.id}`
        var ciphertext = CryptoJS.AES.encrypt(name, 'webeganteng').toString()
        const encodedEncryptedData = btoa(ciphertext);
        navigate(`/profile/${encodedEncryptedData}`)
    }

    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const logout = async () => {
        encryptStorage.clear();
        navigate('/');
    }

    const [isRotated, setIsRotated] = useState(false);

    const handleLabelClick = () => {
        setIsRotated(prevState => !prevState);
        handleThemeToggle();
    };

    return (
        <>
            {load && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '5' }}>
                    <img src="https://res.cloudinary.com/dw7bewmoo/image/upload/v1692715084/load_tm4zng.gif" width={"75px"} height={"75px"}></img>
                    <h1 style={{ color: 'white' }}>Searching up and down...</h1>
                </div>
            )}
            <div className={styles.navbar}>
                <div className={styles.left}>
                    <img src={imageUrl} style={{ width: '45px', height: '45px', cursor: 'pointer' }} onClick={() => navigate('/')}></img>
                    <div className={styles.searchBar}>
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Search in Facebook"
                                value={searchText}
                                onChange={handleChange}
                            />
                            <span className={styles.searchIcon}><AiOutlineSearch style={{ color: 'gray' }} /></span>
                        </form>
                    </div>
                </div>
                <div className={styles.center}>
                    <Link to="/">
                        {isHome === "/" ? (
                            <AiFillHome className={styles.iconNavbarActive} />
                        ) : (
                            <AiOutlineHome className={styles.iconNavbar} style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                    </Link>
                    <Link to="/friends">
                        {isHome === "/friends" ? (
                            <BiSolidUser className={styles.iconNavbarActive} />
                        ) : (
                            <BiUser className={styles.iconNavbar} style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                    </Link>
                    <Link to="/group">
                        {isHome === "/group" ? (
                            <BiSolidGroup className={styles.iconNavbarActive} />
                        ) : (
                            <BiGroup className={styles.iconNavbar} style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                    </Link>
                </div>
                <div className={styles.right}>
                    <Link to="/messenger">
                        {isHome === "/messenger" ? (
                            <RiMessengerFill className={styles.iconNavbarActive} />
                        ) : (
                            <RiMessengerLine className={styles.iconNavbar} />
                        )}
                    </Link>

                    <Link to="/notification">
                        {isHome === "/notification" ? (
                            <IoIosNotifications className={styles.iconNavbarActive} />
                        ) : (
                            <IoIosNotificationsOutline className={styles.iconNavbar} />
                        )}
                    </Link>
                    <a onClick={handleLinkProfile}>
                        {isProfile ? (
                            <img src={userData?.validateJWT?.profilepic} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid blue' }}></img>
                        ) : (

                            <img src={userData?.validateJWT?.profilepic} style={{ width: '30px', height: '30px', borderRadius: '50%' }}></img>
                        )}
                    </a>
                    <a onClick={() => setDropdownVisible(!isDropdownVisible)}>
                        <CgMenuGridO style={{ height: '30px', width: '35px' }} />
                    </a>
                    {isDropdownVisible && (
                        <div className={styles.dropdownContent} style={{ zIndex: '15' }}>
                            <label className={styles.lblMode} onClick={handleLabelClick}>
                                <BiSun
                                    className={`${styles.modeIcon} ${isRotated ? styles.rotate90 : ''}`}
                                />
                                <BiMoon
                                    className={`${styles.modeIcon} ${isRotated ? '' : styles.rotate90}`}
                                />
                                <span className={styles.toggleMode}></span>
                            </label>
                            <div className={styles.logoutBtn} onClick={logout}>Logout</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Navbar;