import React, { useEffect, useRef, useState } from "react";
import { useQuery, gql, useMutation, ApolloClient, InMemoryCache } from "@apollo/client";
import { ACC_REQ, DECLINE_FRIEND_REQ, GET_ALL_FRIENDS, GET_FRIEND_REQ, GET_USER, GET_USER_BY_TOKEN, SUGGESTED_FRIENDS } from "../../queries/userquery";
import { Navigate, useNavigate } from "react-router-dom";
import { encryptStorage } from "../auth/login";
import Navbar from "../../components/homepage/navbar";
import styles from "../../styles/style.module.scss";
import { IoMdCreate } from "react-icons/io";
import { AiOutlineClose, AiOutlineSearch, AiOutlineSend } from "react-icons/ai";
import Popup from "../../components/popup";
import { GET_ALL_CHATS, GET_MEDIA_POST, INSERT_CHAT_DETAILS, INSERT_CHAT_HEADER } from "../../queries/chatqueries";
import { ToastContainer, toast } from "react-toastify";
import { BsUpload } from "react-icons/bs";
import { BiImages, BiStop, BiStopCircle, BiUser } from "react-icons/bi";
import { MdKeyboardVoice, MdOutlineKeyboardVoice, MdPublic } from "react-icons/md";
import Axios from 'axios';
import { useReactMediaRecorder } from 'react-media-recorder';
import { RiVoiceprintLine } from "react-icons/ri";
import CardComponent from "../../components/homepage/cardPost";
import { FaUserFriends } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import ManualCarousel from "../../components/homepage/carousel";
import { GET_GROUP_BY_USERID } from "../../queries/groupqueries";
import GroupMessenger from "./groupmessenger";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";

// Create your Apollo Client instance
const client = new ApolloClient({
    uri: 'http://localhost:7778/query', // Replace with your server's URL
    cache: new InMemoryCache(),
});

const Messenger = () => {

    const savedTheme = localStorage.getItem('darkTheme');
    const [darkTheme, setDarkTheme] = useState(savedTheme === 'dark');

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const styles = darkTheme ? darkstyles : lightstyles;

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:7778/websocket');

        ws.onopen = () => {
            console.log('WebSocked opened')
        }

        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data)

            console.log('Received msg', message)

            await chatDataRefetch();

        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Cleanup WebSocket on component unmount
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [])

    const navigate = useNavigate();



    const [isAllFriends, setIsAllFriends] = useState(false);
    const [isFriendsHome, setIsFriendsHome] = useState(true);
    const [isApprovePage, setIsApprovePage] = useState(false);

    const [btnPopup, setBtnPopup] = useState(false);

    const [insertChatHeader] = useMutation(INSERT_CHAT_HEADER);
    const [insertChatDetail] = useMutation(INSERT_CHAT_DETAILS);

    const logout = async () => {
        encryptStorage.clear();
        navigate('/');
    }

    const token = encryptStorage.getItem("jwtToken");
    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: userData?.validateJWT?.id
        }
    });

    const { data: chatData, loading: chatDataLoading, refetch: chatDataRefetch } = useQuery(GET_ALL_CHATS, {
        variables: {
            userId: userData?.validateJWT?.id
        }
    })

    if (encryptStorage.getItem("jwtToken")) {
        console.log(chatData);
    }
    else {
        navigate('/login');
    }

    const { data: groupUserData } = useQuery(GET_GROUP_BY_USERID, {
        variables: {
            userId: userData?.validateJWT?.id
        }
    })

    console.log(groupUserData)

    const [targetChatId, setTargetChatId] = useState('');

    const startChat = async () => {
        if (targetChatId == "") {
            toast.error('Friends must be chosen!', {
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
            // Find the chat header with the selected user
            const existingChatHeader = chatData?.getAllConversation?.find(chatHeader =>
                (chatHeader.chatHeaderInformation.userId1 === targetChatId) ||
                (chatHeader.chatHeaderInformation.userId2 === targetChatId)
            );

            if (existingChatHeader) {
                setSelectedChatId(existingChatHeader.chatHeaderId);
                // Set selected sender and receiver based on user IDs
                if (userData?.validateJWT?.id === existingChatHeader.chatHeaderInformation.userId1) {
                    setSelectedSender(existingChatHeader.userId1Data.firstname + " " + existingChatHeader.userId1Data.surname);
                    setSelectedRecevier(existingChatHeader.userId2Data.firstname + " " + existingChatHeader.userId2Data.surname);
                } else {
                    setSelectedSender(existingChatHeader.userId2Data.firstname + " " + existingChatHeader.userId2Data.surname);
                    setSelectedRecevier(existingChatHeader.userId1Data.firstname + " " + existingChatHeader.userId1Data.surname);
                }
            }
            else {
                const newChatHeader = {
                    userId1: userData.validateJWT.id,
                    userId2: targetChatId
                }
                await insertChatHeader({
                    variables: {
                        newChatHeader: newChatHeader
                    }
                }).then(() => {
                    toast.success('Success insert chat!', {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    chatDataRefetch();
                })
            }
            setBtnPopup(false);
        }
    }

    const [selectedChatId, setSelectedChatId] = useState("");
    const [selectedSender, setSelectedSender] = useState("");
    const [selectedReceiver, setSelectedRecevier] = useState("");

    const [messageText, setMessageText] = useState("");

    function formatTime(timestamp) {
        const parsedDate = new Date(timestamp);
        const hours = parsedDate.getHours();
        const minutes = parsedDate.getMinutes();
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const amPm = hours >= 12 ? 'PM' : 'AM';

        return `${formattedHours}:${formattedMinutes} ${amPm}`;
    }

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
            } else {
                toast.error('File must be images!', {
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
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
    };

    const [isLoading, setIsLoading] = useState(false);
    // const [blob, setBlob] = useState(null); // To store the Blob data

    const sendMessage = async (chatHeaderId: string) => {

        if (selectedFile) {
            setIsLoading(true);
            const formData = new FormData()
            formData.append('file', selectedFile);
            formData.append('upload_preset', 'f8wczy1d');

            let mediaUrls
            let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
            apiUrl += 'image/upload';

            try {
                const response = await Axios.post(apiUrl, formData);
                const secureUrl = response.data.secure_url;
                mediaUrls = secureUrl
            } catch (error) {
                console.error('Error uploading file:', error);
            }

            const newChatDetail = {
                chatHeaderId: chatHeaderId,
                senderId: userData?.validateJWT?.id,
                chatText: messageText,
                type: "Media",
                mediaUrl: mediaUrls
            }
            await insertChatDetail({
                variables: {
                    newChatDetail: newChatDetail
                }
            }).then(() => {
                setMessageText("");
                setSelectedFile(null);
                chatDataRefetch();
                setIsLoading(false);
            })
        }
        else if (mediaBlobUrl) {
            console.log("COMBO", previewAudioStream)
            var blobUrl;
            var blobData;
            const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());


            const audiofile = new File([audioBlob], `${mediaBlobUrl}.wav`, { type: "audio/wav" })

            setIsLoading(true);
            const formData = new FormData()
            formData.append('file', audiofile);
            formData.append('upload_preset', 'f8wczy1d');

            let mediaUrls
            let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
            apiUrl += 'video/upload';

            try {
                const response = await Axios.post(apiUrl, formData);
                const secureUrl = response.data.secure_url;
                mediaUrls = secureUrl
            } catch (error) {
                console.error('Error uploading file:', error);
            }
            setIsLoading(false)
            const newChatDetail = {
                chatHeaderId: chatHeaderId,
                senderId: userData?.validateJWT?.id,
                chatText: messageText,
                type: "Media",
                mediaUrl: mediaUrls
            }

            await insertChatDetail({
                variables: {
                    newChatDetail: newChatDetail
                }
            }).then(() => {
                setMessageText("");
                setWantRecord(false);
                clearBlobUrl();
                chatDataRefetch();
                setIsLoading(false);
            })
        }
        else {
            const newChatDetail = {
                chatHeaderId: chatHeaderId,
                senderId: userData?.validateJWT?.id,
                chatText: messageText,
                type: "Text",
                mediaUrl: "null"
            }
            await insertChatDetail({
                variables: {
                    newChatDetail: newChatDetail
                }
            }).then(() => {
                setMessageText("");
                chatDataRefetch();
            })
        }
    }

    const [showTooltip, setShowTooltip] = useState(false);

    const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, previewAudioStream } =
        useReactMediaRecorder({
            video: false,
            audio: true,
            blobPropertyBag: {
                type: "audio/mp3"
            }
        });

    const [wantRecord, setWantRecord] = useState(false);

    const [recordingDuration, setRecordingDuration] = useState(0);


    useEffect(() => {
        let timerId;

        if (status === "recording") {
            setRecordingDuration(0); // Reset the duration to zero
            timerId = setInterval(() => {
                setRecordingDuration(prevDuration => prevDuration + 1);
            }, 1000);
        } else {
            setRecordingDuration(0); // Reset the duration to zero when not recording
        }

        return () => {
            clearInterval(timerId);
        };
    }, [status]);
    const calculateTimeAgo = (timestamp) => {
        const postDate = new Date(timestamp);
        return formatDistanceToNow(postDate, { addSuffix: true });
    };

    function formatDuration(durationInSeconds) {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    const [searchQuery, setSearchQuery] = useState("");

    const [groupChat, setGroupChat] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState("");

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            {isLoading && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '20' }}>
                    <img src="../assets/load.gif" width={"75px"} height={"75px"}></img>
                    <h1 style={{ color: 'white' }}>Uploading...</h1>
                </div>
            )}
            {status === "recording" && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '20' }}>
                    <img src="../assets/recording.gif" width={"105px"} height={"105px"}></img>
                    <h1 style={{ color: 'white', margin: '0px', marginTop: '15px', marginBottom: '20px' }}>
                        {formatDuration(recordingDuration)}
                    </h1>
                    <h1 style={{ color: 'white', margin: '0px', marginTop: '8px' }}>Recording your beautiful voice xD</h1>
                    <h1 style={{ color: 'white', margin: '0px', marginTop: '15px', marginBottom: '20px' }}>Hit the stop if you done!</h1>
                    <button onClick={
                        stopRecording
                    }
                        style={{
                            border: 'none',
                            background: 'transparent',
                        }}
                    >
                        <BiStop className={styles.stopRec} style={{ width: '45px', height: '45px', color: "red" }} />
                    </button>
                </div>
            )}
            <div className={styles.container} style={{ height: '100vh' }}>
                <div className={styles.sidebar} style={{ width: '18%', backgroundColor: darkTheme ? '#18191a' : 'white', color: darkTheme ? 'white' : 'black' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: '0px' }}>Chats</h2>
                        <IoMdCreate onClick={() => setBtnPopup(true)} style={{ width: '20px', height: '20px', backgroundColor: darkTheme ? '' : '#acacac', borderRadius: '50%', padding: '5px' }} />
                    </div>
                    <div className={styles.searchBarMessenger}>
                        <input
                            type="text"
                            placeholder="Search Chats & Users"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className={styles.searchIconMsg}><AiOutlineSearch style={{ color: 'gray' }} /></span>
                    </div>
                    <br></br>

                    {chatData?.getAllConversation?.map((chatHeader) => (
                        <div
                            // className={`${styles.selectChat} ${selectedChatId === chatHeader.id ? styles.selectedChat : ''}`}
                            className={selectedChatId === chatHeader.chatHeaderId ? styles.selectChat : styles.nonSelectChat}
                            onClick={() => {
                                setSelectedChatId(chatHeader.chatHeaderId)
                                if (userData?.validateJWT?.id === chatHeader.chatHeaderInformation.userId1) {
                                    setSelectedSender(chatHeader.userId1Data.firstname + " " + chatHeader.userId1Data.surname);
                                    setSelectedRecevier(chatHeader.userId2Data.firstname + " " + chatHeader.userId2Data.surname);
                                }
                                else {
                                    setSelectedSender(chatHeader.userId2Data.firstname + " " + chatHeader.userId2Data.surname);
                                    setSelectedRecevier(chatHeader.userId1Data.firstname + " " + chatHeader.userId1Data.surname);
                                }
                                setGroupChat(false)
                            }}>
                            <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%' }}></img>
                            {userData?.validateJWT?.id == chatHeader.chatHeaderInformation.userId1 ? (
                                <h4>{chatHeader.userId2Data.firstname} {chatHeader.userId2Data.surname}</h4>
                            ) : (

                                <h4>{chatHeader.userId1Data.firstname} {chatHeader.userId1Data.surname}</h4>
                            )}

                        </div>
                    ))}
                    {groupUserData?.getGroupById?.map((group) => (
                        <div className={styles.nonSelectChat} onClick={() => {
                            setGroupChat(true)
                            setSelectedChatId("")
                            setSelectedGroupId(group.ID)
                        }}>
                            <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%' }}></img>
                            <h4>{group.GroupName}</h4>
                        </div>
                        // <GroupMessenger groupId={group.ID} />
                    ))}
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white', width: '85%', overflowY: 'auto', padding: '0px', zIndex: 10 }}>
                    {groupChat ? (
                        <GroupMessenger groupId={selectedGroupId} />
                    ) : (
                        <>
                            <>
                                <div style={{ position: 'sticky', top: '0', display: 'flex', alignItems: 'center', flexDirection: 'row', backgroundColor: darkTheme ? '#18191a' : 'white', padding: '8px 15px 5px', gap: '10px', color: darkTheme ? 'white' : 'black' }}>
                                    <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%' }}></img>
                                    <h3>{selectedReceiver}</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ paddingLeft: '15px', paddingRight: '15px', paddingBottom: '55px' }}>
                                        {chatData?.getAllConversation?.map((chatHeader) => (
                                            selectedChatId === chatHeader.chatHeaderId && (
                                                <div key={chatHeader.id} style={{ color: darkTheme ? 'white' : 'black' }}>
                                                    {chatHeader?.chatDetailsInformation?.map((chatDetail, index) => {
                                                        const currentChatHeader = chatHeader;

                                                        return (
                                                            <>
                                                                <div key={chatDetail.id} style={{ display: 'flex', justifyContent: chatDetail.senderId === userData.validateJWT.id ? 'flex-end' : 'flex-start' }}>
                                                                    {chatDetail.chatText !== "" ? (
                                                                        <h4 style={{ marginBottom: '5px', backgroundColor: chatDetail.senderId === userData.validateJWT.id ? '#3083fd' : 'white', color: chatDetail.senderId === userData.validateJWT.id ? 'white' : 'black', padding: '10px', borderRadius: '10px' }}>
                                                                            {chatDetail.chatText}
                                                                        </h4>
                                                                    ) : (
                                                                        <>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {chatDetail.type === "Media" && (
                                                                    <div style={{ display: 'flex', justifyContent: chatDetail.senderId === userData.validateJWT.id ? 'flex-end' : 'flex-start', margin: '5px' }}>
                                                                        {chatDetail.mediaUrl.includes('.webm') ? (
                                                                            <audio src={chatDetail.mediaUrl} controls loop />
                                                                        ) : (
                                                                            <img src={chatDetail.mediaUrl} style={{ width: '170px', height: '150px' }} alt="Media" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {chatDetail.type === "Post" && (
                                                                    <>
                                                                        {currentChatHeader?.postData?.map((post, index) => {
                                                                            return (
                                                                                <>
                                                                                    <div key={chatDetail.id} style={{ display: 'flex', justifyContent: chatDetail.senderId === userData.validateJWT.id ? 'flex-end' : 'flex-start' }}>
                                                                                        <div className={styles.mainContainerCard} style={{ width: '22%', display: 'flex', justifyContent: 'end', alignItems: 'end' }}>
                                                                                            <div
                                                                                                style={{
                                                                                                    display: 'flex',
                                                                                                    flexDirection: 'row',
                                                                                                    justifyContent: 'flex-start',
                                                                                                    alignItems: 'center',
                                                                                                    marginBottom: '10px',
                                                                                                }}
                                                                                            >
                                                                                                <div
                                                                                                >
                                                                                                    <img
                                                                                                        src={currentChatHeader.postAuthor[index].profilepic}
                                                                                                        style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px', cursor: 'pointer' }}
                                                                                                    />
                                                                                                </div>

                                                                                                <div>
                                                                                                    <h4 style={{ margin: '0px 0px 5px 0px' }}>{currentChatHeader.postAuthor[index].firstname} {currentChatHeader.postAuthor[index].surname}</h4>
                                                                                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                                                                        <h5 style={{ margin: '0px', marginRight: '10px' }}>{calculateTimeAgo(post.postDate)}</h5>
                                                                                                        {currentChatHeader.postData[index].postPrivacy === "public" && (
                                                                                                            <MdPublic />
                                                                                                        )}
                                                                                                        {currentChatHeader.postData[index].postPrivacy == "friends" && (
                                                                                                            <FaUserFriends />
                                                                                                        )}
                                                                                                        {currentChatHeader.postData[index].postPrivacy == "specific" && (
                                                                                                            <BiUser />
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>

                                                                                            </div>
                                                                                            <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                                                                                            <div className="card-content">
                                                                                                <div dangerouslySetInnerHTML={{ __html: post.contentText }} />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </>)
                                                                        })}
                                                                    </>
                                                                )}
                                                                <div key={chatDetail.id} style={{ display: 'flex', justifyContent: chatDetail.senderId === userData.validateJWT.id ? 'flex-end' : 'flex-start', margin: '5px' }}>
                                                                    {formatTime(chatDetail.createdAt)}
                                                                </div>
                                                            </>
                                                        );
                                                    }
                                                    )}
                                                </div>
                                            )
                                        ))}
                                    </div >
                                    <div style={{ position: 'fixed', bottom: 0, background: darkTheme ? '#18191a' : 'white', width: '100%', padding: '10px', paddingTop: (selectedFile || wantRecord) ? "100px" : "10px", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '15px', color: darkTheme ? 'white' : 'black' }}>
                                        <div>
                                            {selectedFile && (
                                                <>
                                                    <div style={{ position: 'absolute', top: '10px', left: '100px' }}>
                                                        <div style={{ position: 'relative' }}>
                                                            <img src={URL.createObjectURL(selectedFile)} alt={`Image Preview`} style={{ position: 'relative', width: '80px', height: '80px' }} />
                                                            <button onClick={removeSelectedFile} style={{
                                                                border: 'none',
                                                                background: 'none',
                                                                position: 'absolute',
                                                                left: '45px',
                                                                top: '-3px'
                                                            }}>
                                                                <AiOutlineClose className={styles.removeMedBtn} style={{
                                                                    width: '13px',
                                                                    height: '13px',
                                                                }} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            {wantRecord && (
                                                <>
                                                    <div style={{ position: 'absolute', top: '25px', left: '35px' }}>
                                                        <div className={styles.btnRec} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                                                            <button onClick={
                                                                startRecording
                                                            }
                                                                style={{
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                }}
                                                            >
                                                                <MdOutlineKeyboardVoice style={{ width: '40px', height: '40px', color: status === "recording" ? "#1c1cff" : "black" }} />
                                                            </button>
                                                            {status === "idle" && <>
                                                                <>
                                                                    Ready to deliver your beautiful voice ? :D
                                                                    <br></br>
                                                                    Hit the mic button whenever you're ready!
                                                                </>
                                                            </>}
                                                            {status === "recording" &&
                                                                <>
                                                                    Recording your beautiful voice!
                                                                </>}
                                                            {status === "stopped" &&
                                                                <>
                                                                    <audio src={mediaBlobUrl} controls loop />
                                                                    <button onClick={clearBlobUrl}
                                                                        style={{
                                                                            border: 'none',
                                                                            background: 'red',
                                                                            borderRadius: '10px',
                                                                            padding: '10px',
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        Clear Voice
                                                                    </button>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <RiVoiceprintLine onClick={() => {
                                            if (wantRecord) {
                                                setWantRecord(false)
                                            }
                                            else {
                                                setWantRecord(true)
                                            }
                                        }} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3083fd', height: '2.5vh', width: '2.5vh' }} />
                                        <label className="file-input-label">
                                            <input type="file" className="file-input" style={{ display: 'none', width: '100%' }} onChange={handleFileInputChange} />
                                            <BiImages style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3083fd', height: '2.5vh', width: '2.5vh' }} />
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Type your message..."
                                            style={{
                                                width: '124vh',
                                                padding: '8px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: '#e8e8e8'
                                            }}
                                            onChange={(e) => setMessageText(e.target.value)}
                                        />
                                        <AiOutlineSend
                                            style={{
                                                opacity: (selectedFile === null && messageText === '' && !mediaBlobUrl) ? 0.8 : 1, // Set opacity based on messageText and selectedFile
                                                pointerEvents: (selectedFile === null && messageText === '' && !mediaBlobUrl) ? 'none' : 'auto', // Disable pointer events based on messageText and selectedFile
                                            }}
                                            className={styles.sendMsgBtn}
                                            onClick={() => sendMessage(selectedChatId)}
                                        />
                                    </div>
                                </div>
                            </>
                        </>
                    )}
                    {(!groupChat && selectedChatId == "") && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
                            Select a chat or start a new conversation
                        </div>
                    )}
                </div>
            </div >

            <Popup trigger={btnPopup} setTrigger={setBtnPopup}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                    <h2>Choose your friends</h2>
                    <select
                        style={{
                            width: '50%',
                            borderRadius: '15px',
                            marginBottom: '20px',
                            padding: '15px',
                        }}
                        onChange={(e) => setTargetChatId(e.target.value)}
                    >
                        <option value="">Choose your friends...</option>
                        {friendsData?.getAllFriends?.map((friend) => (
                            <option value={friend.FriendsID}>{friend.FriendsData.firstname} {friend.FriendsData.surname}</option>
                        ))}
                    </select>
                    <div className={styles.startChatBtn} onClick={startChat}>
                        Start a chat!
                    </div>
                </div>
            </Popup>
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
        </>
    );
};


export default Messenger;