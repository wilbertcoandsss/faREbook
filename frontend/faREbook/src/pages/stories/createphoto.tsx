import React, { useEffect, useState } from "react";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import { RiMessengerFill, RiMessengerLine } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlinePlus } from "react-icons/ai";
import { encryptStorage } from "../auth/login";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_BY_TOKEN } from "../../queries/userquery";
import { BiImageAdd } from "react-icons/bi";
import { PiTextAaBold } from "react-icons/pi";
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";
import { INSERT_STORIES } from "../../queries/storiesquery";
import { ToastContainer, toast } from "react-toastify";
import { BsUpload } from "react-icons/bs";
import Axios from 'axios';
import { INSERT_MEDIA } from "../../queries/postquery";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
import Navbar from "../../components/homepage/navbar";

const CreatePhoto = (refetchStories) => {
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

    const [zoomLevel, setZoomLevel] = useState(100); // Initial zoom level is 100%

    const handleZoomChange = (event) => {
        const newZoomLevel = parseInt(event.target.value);
        setZoomLevel(newZoomLevel);
    };

    const [errorMsg, setErrorMsg] = useState("");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newSelectedFile = event.target.files[0];
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/bmp',
                'image/webp',
            ];

            if (allowedTypes.includes(newSelectedFile.type) && newSelectedFile.size <= 10 * 1024 * 1024) {
                setSelectedFile(newSelectedFile);
                setErrorMsg("");
            } else {
                setErrorMsg('Only image files are allowed.');
            }
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
    };

    const [insertStories] = useMutation(INSERT_STORIES);
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [displayText, setDisplayText] = useState('');
    const [selectedBg, setSelectedBg] = useState('#FF5733');

    const [expanded, setExpanded] = useState(false);
    const handleDropdownClick = () => {
        setExpanded(!expanded);
    };

    const [insertMedia, { data: mediaData }] = useMutation(INSERT_MEDIA);

    if (userLoading) {
        return <div>Loading</div>
    }

    const colorPalettes = [
        ['#FF5733', '#FFBD33', '#FFFB33', '#BDFF33', '#33FF57'],
        ['#33FFBD', '#33F9FF', '#33B4FF', '#3357FF', '#9033FF'],
        ['#E033FF', '#FF33F6', '#FF33A5', '#FF3365', '#FF3E33'],
        ['#79553D', '#25221B', '#231A24', '#C93C20', ' #79553D'],
        ['#49678D', '#9B111E', ' #EA899A', '#4A192C', '#000000'],
    ];


    const addStories = async () => {
        if (selectedFile == null) {
            setErrorMsg("Photo must be uploaded!")
            toast.error('Photo must be uploaded!', {
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
                Type: "Photo",
                BgColor: selectedBg,
                Date: formattedDateTime,
                ZoomLevel: zoomLevel
            }
            let mediaUrls: string[] = []
            setIsLoading(true);


            const formData = new FormData()
            formData.append('file', selectedFile);
            formData.append('upload_preset', 'f8wczy1d');

            let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
            apiUrl += 'image/upload';

            try {
                const response = await Axios.post(apiUrl, formData);
                const secureUrl = response.data.secure_url;
                mediaUrls.push(secureUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
            }

            const result = await insertStories({
                variables: {
                    newStories: newInputStories
                }
            })

            console.log(result.data);
            await insertMedia({
                variables: {
                    postId: result.data.insertStories.ID,
                    mediaUrls: mediaUrls
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
                    {errorMsg && (
                        <div className={styles.errorContainerUpload} style={{ height: '13vh' }}>
                            <AiOutlineCloseCircle style={{ width: '50px', height: '50px' }} />
                            <br></br>
                            {errorMsg}
                        </div>
                    )}
                    <br></br>
                    <div className={styles.uploadInnerContainer}>
                        <label className="file-input-label">
                            <input type="file" className="file-input" style={{ display: 'none', width: '100%' }} onChange={handleFileInputChange} />
                            <BsUpload style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '6vh' }} />
                            Add Photo to upload
                        </label>
                    </div>
                    {selectedFile && (
                        <>
                            <h2>Zoom Level</h2>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', width: '100%' }}>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="10"
                                    value={zoomLevel}
                                    onChange={handleZoomChange}
                                    style={{
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <div>
                                <button onClick={removeSelectedFile} className={styles.deleteImgStoryBtn}>
                                    Remove Photo
                                </button>
                            </div>
                        </>
                    )}
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
                            {expanded ? <IoIosArrowDropup style={{ color: darkTheme ? 'white' : 'black' }} /> : <IoIosArrowDropdown style={{ color: darkTheme ? 'white' : 'black' }} />}
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
                            <div className={styles.textStoriesPreviewInner} style={{ fontFamily: selectedFont, background: selectedBg, paddingLeft: '10px', paddingRight: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '100%' }}>
                                        {selectedFile && (
                                            <div style={{ position: 'relative', marginBottom: '10px', transform: `scale(${zoomLevel / 100})` }}>
                                                <img src={URL.createObjectURL(selectedFile)} alt={`Image Preview`} style={{ position: 'relative', width: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
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

export default CreatePhoto;