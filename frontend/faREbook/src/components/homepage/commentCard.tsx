import React, { useEffect, useState } from "react";
import styles from "../../styles/style.module.scss";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { GET_ALL_REPLIES, GET_LIKE_STATUS, LIKE_COMMENT, LIKE_POST, REPLY_COMMENT, UNLIKE_COMMENT, UNLIKE_POST } from "../../queries/postquery";
import { useMutation, useQuery } from "@apollo/client";
import { encryptStorage } from "../../pages/auth/login";
import { GET_ALL_FRIENDS, GET_USER_BY_TOKEN } from "../../queries/userquery";
import { formatDistanceToNow } from "date-fns";
import { BiComment } from "react-icons/bi";
import ReactQuill from "react-quill";
import { RiSendPlane2Fill, RiSendPlane2Line } from "react-icons/ri";
import "react-quill/dist/quill.snow.css";
import { PiShareFatLight } from "react-icons/pi";
import lightstyles from "../../styles/style.module.scss"
import darkstyles from "../../styles/dark.module.scss"

const CommentCard = ({ commentData, fetchPost, darkTheme }) => {

    const styles = darkTheme ? darkstyles : lightstyles;

    const [isCommentLike, setIsCommentLike] = useState(false);
    const [likeComment] = useMutation(LIKE_COMMENT);
    const [unlikeComment] = useMutation(UNLIKE_COMMENT);
    const token = encryptStorage.getItem("jwtToken");
    const [expandedCommentId, setExpandedCommentId] = useState(null);

    const [replyComment] = useMutation(REPLY_COMMENT);

    const [repliesText, setRepliesText] = useState("");

    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data: repliesData, loading: repliesLoading, refetch: repliesRefetch } = useQuery(GET_ALL_REPLIES, {
        variables: {
            commentId: commentData.ID
        }
    });

    const { data: likeStatusData, loading: likeStatusLoading, refetch: likeRefetch } = useQuery(GET_LIKE_STATUS, {
        variables: {
            postId: commentData.ID,
            userId: userData.validateJWT.id
        }
    })

    useEffect(() => {
        if (!likeStatusLoading && likeStatusData && likeStatusData.getLikeStatus !== undefined) {
            setIsCommentLike(likeStatusData.getLikeStatus);
        }
    }, [likeStatusData, likeStatusLoading]);

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: userData?.validateJWT.id
        }
    });

    const handleCommentLike = async (commentID: string) => {
        if (isCommentLike) {
            setIsCommentLike(false);
            await unlikeComment({
                variables: {
                    commentId: commentID,
                    userId: userData.validateJWT.id,
                }
            })
        }
        else {
            setIsCommentLike(true);
            await likeComment({
                variables: {
                    commentId: commentID,
                    userId: userData.validateJWT.id,
                }
            })
        }
        fetchPost();
    }

    const handleRepliesPopup = async (commentID: any) => {
        if (expandedCommentId === commentID) {
            setExpandedCommentId(null);
        }
        else {
            setExpandedCommentId(commentID);
        }
    }

    const calculateTimeAgo = (timestamp) => {
        const postDate = new Date(timestamp);
        return formatDistanceToNow(postDate, { addSuffix: true });
    };

    const [likePost, { data: likeData }] = useMutation(LIKE_POST);
    const [unlikePost, { data: unlikeData }] = useMutation(UNLIKE_POST);
    const [isLike, setIsLike] = useState(false);

    const handleLike = async (postID: string) => {
        console.log("DALEM", isLike)
        if (isLike) {
            setIsLike(false);
            await unlikePost({
                variables: {
                    userId: userData.validateJWT.id,
                    postId: commentData.ID
                }
            });
        } else {
            setIsLike(true);
            await likePost({
                variables: {
                    userId: userData.validateJWT.id,
                    postId: commentData.ID
                }
            });
        }
        fetchPost();
    };

    const handleReply = async (commentId: string) => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');

        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        await replyComment({
            variables: {
                commentId: commentId,
                userId: userData.validateJWT.id,
                reply: repliesText,
                date: formattedDateTime
            }
        }).then(() => {
            repliesRefetch()
            fetchPost()
        })
    }

    console.log("COBA", commentData?.UserData.profilepic)

    return (
        <>
            <div key={commentData.ID}>
                <div className={styles.mainContainerComment} style={{ width: "93%" }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <img src={commentData?.UserData.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                        </div>
                        <div>
                            <h4 style={{ margin: '0px 0px 5px 0px' }}>{commentData.UserData.firstname} {commentData.UserData.surname}</h4>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <h5 style={{ margin: '0px', marginRight: '10px' }}>{calculateTimeAgo(commentData.Date)}</h5>
                            </div>
                        </div>
                    </div>
                    <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                    <div className="card-content">
                        <div dangerouslySetInnerHTML={{ __html: commentData.Comment }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <button
                            onClick={() => handleCommentLike(commentData.ID)}
                            style={{ background: 'none', border: 'none' }}>
                            {isCommentLike ? (
                                <AiFillLike className={styles.iconNavbarActive} />
                            ) : (
                                <AiOutlineLike className={styles.iconNavbar} style={{color: darkTheme ? 'white' : 'black'}} />
                            )}
                        </button>
                        <button
                            onClick={() => handleRepliesPopup(commentData.ID)}
                            style={{ background: 'none', border: 'none' }}
                        >
                            <BiComment className={styles.iconNavbar} style={{color: darkTheme ? 'white' : 'black'}} />
                        </button>
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            Liked by {commentData.LikedCount}
                        </div>
                        <div>
                            Replies by {commentData.RepliesCount}
                        </div>
                    </div>
                    <br></br>
                </div>
                {expandedCommentId === commentData.ID && (
                    <>
                        <h4>
                            Replies to comment above
                        </h4>
                        {
                            repliesData.getAllReplies.map((replies) => (
                                <>
                                    <div className={styles.mainContainerComment} style={{ width: "83%", marginLeft: '61px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
                                            <div>
                                                <img src={replies?.UserData.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0px 0px 5px 0px' }}>{replies.UserData.firstname} {replies.UserData.surname}</h4>
                                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                    <h5 style={{ margin: '0px', marginRight: '10px' }}>{calculateTimeAgo(replies.Date)}</h5>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                                        <div className="card-content">
                                            <div style={{ marginTop: '15px', color: darkTheme ? 'white' : 'black', fontWeight: darkTheme ? 'bold' : 'normal' }}>@{replies.AncestorData?.firstname} {replies.AncestorData?.surname}</div>
                                            <div dangerouslySetInnerHTML={{ __html: replies.Reply }} />
                                        </div>
                                        <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                                        <div style={{ display: 'flex', justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
                                            <div>
                                                <button
                                                    onClick={() => handleLike(commentData.ID)}
                                                    style={{ background: 'none', border: 'none' }}>
                                                    {isLike ? (
                                                        <AiFillLike className={styles.iconNavbarActive} />
                                                    ) : (
                                                        <AiOutlineLike className={styles.iconNavbar} />
                                                    )}
                                                </button>
                                            </div>
                                            {/* Liked by {replies.LikedCount} */}
                                        </div>
                                        <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                                    </div>
                                </>
                            ))
                        }
                        {/* Liked by {post.likedCount} */}
                        <div className={styles.insertComment}>
                            <div>
                                <img src={userData?.validateJWT?.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%', marginLeft: '85px' }}></img>
                            </div>
                            <br></br>
                            <ReactQuill
                                value={repliesText}
                                onChange={setRepliesText}
                                placeholder="Write a reply..."
                                theme="snow"
                                style={{
                                    border: 'none',
                                    width: '100%',
                                    marginLeft: '50px',
                                    maxHeight: '200px', // Adjust the height as needed
                                    overflowY: 'auto',
                                }}
                            />
                            {repliesText ? (
                                <button
                                    onClick={() => handleReply(commentData.ID)}
                                    style={{ background: 'none', border: 'none' }}
                                >
                                    <RiSendPlane2Fill className={styles.iconSend} />
                                </button>
                            ) : (
                                <button
                                    style={{ background: 'none', border: 'none', cursor: repliesText.length === 0 ? 'not-allowed' : 'pointer' }}
                                    disabled={repliesText.length === 0}

                                >
                                    <RiSendPlane2Line className={styles.iconSend} />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default CommentCard