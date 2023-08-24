import React, { useEffect, useState } from "react";
import { IoIosNotifications, IoIosNotificationsOutline } from "react-icons/io";
import { RiMessengerFill, RiMessengerLine } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlinePlus } from "react-icons/ai";
import { ApolloClient, useApolloClient, useQuery, InMemoryCache } from "@apollo/client";
import { GET_ALL_STORIES, GET_STORIES_BY_USER_ID } from "../../queries/storiesquery";
import { encryptStorage } from "../auth/login";
import { GET_USER_BY_TOKEN } from "../../queries/userquery";
import { formatDistanceToNow } from "date-fns";
import StoriesCarousel from "../../components/stories/carouselStories";
import Navbar from "../../components/homepage/navbar";

// Create your Apollo Client instance
const client = new ApolloClient({
    uri: 'http://localhost:7778/query', // Replace with your server's URL
    cache: new InMemoryCache(),
});

const StoriesPage = () => {

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

    const token = encryptStorage.getItem("jwtToken");
    const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const [clickedUserId, setClickedUserId] = useState(false);

    const { data: storiesData, loading: storiesLoading, refetch: storiesRefetch } = useQuery(GET_ALL_STORIES);
    const [userStoriesData, setUserStoriesData] = useState([]);

    const { loading, refetch: refetchUserStoriesData } = useQuery(GET_STORIES_BY_USER_ID);

    if (storiesLoading || userLoading) {
        storiesRefetch();
        // storiesUserRefetch();
        return <div>Loading</div>
    }

    const matchingStories = storiesData.getAllStories.filter(story => story.UserID === userData.validateJWT.id);


    const loadRefetch = async () => {
        await refetchUserStoriesData({
            userId: userData.validateJWT.id,
        });
    }

    const latestMatchingStory = matchingStories.reduce((latestStory, currentStory) => {
        loadRefetch();
        if (!latestStory || currentStory.Date > latestStory.Date) {
            storiesRefetch();
            loadRefetch();
            return currentStory;
        }
        storiesRefetch();
        loadRefetch();
        return latestStory;
    }, null);

    // const calculateTimeAgo = (timestamp) => {
    //     const postDate = new Date(timestamp);
    //     return formatDistanceToNow(postDate, { addSuffix: true }) ? formatDistanceToNow(postDate, { addSuffix: true }) : "";
    // };


    const handleUserStories = async (userId: string) => {
        const { data: userStoriesData } = await client.query({
            query: GET_STORIES_BY_USER_ID,
            variables: {
                userId: userId,
            },
        });
        setUserStoriesData(userStoriesData)
        setClickedUserId(true);
    }

    if (encryptStorage.getItem("jwtToken")) {

    }
    else {
        navigate('/login');
    }

    const uniqueUsers = Array.from(new Set(storiesData.getAllStories.map(story => story.UserID)));

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <div className={styles.container} style={{ height: '100vh' }}>
                <div className={styles.sidebar} style={{ backgroundColor: darkTheme ? '#18191a' : 'white', color: darkTheme ? 'white' : 'black' }}>
                    <AiOutlineCloseCircle style={{ width: '50px', height: '50px' }} onClick={() => navigate('/')} />
                    <div>
                        <h1>Stories</h1>
                        <h3>Your Story</h3>
                        {/* <hr className={styles.lineBreak}></hr> */}
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            {latestMatchingStory ? (
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <div className={styles.circularStoryIndicator}>
                                        <button
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: 'none'
                                            }}
                                            onClick={() => handleUserStories(userData.validateJWT.id)}
                                        >
                                            <img
                                                src="assets/Capture.PNG"
                                                style={{
                                                    width: '55px',
                                                    height: '55px',
                                                    borderRadius: '50%', // Make the image circular
                                                }}
                                                alt="Profile"
                                            />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '15px', marginRight: '30px', alignItems: 'flex-start' }}>
                                        <h3 style={{ margin: '0px 0px 10px 0px' }}>{userData.validateJWT.firstname} {userData.validateJWT.surname}</h3>
                                        {/* <h4 style={{ margin: '0px' }}>{calculateTimeAgo(latestMatchingStory?.Date) ? calculateTimeAgo(latestMatchingStory?.Date) : ""}</h4> */}
                                    </div>
                                    <AiOutlinePlus className={styles.plusStoryBtn} onClick={() => navigate('/createstories')} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <AiOutlinePlus className={styles.plusStoryBtn} onClick={() => navigate('/createstories')} />
                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '25px' }}>
                                        <h3 style={{ margin: '0px 0px 10px 0px' }}>Create a story</h3>
                                        <h4 style={{ margin: '0px' }}>Share a photo or write something</h4>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <br></br>
                    <hr className={styles.lineBreak}></hr>
                    <h2>All Stories</h2>
                    <div>
                        {uniqueUsers.map(userId => {
                            const userStories = storiesData.getAllStories.filter(story => story.UserID === userId);
                            const user = userStories[0]; // Assuming user details are in the first story for that user

                            if (user.UserID === userData.validateJWT.id) {
                                return null;
                            }
                            return (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: '20px', marginBottom: '15px' }}>
                                        <div className={styles.circularStoryIndicator}>
                                            <button
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: 'none'
                                                }}
                                                onClick={() => handleUserStories(user.UserID)}
                                            >
                                                <img
                                                    src="assets/Capture.PNG"
                                                    style={{
                                                        width: '55px',
                                                        height: '55px',
                                                        borderRadius: '50%', // Make the image circular
                                                    }}
                                                    alt="Profile"
                                                />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '15px', marginRight: '30px', alignItems: 'flex-start' }}>
                                            <h3 style={{ margin: '0px 0px 10px 0px' }}>{user.AuthorData.firstname} {user.AuthorData.surname}</h3>
                                            {/* <h4 style={{ margin: '0px' }}>{calculateTimeAgo(latestMatchingStory?.Date) ? calculateTimeAgo(latestMatchingStory?.Date) : ""}</h4> */}
                                        </div>
                                    </div>
                                </>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.main}>
                    {userStoriesData && clickedUserId && (
                        <div className={styles.textStoriesPreviewOuter} style={{ background: 'black' }}>
                            <StoriesCarousel storiesData={userStoriesData} />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default StoriesPage;