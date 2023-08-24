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
import { BsUpload } from "react-icons/bs";
import Axios from 'axios';
import { INSERT_MEDIA } from "../../queries/postquery";
import { INSERT_REELS } from "../../queries/reelsquery";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
import Navbar from "../../components/homepage/navbar";

const CreateReels = (refetchStories) => {
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
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo',
                'video/x-flv',
                'video/x-matroska',
                'video/webm',
                'video/mkv'
            ];

            if (allowedTypes.includes(newSelectedFile.type)) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.src = URL.createObjectURL(newSelectedFile);

                video.onloadedmetadata = () => {
                    console.log("durasinya berapa", video.duration);
                    if (video.duration >= 1 && video.duration <= 60) { // Maximum duration in seconds
                        setSelectedFile(newSelectedFile);
                        setErrorMsg('');
                    } else {
                        setErrorMsg('Video duration should be minimum 1 seconds or maximum 60 seconds');
                    }
                };
            } else {
                setErrorMsg('Only video files are allowed.');
            }
        }
        console.log(selectedFile);
    };


    const [selectedFontColor, setSelectedFontColor] = useState('#ffffff');

    const removeSelectedFile = () => {
        setSelectedFile(null);
    };

    const [insertReels] = useMutation(INSERT_REELS);
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

    const fontColorPalettes = [
        ['#ffffff', '#bfbfbf', '#8c8c8c', '#595959', '#000000'],
    ]


    const addReels = async () => {
        if (selectedFile == null) {
            setErrorMsg("Video must be uploaded!")
            toast.error('Video must be uploaded!', {
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

            const newReels = {
                UserID: userData.validateJWT.id,
                Caption: displayText,
                ReelsDate: formattedDateTime,
                FontColor: selectedFontColor
            }

            let mediaUrls: string[] = []
            setIsLoading(true);


            const formData = new FormData()
            formData.append('file', selectedFile);
            formData.append('upload_preset', 'f8wczy1d');

            let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
            apiUrl += 'video/upload';

            try {
                const response = await Axios.post(apiUrl, formData);
                const secureUrl = response.data.secure_url;
                mediaUrls.push(secureUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
            }

            const result = await insertReels({
                variables: {
                    newReels: newReels
                }
            })

            await insertMedia({
                variables: {
                    postId: result.data.insertReel.Id,
                    mediaUrls: mediaUrls
                }
            }).finally(() => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1500);
                navigate('/reels');
            })
        }
    }

    return (
        <>
            {isLoading && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '5' }}>
                    <img src="assets/load.gif" width={"75px"} height={"75px"}></img>
                    <h1 style={{ color: 'white' }}>Uploading...</h1>
                </div>
            )}
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <div className={styles.container}>
                <div className={styles.sidebar} style={{ backgroundColor: darkTheme ? '#18191a' : 'whitesmoke', color: darkTheme ? 'white' : 'black' }}>
                    <div>
                        <AiOutlineCloseCircle style={{ width: '50px', height: '50px' }} onClick={() => navigate('/reels')} />
                        <hr className={styles.lineBreak}></hr>
                    </div>
                    <div>
                        <h3>Create a Reel</h3>
                        <h2>Upload a video</h2>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                            <h3>{userData.validateJWT.firstname} {userData.validateJWT.surname}</h3>
                        </div>
                    </div>
                    <hr className={styles.lineBreak}></hr>

                    <div className={styles.uploadInnerContainer}>
                        <label className="file-input-label">
                            <input type="file" className="file-input" style={{ display: 'none', width: '100%' }} onChange={handleFileInputChange} />
                            <BsUpload style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '6vh' }} />
                            Add Video to upload
                        </label>
                    </div>
                    {selectedFile && (
                        <>
                            <div>
                                <button onClick={removeSelectedFile} className={styles.deleteImgStoryBtn}>
                                    Remove Video
                                </button>
                            </div>
                            <h3>Text</h3>
                            <div className={styles.formInputTextStories}>
                                <textarea placeholder="Start Typing" onChange={(e) => setDisplayText(e.target.value)}></textarea>
                            </div>
                            {errorMsg && (
                                <div className={styles.errorContainerUpload} style={{ height: '13vh' }}>
                                    <AiOutlineCloseCircle style={{ width: '50px', height: '50px' }} />
                                    <br></br>
                                    {errorMsg}
                                </div>
                            )}
                            <br></br>
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
                        </>
                    )}
                    <div>
                        <button className={styles.shareStoryBtn} onClick={addReels}>
                            Share to story
                        </button>
                    </div>
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white' }}>
                    <div className={styles.textStoriesPreviewOuter}>
                        <h3 style={{ marginTop: '10px', marginBottom: '15px' }}>Preview</h3>
                        <div style={{ background: 'grey', width: '100%', height: '77vh', borderRadius: '15px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '0', bottom: '0', left: '0', right: '0', border: '1px solid black' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    {selectedFile && (
                                        <div>
                                            <video
                                                key={selectedFile.name} // Use the name or another unique identifier as the key
                                                muted
                                                loop
                                                preload="auto"
                                                autoPlay={true}
                                                className={styles.reelsVid}
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', backgroundColor: 'black' }}
                                            >
                                                <source src={URL.createObjectURL(selectedFile)} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            <p style={{ position: 'absolute', left: '50%', bottom: '5%', transform: 'translate(-50%, 80%)', textAlign: 'center', color: selectedFontColor, width: '20%' }}>
                                                {displayText}
                                            </p>
                                        </div>
                                    )}
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

export default CreateReels;