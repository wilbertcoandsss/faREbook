import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/style.module.scss";
import { formatDistanceToNow } from 'date-fns';
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { BiComment, BiSkipNextCircle, BiSolidUserCircle, BiUser } from "react-icons/bi";
import { PiShareFatLight, PiShareFatFill } from "react-icons/pi";
import { ApolloClient, InMemoryCache, useMutation, useQuery } from "@apollo/client";
import { ADD_COMMENT, GET_COMMENTS, GET_LIKE_STATUS, LIKE_COMMENT, LIKE_POST, REPLY_COMMENT, UNLIKE_POST } from "../../queries/postquery";
import { encryptStorage } from "../../pages/auth/login";
import { GET_ALL_FRIENDS, GET_USER_BY_TOKEN, MUTUAL_FRIENDS } from "../../queries/userquery";
import Popup from "../popup";
import { RiSendPlane2Line, RiSendPlane2Fill } from "react-icons/ri";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CommentCard from "./commentCard";
import ManualCarousel from "./carousel";
import { GrFormNext, GrNext, GrPrevious } from "react-icons/gr";
import { MdPublic } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { GET_CHAT_HEADER, INSERT_CHAT_DETAILS, INSERT_CHAT_HEADER, INSERT_INSTANT_CHAT_HEADER } from "../../queries/chatqueries";
import { useNavigate } from "react-router-dom";
import CryptoJS from 'crypto-js';
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";

// Create your Apollo Client instance
const client = new ApolloClient({
    uri: 'http://localhost:7778/query', // Replace with your server's URL
    cache: new InMemoryCache(),
});


const CardComponent = ({ post, fetchPost, darkTheme, setDarkTheme }) => {
    const contentRef = useRef(null);

    const styles = darkTheme ? darkstyles : lightstyles;

    const handleMentionClick = (event) => {
        const mentionSpan = event.target.closest('.mention');
        if (mentionSpan) {
            const dataValue = mentionSpan.getAttribute('data-value');
            const dataId = mentionSpan.getAttribute('data-id');
            const [firstname, surname] = dataValue.split(' ');
            handleLinkProfile(firstname, surname, dataId);
        }
    };

    const extractHashtags = (text) => {
        const hashtagRegex = /#(\w+)/g; // Regular expression to match hashtags
        const matches = text.match(hashtagRegex); // Find all matches

        if (matches) {
            const hashtags = matches.map((match) => match.slice(1)); // Extract hashtag name
            return hashtags;
        }

        return [];
    };

    // Inside your component
    const handleHashtagClick = (content: string) => {
        console.log(content)
    };

    const navigate = useNavigate();
    const [showTimeInfo, setShowTimeInfo] = useState(false);
    const [mutualFriendsData, setMutualFriendsData] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [likePost, { data: likeData }] = useMutation(LIKE_POST);
    const [unlikePost, { data: unlikeData }] = useMutation(UNLIKE_POST);
    const [likeComment] = useMutation(LIKE_COMMENT);

    const [taggedPopup, setTaggedPopup] = useState(false);

    const [targetInvFriends, setTargetInvFriends] = useState("");
    const [popupShare, setPopupShare] = useState(false);
    const [commentText, setCommentText] = useState("");

    const [btnPopup, setBtnPopup] = useState(false);

    const token = encryptStorage.getItem("jwtToken");

    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['link'], // Add the link option to the toolbar
            ['image']
        ],
    };

    const { data: likeStatusData, loading: likeStatusLoading } = useQuery(GET_LIKE_STATUS, {
        variables: {
            postId: post.id,
            userId: userData?.validateJWT.id
        }
    })

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: userData?.validateJWT?.id
        }
    });

    const [isLike, setIsLike] = useState(false);
    const [isCommentLike, setIsCommentLike] = useState(false);

    const [insertChatHeader] = useMutation(INSERT_INSTANT_CHAT_HEADER);
    const [insertChatDetail] = useMutation(INSERT_CHAT_DETAILS);

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

    const handleLinkProfile = (firstname: string, surname: string, id: string) => {
        const name = firstname + "." + surname + "." + id
        var ciphertext = CryptoJS.AES.encrypt(name, 'webeganteng').toString()
        const encodedEncryptedData = btoa(ciphertext);
        navigate(`/profile/${encodedEncryptedData}`)
    }

    const getImageSrc = (visibility) => {
        if (visibility === 'public') {
        } else if (visibility === 'friends') {
            return 'assets/friendsvisible.png';
        } else if (visibility === 'specific') {
            return 'assets/friend.png';
        }
        return 'assets/public.png'; // Provide a default image source if needed
    };

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

    const sendPostChat = async (userId: string, postId: string) => {
        const { data, loading } = await client.query({
            query: GET_CHAT_HEADER,
            variables: {
                userId1: userId,
                userId2: userData?.validateJWT.id
            },
        });

        console.log(data)


        if (data?.getChatHeader == "") {
            const newChatHeader = {
                userId1: userData?.validateJWT.id,
                userId2: userId
            }

            console.log("MASUK GA sblm insert", newChatHeader);

            const result = await insertChatHeader({
                variables: {
                    inputChatHeader: newChatHeader
                }
            })

            const newChatDetail = {
                chatHeaderId: result.data.createInstantChat.id,
                senderId: userData?.validateJWT?.id,
                chatText: "",
                type: "Post",
                mediaUrl: postId
            }

            console.log(newChatDetail)

            await insertChatDetail({
                variables: {
                    newChatDetail: newChatDetail
                }
            })

            fetchPost()
        }
        else {
            console.log("MASUK SINI GK SI SEKALI")
            const newChatDetail = {
                chatHeaderId: data?.getChatHeader,
                senderId: userData?.validateJWT?.id,
                chatText: "",
                type: "Post",
                mediaUrl: postId
            }

            console.log(newChatDetail)

            await insertChatDetail({
                variables: {
                    newChatDetail: newChatDetail
                }
            })
            fetchPost()
        }
        setPopupShare(false)
    }

    return (
        <>
            <div className={styles.mainContainerCard}>
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
                        style={{
                            position: 'relative', // Required for tooltip positioning
                        }}
                    >
                        <img
                            src={post?.authorData?.profilepic}
                            style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px', cursor: 'pointer' }}
                            onMouseEnter={async () => {
                                setShowTooltip(true);
                                if (post?.authorData?.id) {
                                    const { data, loading } = await client.query({
                                        query: MUTUAL_FRIENDS,
                                        variables: {
                                            userId1: userData?.validateJWT?.id,
                                            userId2: post?.authorData?.id,
                                        },
                                    });
                                    if (!loading) {
                                        setMutualFriendsData(data);
                                    }
                                }
                            }}
                            onMouseLeave={() => {
                                setShowTooltip(false);
                                setMutualFriendsData(null);
                            }}
                            onClick={() => {
                                handleLinkProfile(post?.authorData?.firstname, post?.authorData?.surname, post?.authorData?.id);
                            }}
                        />
                        {showTooltip && (
                            <div className={styles.tooltip}>
                                <div>
                                    {post?.authorData.firstname} {post?.authorData.surname}
                                </div>
                                {post?.authorData?.id !== userData?.validateJWT?.id && (
                                    <div>
                                        Mutual Friends: {mutualFriendsData?.getMutualFriends || 0}
                                    </div>
                                )}
                                <div>
                                    {new Date(post?.authorData.Dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {post.taggedUser == "" ? (
                            <h4 style={{ margin: '0px 0px 5px 0px' }}>{post?.authorData.firstname} {post?.authorData.surname}</h4>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <h4 style={{ margin: '0px 0px 5px 0px' }}>{post?.authorData.firstname} {post?.authorData.surname} and
                                    <span style={{ color: darkTheme ? '#256ff1' : 'blue', marginLeft: '5.3px' }}
                                        onClick={() => setTaggedPopup(true)}
                                    >
                                        Others
                                    </span></h4>
                            </div>
                        )}
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
                    {post?.contentText.includes('@') ? (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: post?.contentText,
                            }}
                            style={{
                                color: '#548df1',
                                fontWeight: 'bold'
                            }}
                            onClick={handleMentionClick}
                        />
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{ __html: post?.contentText }}
                        />
                    )}

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
                                <AiOutlineLike className={styles.iconNavbar} />
                            )}
                        </button>
                    </div>
                    <div>
                        <button
                            style={{ background: 'none', border: 'none' }}
                            onClick={() => handleComment(post.id)}>
                            <BiComment className={styles.iconNavbar}/>
                        </button>
                    </div>
                    <div>
                        <PiShareFatLight className={styles.iconNavbar} onClick={() => setPopupShare(true)} />
                    </div>
                </div>
                <hr className={styles.lineBreak} style={{ marginBottom: '0px' }}></hr>
                <br></br>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        Liked by {post.likedCount}
                    </div>
                    <div>
                        Commented by {post.commentCount}
                    </div>
                </div>
                <br></br>
            </div >
            {/* Comment Popup */}
            < Popup trigger={btnPopup} setTrigger={setBtnPopup} darkTheme={darkTheme}
            >
                <div>
                    <h2 style={{ position: 'sticky', top: '-33px', backgroundColor: darkTheme ? '#242526' : 'white', transition: 'background-color 0.8s ease', zIndex: 1, padding: '33px', margin: '0px' }}>
                        {post.authorData.firstname} {post.authorData.surname}'s Post
                    </h2>
                    <div className={styles.mainContainerCard} style={{ width: "93%" }}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                                <img src={post?.authorData.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
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
                        <img src={userData?.validateJWT?.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '20px' }}></img>
                    </div>
                    <br></br>
                    <ReactQuill
                        value={commentText}
                        onChange={setCommentText}
                        placeholder="Write a comment..."
                        modules={modules}
                        formats={['header', 'list', 'font', 'bold', 'italic', 'underline', 'link', 'image']}
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
            <Popup trigger={popupShare} setTrigger={setPopupShare}

            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                    <h2>Share this post to your friends</h2>
                    <select
                        style={{
                            width: '50%',
                            borderRadius: '15px',
                            marginBottom: '20px',
                            padding: '15px',
                        }}
                        onChange={(e) => setTargetInvFriends(e.target.value)}
                    // onChange={(e) => setTargetChatId(e.target.value)}
                    >
                        <option value="">Choose your friends...</option>
                        {friendsData?.getAllFriends?.map((friend) => {
                            return (
                                <option key={friend.FriendsID} value={friend.FriendsID}>
                                    {friend.FriendsData.firstname} {friend.FriendsData.surname}
                                </option>
                            );
                        })}
                    </select>
                    <div className={styles.startChatBtn} onClick={() => sendPostChat(targetInvFriends, post.id)}>
                        Send!
                    </div>
                </div>
            </Popup>
            <Popup trigger={taggedPopup} setTrigger={setTaggedPopup}>
                <h2>Tagged in this post</h2>
                <hr className={styles.lineBreak}></hr>
                {post?.taggedUser?.map((user) => (
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
                        <div>
                            <img src={user.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%' }}></img>
                        </div>
                        <h2>{user.firstname} {user.surname}</h2>
                    </div>
                ))}
                <br></br>
            </Popup>
        </>
    );
};

export default CardComponent;