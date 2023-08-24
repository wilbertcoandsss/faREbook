import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/style.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RiMessengerFill, RiMessengerLine, RiSendPlane2Fill, RiSendPlane2Line } from "react-icons/ri";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import { AiFillLike, AiOutlineClose, AiOutlineLike, AiOutlinePause, AiOutlinePauseCircle, AiOutlinePlayCircle } from "react-icons/ai";
import { BiComment, BiVideo } from "react-icons/bi";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_REELS, LIKE_REELS, UNLIKE_REELS } from "../../queries/reelsquery";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { BsVolumeDownFill, BsVolumeMuteFill } from "react-icons/bs";
import { ADD_COMMENT, GET_COMMENTS, GET_LIKE_STATUS, LIKE_COMMENT, LIKE_POST, UNLIKE_POST } from "../../queries/postquery";
import { encryptStorage } from "../auth/login";
import { GET_USER_BY_TOKEN } from "../../queries/userquery";
import Popup from "../../components/popup";
import { formatDistanceToNow } from "date-fns";
import CommentCard from "../../components/homepage/commentCard";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
import Navbar from "../../components/homepage/navbar";

const ReelsPage = () => {
    const savedTheme = localStorage.getItem('darkTheme');
    const [darkTheme, setDarkTheme] = useState(savedTheme === 'dark');

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const styles = darkTheme ? darkstyles : lightstyles;

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const location = useLocation();
    const isHome = location.pathname;
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [likeReels] = useMutation(LIKE_REELS);
    const [unlikeReels] = useMutation(UNLIKE_REELS);

    const token = encryptStorage.getItem("jwtToken");

    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data, loading, error, refetch: refetchReels } = useQuery(GET_ALL_REELS);

    const { data: commentData, loading: commentLoading, refetch: commentRefetch } = useQuery(GET_COMMENTS, {
        variables: {
            postId: data?.getAllReels[currentIndex].Id // Assuming you have the post ID available
        }
    });

    const { data: likeStatusData, loading: likeStatusLoading } = useQuery(GET_LIKE_STATUS, {
        variables: {
            postId: data?.getAllReels[currentIndex].Id,
            userId: userData?.validateJWT.id
        }
    })

    const handleNext = () => {
        refetchReels()
        setIsMuted(false);
        setIsPlaying(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.getAllReels.length);
    };

    const handlePrevious = () => {
        refetchReels()
        setIsMuted(false);
        setIsPlaying(true);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + data.getAllReels.length) % data.getAllReels.length);
    };

    useEffect(() => {
        if (!likeStatusLoading && likeStatusData?.getLikeStatus !== undefined) {
            setIsLike(likeStatusData.getLikeStatus);
        }
        else if (likeStatusData?.getLikeStatus === undefined) {
            setIsLike(false)
        }
    }, [likeStatusData, likeStatusLoading, refetchReels]);


    const handleVideoClick = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleToggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    useEffect(() => {
        refetchReels();
    })

    const [isLike, setIsLike] = useState(false);
    const [isCommentLike, setIsCommentLike] = useState(false);

    const handleLike = async (postID: string) => {
        console.log(postID)
        if (isLike) {
            console.log("UNLIKE")
            setIsLike(false);
            await unlikeReels({
                variables: {
                    userId: userData?.validateJWT.id,
                    reelsId: postID
                }
            });
        } else {

            console.log("UNLIKE")
            setIsLike(true);
            await likeReels({
                variables: {
                    userId: userData?.validateJWT.id,
                    reelsId: postID
                }
            });
        }
        refetchReels();
    };


    const [commentText, setCommentText] = useState("");

    const [btnPopup, setBtnPopup] = useState(false);

    const handleComment = async (postID: string) => {
        console.log("Sundul gan likenya", postID);
        setBtnPopup(true);
    }

    const calculateTimeAgo = (timestamp) => {
        const postDate = new Date(timestamp);
        return formatDistanceToNow(postDate, { addSuffix: true });
    };
    const [insertComment] = useMutation(ADD_COMMENT);

    const addComment = async (postID: string) => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');

        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        await insertComment({
            variables: {
                postId: postID,
                userId: userData.validateJWT.id,
                comment: commentText,
                date: formattedDateTime
            }
        }).then(() => {
            commentRefetch()
        })
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.mainReels} style={{ paddingBottom: '35px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <button style={{ border: 'none', outline: 'none', background: 'transparent' }}>
                            <AiOutlineClose onClick={() => navigate('/')} style={{ width: '30px', height: '30px', padding: '7px', borderRadius: '25px', color: 'white' }} />
                        </button>
                        <div>
                            <img src="assets/fblogonew.webp" style={{ width: '45px', height: '45px' }}></img>
                        </div>
                        <div>
                            <h2 style={{ color: 'white' }}>Reels</h2>
                        </div>
                    </div>
                    <div style={{
                        position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                    }}>
                        <video
                            key={data?.getAllReels[currentIndex].MediaUrl}
                            ref={videoRef}
                            preload="auto"
                            autoPlay={true}
                            className={styles.reelsVid}
                            onClick={handleVideoClick}
                            onEnded={handleNext}>
                            <source src={data?.getAllReels[currentIndex].MediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        {!isPlaying && (
                            <div onClick={handleVideoClick}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    background: 'rgba(0, 0, 0, 0.5)',
                                }}>
                                <AiOutlinePauseCircle style={{ width: '150px', height: '100px', color: 'white' }} />
                            </div>
                        )}
                        <p onClick={handlePrevious} style={{ position: 'absolute', left: '45%', bottom: '40%', transform: 'translate(-100%, -50%)', textAlign: 'center', color: 'white', width: '20%' }}>
                            <MdNavigateBefore style={{ width: '60px', height: '60px', backgroundColor: 'grey', borderRadius: '50%' }} />
                        </p>
                        <p onClick={handleNext} style={{ position: 'absolute', left: '75%', bottom: '40%', transform: 'translate(-100%, -50%)', textAlign: 'center', color: 'white', width: '20%' }}>
                            <MdNavigateNext style={{ width: '60px', height: '60px', backgroundColor: 'grey', borderRadius: '50%' }} />
                        </p>
                        <p style={{ position: 'absolute', left: '50%', bottom: '10%', transform: 'translate(-50%, 80%)', textAlign: 'justify', color: 'white', width: '20%', fontWeight: 'bold', background: 'rgba(0, 0, 0, 0.7)', height: '10vh', padding: '12px', borderRadius: '10px' }}>
                            {data?.getAllReels[currentIndex].Caption}
                        </p>
                        <div style={{ position: 'absolute', left: '45%', bottom: '6%', transform: 'translate(50%, 80%)', textAlign: 'center', color: 'white', width: '20%' }}>
                            <button
                                onClick={() => handleLike(data?.getAllReels[currentIndex].Id)}
                                style={{ background: 'none', border: 'none', color: 'white' }}>
                                {isLike ? (
                                    <AiFillLike className={styles.iconNavbarActive} />
                                ) : (
                                    <AiOutlineLike className={styles.iconNavbar} />
                                )}
                            </button>
                            <h3 style={{ margin: '0px', color: 'white' }}>{data?.getAllReels[currentIndex].LikedCount}</h3>
                        </div>
                        <div style={{ position: 'absolute', left: '45%', bottom: '15%', transform: 'translate(50%, 70%)', textAlign: 'center', color: 'white', width: '20%' }}>
                            <button
                                style={{ background: 'none', border: 'none', color: 'white' }}
                                onClick={() => handleComment(data?.getAllReels[currentIndex].id)}>
                                <BiComment className={styles.iconNavbar} />
                            </button>
                            <h3 style={{ margin: '0px', color: 'white' }}>{data?.getAllReels[currentIndex].CommentCount}</h3>
                        </div>
                        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'space-around', left: '53.5%', bottom: '96.4%', transform: 'translate(50%, 70%)', textAlign: 'center', color: 'white', width: '5%' }} onClick={handleToggleMute}>
                            {isPlaying ? <AiOutlinePlayCircle className={styles.reelsVidBtn} /> : <AiOutlinePauseCircle className={styles.reelsVidBtn} />}
                            {isMuted ? <BsVolumeMuteFill className={styles.reelsVidBtn} /> : <BsVolumeDownFill className={styles.reelsVidBtn} />}
                        </div>
                        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', right: '54%', bottom: '97%', transform: 'translate(50%, 70%)', textAlign: 'left', color: 'white', gap: '15px' }} onClick={handleToggleMute}>
                            <img src="assets/Capture.PNG" style={{ width: '35px', height: '35px', borderRadius: '50%' }}></img>
                            <h4>{data?.getAllReels[currentIndex]?.AuthorData.firstname} {data?.getAllReels[currentIndex].AuthorData.surname}</h4>
                        </div>
                    </div>
                </div>
            </div>
            <button className={styles.uploadReelsBtn} onClick={() => navigate('/createreels')}>
                <BiVideo style={{ width: '50px', height: '50px' }} />
                Create Reels
            </button>

            <Popup trigger={btnPopup} setTrigger={setBtnPopup} darkTheme={darkTheme}
            >
                <div>
                    <h2 style={{ position: 'sticky', top: '-33px', backgroundColor: darkTheme ? '' : 'white', zIndex: 1, padding: '33px', margin: '0px' }}>
                        {data?.getAllReels[currentIndex].AuthorData.firstname} {data?.getAllReels[currentIndex].AuthorData.surname}'s Reels
                    </h2>
                </div>

                <div key={commentData?.ID}>
                    {
                        commentData?.getAllComments?.map((comment) => (
                            <CommentCard key={comment.ID} commentData={comment} fetchPost={commentRefetch} darkTheme={darkTheme} />
                        ))
                    }
                </div>
                <div className={styles.insertComment}>
                    <div>
                        <img src={userData?.validateJWT?.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                    </div>
                    <br></br>
                    <ReactQuill
                        value={commentText}
                        onChange={setCommentText}
                        placeholder="Write a comment..."
                        theme="snow"
                        style={{
                            border: 'none',
                            width: '100%',
                            maxHeight: '200px', // Adjust the height as needed
                            overflowY: 'auto'
                        }}
                    />
                    {commentText ? (
                        <button
                            onClick={() => addComment(data?.getAllReels[currentIndex].Id)}
                            style={{ background: 'none', border: 'none' }}
                        >
                            <RiSendPlane2Fill className={styles.iconSend} />
                        </button>
                    ) : (
                        <button
                            style={{ background: 'none', border: 'none', cursor: commentText.length === 0 ? 'not-allowed' : 'pointer' }}
                            disabled={commentText.length === 0}

                        >
                            <RiSendPlane2Line className={styles.iconSend} />
                        </button>
                    )}
                </div>
            </Popup >
        </>
    )
}

export default ReelsPage;