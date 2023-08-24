import React, { useEffect, useState } from "react";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import { RiMessengerFill, RiMessengerLine } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/style.module.scss";
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlinePlus } from "react-icons/ai";
import { encryptStorage } from "../auth/login";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_BY_TOKEN } from "../../queries/userquery";
import { BiImageAdd } from "react-icons/bi";
import { PiTextAaBold } from "react-icons/pi";
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";
import { INSERT_STORIES } from "../../queries/storiesquery";
import { ToastContainer, toast } from "react-toastify";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
import Navbar from "../../components/homepage/navbar";

const CreateText = (refetchStories) => {

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
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const isHome = location.pathname;

    const token = encryptStorage.getItem("jwtToken");

    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const [insertStories] = useMutation(INSERT_STORIES);
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [displayText, setDisplayText] = useState('');
    const [selectedBg, setSelectedBg] = useState('#FF5733');
    const [selectedFontColor, setSelectedFontColor] = useState('#d9d9d9');

    const [expanded, setExpanded] = useState(false);
    const handleDropdownClick = () => {
        setExpanded(!expanded);
    };

    if (userLoading) {
        return <div>Loading</div>
    }

    const fontFamilies = [
        'Arial',
        'Times New Roman',
        'Courier New, monospace',
        'Georgia',
        'Verdana',
        'Comic Sans MS'
    ];

    const colorPalettes = [
        ['#FF5733', '#FFBD33', '#FFFB33', '#BDFF33', '#33FF57'],
        ['#33FFBD', '#33F9FF', '#33B4FF', '#3357FF', '#9033FF'],
        ['#E033FF', '#FF33F6', '#FF33A5', '#FF3365', '#FF3E33'],
        ['#79553D', '#25221B', '#231A24', '#C93C20', ' #79553D'],
        ['#49678D', '#9B111E', ' #EA899A', '#4A192C', '#000000'],
    ];

    const fontColorPalettes = [
        ['#ffffff', '#bfbfbf', '#8c8c8c', '#595959', '#262626'],
    ]

    const addStories = async () => {
        if (displayText == "") {
            toast.error('Text must be not empty!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
        else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(today.getDate()).padStart(2, '0');
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');
            const seconds = String(today.getSeconds()).padStart(2, '0');

            const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            const newInputStories = {
                UserID: userData.validateJWT.id,
                Type: "Text",
                BgColor: selectedBg,
                FontFamily: selectedFont,
                FontColor: selectedFontColor,
                TextContent: displayText,
                Date: formattedDateTime
            }

            setIsLoading(true);

            await insertStories({
                variables: {
                    newStories: newInputStories
                }
            }).finally(() => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1500);
                navigate('/stories');
            })
        }
    }


    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            {isLoading && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '5' }}>
                    <img src="assets/load.gif" width={"75px"} height={"75px"}></img>
                    <h1 style={{ color: 'white' }}>Uploading...</h1>
                </div>
            )}
            <div className={styles.container}>
                <div className={styles.sidebar} style={{ backgroundColor: darkTheme ? '#18191a' : 'white', color: darkTheme ? 'white' : 'black' }}>
                    <div>
                        <AiOutlineCloseCircle style={{ width: '50px', height: '50px' }} onClick={() => navigate('/createstories')} />
                        <hr className={styles.lineBreak}></hr>
                    </div>
                    <div>
                        <h3>Your Story</h3>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                            <h3>{userData.validateJWT.firstname} {userData.validateJWT.surname}</h3>
                        </div>
                    </div>
                    <hr className={styles.lineBreak}></hr>
                    <h3>Text</h3>
                    <div className={styles.formInputTextStories}>
                        <textarea placeholder="Start Typing" onChange={(e) => setDisplayText(e.target.value)}></textarea>
                    </div>
                    <h3>Font Style</h3>
                    <div>
                        <select
                            value={selectedFont}
                            onChange={(e) => setSelectedFont(e.target.value)}
                            className={styles.fontStyleSelect}
                        >
                            {fontFamilies.map((font, index) => (
                                <option key={index} value={font}>
                                    {font}
                                </option>
                            ))}
                        </select>
                    </div>
                    <h3>Font Color</h3>
                    <div className={styles.colorPalette}>
                        {fontColorPalettes.map((palette, index) => (
                            <div key={index} className={styles.colorPaletteRow}>
                                {palette.map((color, colorIndex) => (
                                    <div
                                        key={colorIndex}
                                        className={`${styles.colorBox} ${selectedFontColor === color ? styles.selectedColorBox : ''}`}
                                        style={{ background: color }}
                                        onClick={() => setSelectedFontColor(color)}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <h3>Background</h3>
                    <div>
                        <div className={styles.colorPalette}>
                            {colorPalettes.slice(0, expanded ? colorPalettes.length : 2).map((palette, index) => (
                                <div key={index} className={styles.colorPaletteRow}>
                                    {palette.map((color, colorIndex) => (
                                        <div
                                            key={colorIndex}
                                            className={`${styles.colorBox} ${selectedBg === color ? styles.selectedColorBox : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedBg(color)}
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className={styles.dropdownSymbol} onClick={handleDropdownClick}>
                            {expanded ? <IoIosArrowDropup style={{color: darkTheme ? 'white' : 'black'}} /> : <IoIosArrowDropdown  style={{color: darkTheme ? 'white' : 'black'}} />}
                        </div>
                    </div>
                    <div>
                        <button className={styles.shareStoryBtn} onClick={addStories}>
                            Share to story
                        </button>
                    </div>
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white' }}>
                    <div className={styles.textStoriesPreviewOuter}>
                        <h3 style={{ marginTop: '10px', marginBottom: '15px' }}>Preview</h3>
                        <div style={{ background: 'black', width: '100%', height: '77vh', borderRadius: '15px' }}>
                            <div className={styles.textStoriesPreviewInner} style={{ fontFamily: selectedFont, background: selectedBg, color: selectedFontColor, textAlign: 'center', paddingLeft: '10px', paddingRight: '10px' }}>
                                {displayText}
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </>
    )
}

export default CreateText;