import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/style.module.scss';
import { useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { useQuery } from '@apollo/client';
import { GET_ALL_FRIENDS, GET_USER_BY_TOKEN, GET_USER_ID, SUGGESTED_FRIENDS } from '../queries/userquery';
import { AiOutlineClose, AiOutlinePauseCircle, AiOutlinePlayCircle } from 'react-icons/ai';
import { FaBirthdayCake } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { BsGenderFemale, BsGenderMale, BsVolumeDownFill, BsVolumeMuteFill } from 'react-icons/bs';
import { GET_ALL_POST } from '../queries/postquery';
import CardComponent from '../components/homepage/cardPost';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { GET_ALL_REELS, GET_REELS_BY_ID } from '../queries/reelsquery';
import Navbar from '../components/homepage/navbar';
import AllFriendCard from './friends/allfriendscard';
import { encryptStorage } from './auth/login';
import FriendCard from './friends/friendscard';
import lightstyles from "../styles/style.module.scss";
import darkstyles from "../styles/dark.module.scss";

const Profile = () => {
    const savedTheme = localStorage.getItem('darkTheme');
    const [darkTheme, setDarkTheme] = useState(savedTheme === 'dark');

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const styles = darkTheme ? darkstyles : lightstyles;

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    // Construct the link using encodedId
    const { id = '' } = useParams();
    // For Reels
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const handleNext = () => {
        setIsMuted(false);
        setIsPlaying(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % reelsData.getReelsByUserId.length);
    };

    const handlePrevious = () => {
        setIsMuted(false);
        setIsPlaying(true);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + reelsData.getReelsByUserId.length) % reelsData.getReelsByUserId.length);
    };

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

    const token = encryptStorage.getItem("jwtToken");
    const { data: userDataToken, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const [currentTab, setCurrentTab] = useState("About");
    const [limit, setLimit] = useState(4);
    const [offset, setOffset] = useState(0);
    const [itemLoaded, setItemLoaded] = useState(4);
    const [isLoading, setIsLoading] = useState(false);

    const decodedEncryptedData = atob(id);
    var bytes = CryptoJS.AES.decrypt(decodedEncryptedData, 'webeganteng');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    const [firstname, surname, userid] = originalText.split('.');

    const { data: suggestedFriendsData, loading: suggestedFriendsLoading, refetch: suggestedFriendsRefetch } = useQuery(SUGGESTED_FRIENDS, {
        variables: {
            userId: userid
        }
    })

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: userid
        }
    });

    const { data: userData, loading: userLoading } = useQuery(GET_USER_ID, {
        variables: { id: userid }
    });

    const { loading: postLoading, error: postError, data: postData, refetch: postRefetch, fetchMore } = useQuery(GET_ALL_POST, {
        variables: {
            offset: offset,
            limit: limit
        }
    });

    const { data: reelsData, loading: reelsLoading, error: reelsError, refetch: reelsRefetch } = useQuery(GET_REELS_BY_ID, {
        variables: {
            userId: userid
        }
    });

    window.onscroll = async function (ev) { // ini untuk detect kalau sedang di scroll
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) { // kalau misalnya udh sampai di bagian bawah
            if (postData.getAllPost.length >= itemLoaded) {
                const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
                setItemLoaded(itemLoaded + 4)
                // setScrollPosition(currentPosition);
                setIsLoading(true);
                await fetchMore({
                    variables: { limit: limit, offset: itemLoaded },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                            getAllPost: [...prev.getAllPost, ...fetchMoreResult.getAllPost],
                        };
                    },
                }).finally(() => {
                    setIsLoading(false);
                    // setTimeout(() => {
                    //     setIsLoading(false);
                    // }, 900); // Delay for 2 seconds (2000 milliseconds)
                });
            }
        }
    }
    const [removedFriendIds, setRemovedFriendIds] = useState<string[]>([]);
    const handleRemoveFriend = (friendId: string) => {
        setRemovedFriendIds([...removedFriendIds, friendId]);
    };
    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <div className={styles.coverProfileContainer}>
                <img src="https://res.cloudinary.com/dw7bewmoo/image/upload/v1692544711/groups-default-cover-photo-2x_l6hhuz.png" className={styles.coverPhoto}></img>
            </div>
            <div className={styles.profileContainer}>
                <div className={styles.mainContainerProfile}>
                    <div className={styles.profileInfo}>
                        <img src={userData?.getUser.profilepic} className={styles.profilePhoto}></img>
                        {/* Profile photo */}
                        <div className={styles.userDetails}>
                            <div>
                                <h2>{firstname} {surname}</h2>
                                <p>{friendsData?.getAllFriends?.length} friends</p>
                            </div>
                            {/* Other user details */}
                            <div>
                                {/* <h1>Apakah kamu awake right now</h1> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.userProfileMainContainer}>
                    <div className={styles.peopleYouMayKnowSection}>
                        <h2>People You May Know</h2>
                        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start', color: darkTheme ? 'black' : 'black'}}>
                            {suggestedFriendsData?.getSuggestedFriends?.map((user) => (
                                <FriendCard key={user.id} friend={user} user={userDataToken} refetch={suggestedFriendsRefetch} />
                            ))}
                        </div>
                    </div>
                    <div className={styles.menuTabProfile}>
                        <div onClick={() => setCurrentTab("About")} className={currentTab == "About" ? styles.selectedTabProfile : ""}>
                            About
                        </div>
                        <div onClick={() => setCurrentTab("Friends")} className={currentTab == "Friends" ? styles.selectedTabProfile : ""}>
                            Friends
                        </div>
                        <div onClick={() => setCurrentTab("Posts")} className={currentTab == "Posts" ? styles.selectedTabProfile : ""}>
                            Posts
                        </div>
                        <div onClick={() => setCurrentTab("Reels")} className={currentTab == "Reels" ? styles.selectedTabProfile : ""}>
                            Reels
                        </div>
                    </div>
                    <hr className={styles.lineBreak} style={{ marginTop: '15px', width: '100%' }}></hr>
                    <div className={styles.profileDetailsTab}>
                        {currentTab == "About" && (
                            <div>
                                <img
                                    src="../assets/Capture.PNG" // Replace with the actual image source
                                    style={{ width: '220px', height: '200px', borderRadius: '50%' }}
                                />
                                <h2>{userData?.getUser.firstname} {userData?.getUser.surname}</h2>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                                    <FaBirthdayCake />
                                    <h4>{userData?.getUser.Dob.toString()}</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                                    {userData?.getUser.gender == "male" ? (
                                        <>
                                            <BsGenderMale />
                                            <h4>Male</h4>
                                        </>
                                    ) : (
                                        <>
                                            <BsGenderFemale />
                                            <h4>Female</h4>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        {currentTab == "Friends" && (
                            <>
                                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', color: darkTheme ? 'black' : 'black' }}>
                                    {friendsData?.getAllFriends.map((user) => (
                                        <div key={user.id} className={styles.friendsCard}>
                                            <>
                                                <AllFriendCard key={user.id} friend={user} user={userDataToken} />
                                            </>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {currentTab == "Posts" && (
                            <div style={{ width: '80%' }}>
                                {postData?.getAllPost?.map((post) => (
                                    <CardComponent key={post.id} post={post} fetchPost={postRefetch} darkTheme={darkTheme} setDarkTheme={setDarkTheme}/>
                                ))}
                            </div>
                        )}
                        {currentTab == "Reels" && (
                            <div className={styles.mainReels}>
                                <div style={{
                                    position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                                }}>
                                    <div style={{ color: 'white', background: 'black' }}>
                                        <video
                                            key={reelsData?.getReelsByUserId[currentIndex].MediaUrl}
                                            ref={videoRef}
                                            preload="auto"
                                            autoPlay={true}
                                            className={styles.reelsVid}
                                            onClick={handleVideoClick}
                                            onEnded={handleNext}>
                                            <source src={reelsData?.getReelsByUserId[currentIndex].MediaUrl} type="video/mp4" />
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
                                        <p onClick={handlePrevious} style={{ position: 'absolute', left: '40%', bottom: '40%', transform: 'translate(-100%, -50%)', textAlign: 'center', color: 'white', width: '20%' }}>
                                            <MdNavigateBefore style={{ width: '60px', height: '60px', backgroundColor: 'grey', borderRadius: '50%' }} />
                                        </p>
                                        <p onClick={handleNext} style={{ position: 'absolute', left: '80%', bottom: '40%', transform: 'translate(-100%, -50%)', textAlign: 'center', color: 'white', width: '20%' }}>
                                            <MdNavigateNext style={{ width: '60px', height: '60px', backgroundColor: 'grey', borderRadius: '50%' }} />
                                        </p>
                                        <p style={{ position: 'absolute', left: '50%', bottom: '6%', transform: 'translate(-50%, 80%)', textAlign: 'center', color: 'white', width: '20%', fontWeight: 'bold', background: 'rgba(0, 0, 0, 0.7)', height: '5vh', padding: '12px', borderRadius: '10px' }}>
                                            {reelsData?.getReelsByUserId[currentIndex].Caption}
                                        </p>
                                        <p style={{ position: 'absolute', left: '50%', bottom: '5%', transform: 'translate(50%, 80%)', textAlign: 'center', color: 'white', width: '20%' }}>
                                            Like
                                        </p>
                                        <p style={{ position: 'absolute', left: '50%', bottom: '15%', transform: 'translate(50%, 70%)', textAlign: 'center', color: 'white', width: '20%' }}>
                                            Comment
                                        </p>
                                        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'space-around', left: '58%', bottom: '96.4%', transform: 'translate(50%, 70%)', textAlign: 'center', color: 'white', width: '5%', gap: '15px' }} onClick={handleToggleMute}>
                                            {isPlaying ? <AiOutlinePlayCircle className={styles.reelsVidBtn} /> : <AiOutlinePauseCircle className={styles.reelsVidBtn} />}
                                            {isMuted ? <BsVolumeMuteFill className={styles.reelsVidBtn} /> : <BsVolumeDownFill className={styles.reelsVidBtn} />}
                                        </div>
                                        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', right: '58%', bottom: '97%', transform: 'translate(50%, 70%)', textAlign: 'center', color: 'white', width: '13%', gap: '15px' }} onClick={handleToggleMute}>
                                            <img src="../assets/Capture.PNG" style={{ width: '35px', height: '35px', borderRadius: '50%' }}></img>
                                            <h4>{reelsData?.getReelsByUserId[currentIndex]?.AuthorData.firstname} {reelsData?.getReelsByUserId[currentIndex].AuthorData.surname}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </>
    );
};

export default Profile;