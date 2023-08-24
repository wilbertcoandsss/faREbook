import React, { useEffect, useState } from "react";
import styles from "../../styles/style.module.scss";
import { formatDistanceToNow } from 'date-fns';
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { BiComment, BiSkipNextCircle, BiUser } from "react-icons/bi";
import { PiShareFatLight, PiShareFatFill } from "react-icons/pi";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_COMMENT, GET_COMMENTS, GET_LIKE_STATUS, LIKE_COMMENT, LIKE_POST, REPLY_COMMENT, UNLIKE_POST } from "../../queries/postquery";
import { encryptStorage } from "../../pages/auth/login";
import { GET_USER_BY_TOKEN } from "../../queries/userquery";
import Popup from "../popup";
import { RiSendPlane2Line, RiSendPlane2Fill } from "react-icons/ri";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CommentCard from "./commentCard";
import ManualCarousel from "./carousel";
import { GrFormNext, GrNext, GrPrevious } from "react-icons/gr";
import { Navigate, useNavigate } from "react-router-dom";
import cryptoJs from "crypto-js";
import { MdPublic } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";

const GroupCardComponent = ({ groupId, groupName, groupPP, post, fetchPost, darkTheme }) => {
    const [showTimeInfo, setShowTimeInfo] = useState(false);
    const [likePost, { data: likeData }] = useMutation(LIKE_POST);
    const [unlikePost, { data: unlikeData }] = useMutation(UNLIKE_POST);
    const [likeComment] = useMutation(LIKE_COMMENT);

    const styles = darkTheme ? darkstyles : lightstyles;

    const [commentText, setCommentText] = useState("");

    const [btnPopup, setBtnPopup] = useState(false);

    const token = encryptStorage.getItem("jwtToken");

    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data: likeStatusData, loading: likeStatusLoading } = useQuery(GET_LIKE_STATUS, {
        variables: {
            postId: post.id,
            userId: userData?.validateJWT.id
        }
    })


    const [isLike, setIsLike] = useState(false);
    const [isCommentLike, setIsCommentLike] = useState(false);


    useEffect(() => {
        if (!likeStatusLoading && likeStatusData && likeStatusData.getLikeStatus !== undefined) {
            setIsLike(likeStatusData.getLikeStatus);
        }
    }, [likeStatusData, likeStatusLoading]);

    const [insertComment] = useMutation(ADD_COMMENT);

    const { data: commentData, loading: commentLoading, refetch: commentRefetch } = useQuery(GET_COMMENTS, {
        variables: {
            postId: post.id // Assuming you have the post ID available
        }
    });

    const calculateTimeAgo = (timestamp) => {
        const postDate = new Date(timestamp);
        return formatDistanceToNow(postDate, { addSuffix: true });
    };

    if (commentLoading) {
        return <div>Loading</div>
    }

    const handleLike = async (postID: string) => {
        console.log("DALEM", isLike)
        if (isLike) {
            setIsLike(false);
            await unlikePost({
                variables: {
                    userId: userData.validateJWT.id,
                    postId: postID
                }
            });
        } else {
            setIsLike(true);
            await likePost({
                variables: {
                    userId: userData.validateJWT.id,
                    postId: postID
                }
            });
        }
        fetchPost();
    };


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

    const handleComment = async (postID: string) => {
        console.log("Sundul gan likenya", postID);
        setBtnPopup(true);
    }

    return (
        <>
            <div className={styles.mainContainerCard}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <img src={groupPP} style={{ width: '95px', height: '95px', borderRadius: '50%', marginRight: '20px' }}></img>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, padding: '2px' }}>
                            <img src="../assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                        </div>
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h3 style={{ margin: '0px 0px 5px 0px' }}>{groupName}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ margin: '0px 0px 5px 0px' }}>{post?.authorData.firstname} {post?.authorData.surname}</h4>
                            <h5 style={{ margin: '0px', marginRight: '10px' }}>{calculateTimeAgo(post.postDate)}</h5>
                        </div>
                            {post?.postPrivacy === "public" && (
                                <MdPublic />
                            )}
                            {post?.postPrivacy == "friends" && (
                                <FaUserFriends />
                            )}
                            {post?.postPrivacy == "specific" && (
                                <BiUser />
                            )}
                    </div>
                </div>
                <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                <div className="card-content">
                    <div dangerouslySetInnerHTML={{ __html: post?.contentText }} />
                    {/* Render media URLs */}
                    <div className="media-container">
                        {post?.mediaUrl && post?.mediaUrl.length > 0 && (
                            <ManualCarousel items={post.mediaUrl} />
                        )}
                    </div>
                </div>
                <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                    <div>
                        <button
                            onClick={() => handleLike(post.id)}
                            style={{ background: 'none', border: 'none' }}>
                            {isLike ? (
                                <AiFillLike className={styles.iconNavbarActive} />
                            ) : (
                                <AiOutlineLike className={styles.iconNavbar} color={darkTheme ? 'white' : 'black'} />
                            )}
                        </button>
                    </div>
                    <div>
                        <button
                            style={{ background: 'none', border: 'none' }}
                            onClick={() => handleComment(post.id)}>
                            <BiComment className={styles.iconNavbar} color={darkTheme ? 'white' : 'black'} />
                        </button>
                    </div>
                    <div>
                        <PiShareFatLight className={styles.iconNavbar}color={darkTheme ? 'white' : 'black'}  />
                    </div>
                </div>
                <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                Liked by {post.likedCount}
            </div>
            {/* Comment Popup */}
            <Popup trigger={btnPopup} setTrigger={setBtnPopup} darkTheme={darkTheme}
            >
                <div>
                    <h2 style={{ position: 'sticky', top: '-33px', backgroundColor: darkTheme ? '' : 'white', zIndex: 1, padding: '33px', margin: '0px' }}>
                        {post.authorData.firstname} {post.authorData.surname}'s Post
                    </h2>
                    <div className={styles.mainContainerCard} style={{ width: "93%" }}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                                <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                            </div>
                            <div>
                                <h4 style={{ margin: '0px 0px 5px 0px' }}>{post.authorData.firstname} {post.authorData.surname}</h4>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <h5 style={{ margin: '0px', marginRight: '10px' }}>{calculateTimeAgo(post.postDate)}</h5>
                                    {post?.postPrivacy === "public" && (
                                        <MdPublic />
                                    )}
                                    {post?.postPrivacy == "friends" && (
                                        <FaUserFriends />
                                    )}
                                    {post?.postPrivacy == "specific" && (
                                        <BiUser />
                                    )}
                                </div>
                            </div>
                        </div>
                        <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                        <div className="card-content">
                            <div dangerouslySetInnerHTML={{ __html: post.contentText }} />
                            {/* Render media URLs */}
                            <div className="media-container">
                                {post.mediaUrl && post.mediaUrl.length > 0 && (
                                    <ManualCarousel items={post.mediaUrl} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div key={commentData.ID}>
                    {
                        commentData.getAllComments.map((comment) => (
                            <CommentCard key={comment.ID} commentData={comment} fetchPost={commentRefetch} darkTheme={darkTheme} />
                        ))
                    }
                </div>
                <div className={styles.insertComment}>
                    <div>
                        <img src="assets/Capture.PNG" style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
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
                            onClick={() => addComment(post.id)}
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
    );
};

export default GroupCardComponent;