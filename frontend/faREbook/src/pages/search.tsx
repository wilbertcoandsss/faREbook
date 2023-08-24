import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { GET_ALL_USER, GET_USER, GET_USER_BY_TOKEN } from "../queries/userquery";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { encryptStorage } from "../pages/auth/login";
import Navbar from "../components/homepage/navbar";
import styles from "../styles/style.module.scss"
import Popup from '../components/popup';
import createPost from "../components/homepage/createPost";
import CreatePost from "../components/homepage/createPost";
import { GET_ALL_POST } from "../queries/postquery";
import CardComponent from "../components/homepage/cardPost";
import { animateScroll as scroll } from 'react-scroll';
import { FaRegNewspaper } from "react-icons/fa";
import { BsFileEarmarkPost, BsPostcard } from "react-icons/bs";
import { GrGroup } from "react-icons/gr";
import { AiOutlineUser } from "react-icons/ai";
import { BiGroup } from "react-icons/bi";
import { GET_ALL_GROUPS } from "../queries/groupqueries";
import CryptoJS from 'crypto-js';
import lightstyles from "../styles/style.module.scss";
import darkstyles from "../styles/dark.module.scss";

const Search = () => {

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
    const [btnPopup, setBtnPopup] = useState(false);
    const [nestedPopup, setNestedPopup] = useState(false);

    const [itemLoaded, setItemLoaded] = useState(4);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [limit, setLimit] = useState(4);
    const [offset, setOffset] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const [isAll, setIsAll] = useState(true);
    const [isUser, setIsUser] = useState(false);
    const [isPost, setIsPost] = useState(false);
    const [isGroup, setIsGroup] = useState(false);


    const { loading: postLoading, error: postError, data: postData, refetch: postRefetch, fetchMore } = useQuery(GET_ALL_POST, {
        variables: {
            offset: offset,
            limit: limit
        }
    });

    const { loading: userListLoading, error: userListError, data: userListData, refetch: userListRefetch } = useQuery(GET_ALL_USER);

    const { data: allGroupData } = useQuery(GET_ALL_GROUPS);


    if (encryptStorage.getItem("jwtToken")) {

    }
    else {
        navigate('/login');
    }

    window.onscroll = async function (ev) { // ini untuk detect kalau sedang di scroll
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) { // kalau misalnya udh sampai di bagian bawah
            if (postData.getAllPost.length >= itemLoaded) {
                //     return
                // }
                // else {
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

    const { query = '' } = useParams();
    const lowercaseSearchQuery = query.toLowerCase();

    const filteredUserList = userListData?.getAllUser.filter(user => {
        // You can adjust the fields you want to filter based on (e.g., username, email, etc.)

        const lowercaseFirstname = user.firstname.toLowerCase();
        const lowercaseSurname = user.surname.toLowerCase();
        const authorCombined = lowercaseFirstname + ' ' + lowercaseSurname;
        const authorMatches = authorCombined.includes(lowercaseSearchQuery); // Check if combined author matches

        return authorMatches;
    });

    const filteredPosts = postData?.getAllPost.filter((post) => {
        const lowercaseContentText = post.contentText.toLowerCase();
        const lowercaseFirstname = post.authorData.firstname.toLowerCase();
        const lowercaseSurname = post.authorData.surname.toLowerCase();

        const contentMatches = lowercaseContentText.includes(lowercaseSearchQuery);

        const authorCombined = lowercaseFirstname + ' ' + lowercaseSurname; // Concatenate firstname and surname
        const authorMatches = authorCombined.includes(lowercaseSearchQuery); // Check if combined author matches

        return contentMatches || authorMatches;
    });

    const openNestedPopup = () => {
        setNestedPopup(true);
    };


    const logout = async () => {
        encryptStorage.clear();
        navigate('/');
    }

    useEffect(() => {
        postRefetch;
    })

    const token = encryptStorage.getItem("jwtToken");
    const { data, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    if (loading) {
        return <div>Loading</div>
    }


    if (encryptStorage.getItem("jwtToken")) {
        console.log(data.validateJWT.firstname);
    }
    else {
        navigate('/login');
    }

    const filteredGroups = allGroupData?.getAllGroup?.filter(group => {
        // Filter based on the search query and GroupPrivacy
        return (
            group.GroupPrivacy === 'public' &&
            group.GroupName.toLowerCase().includes(lowercaseSearchQuery.toLowerCase())
        );
    });

    const handleLinkProfile = (firstname: string, surname: string, id: string) => {
        const name = firstname + "." + surname + "." + id
        var ciphertext = CryptoJS.AES.encrypt(name, 'webeganteng').toString()
        const encodedEncryptedData = btoa(ciphertext);
        navigate(`/profile/${encodedEncryptedData}`)
    }

    const handleGroupProfilePage = (groupId: string, groupName: string) => {
        console.log("KLIK", groupId, groupName);
        const name = groupId + "." + groupName
        var ciphertext = CryptoJS.AES.encrypt(name, 'webeganteng').toString()
        const encodedEncryptedData = btoa(ciphertext);
        navigate(`/groupprofile/${encodedEncryptedData}`)
    }

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <div className={styles.mainBody} style={{ padding: '0px', height: '100vh' }}>
                <div className={styles.sidebar} style={{ width: '18%', backgroundColor: darkTheme ? '#18191a' : 'whitesmoke', color: darkTheme ? 'white' : 'black' }}>
                    <h2 style={{ margin: '0px' }}>Search Results</h2>
                    <br></br>
                    <hr className={styles.lineBreak}></hr>
                    <h2 style={{ margin: '0px' }}>Filter</h2>
                    <br></br>
                    <div className={styles.friendDiv} onClick={() => { setIsUser(false), setIsAll(true), setIsGroup(false), setIsPost(false) }}>
                        {isAll ? (
                            <FaRegNewspaper style={{ color: '#007bff' }} />
                        ) : (
                            <FaRegNewspaper style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                        <p style={{ marginLeft: '50px', fontSize: '20px' }}>All</p>
                    </div>
                    <div className={styles.friendDiv} onClick={() => { setIsUser(true), setIsAll(false), setIsGroup(false), setIsPost(false) }}>
                        {isUser ? (
                            <AiOutlineUser style={{ color: '#007bff' }} />
                        ) : (
                            <AiOutlineUser style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                        <p style={{ marginLeft: '50px', fontSize: '20px' }}>User</p>
                    </div>
                    <div className={styles.friendDiv} onClick={() => { setIsUser(false), setIsAll(false), setIsGroup(false), setIsPost(true) }}>
                        {isPost ? (
                            <BsFileEarmarkPost style={{ color: '#007bff' }} />
                        ) : (
                            <BsFileEarmarkPost style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                        <p style={{ marginLeft: '50px', fontSize: '20px' }}>Post</p>
                    </div>
                    <div className={styles.friendDiv} onClick={() => { setIsUser(false), setIsAll(false), setIsGroup(true), setIsPost(false) }}>
                        {isGroup ? (
                            <BiGroup style={{ color: '#007bff' }} />
                        ) : (
                            <BiGroup style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                        <p style={{ marginLeft: '50px', fontSize: '20px' }}>Group</p>
                    </div>
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white', width: '85%', paddingLeft: '25px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                        {isAll && (
                            <>
                                {filteredUserList?.map((user) => (
                                    <>
                                        <div
                                            onClick={() => {
                                                handleLinkProfile(user.firstname, user.surname, user.id)
                                            }}
                                            className={styles.searchUserList}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <img
                                                    src="../assets/Capture.PNG" // Replace with the actual image source
                                                    alt={`${user.firstname}'s profile`}
                                                    style={{ width: '70px', height: '60px', borderRadius: '50%', margin: '15px' }}
                                                />
                                                <div></div>
                                                <h4>{user.firstname} {user.surname}</h4>
                                            </div>
                                        </div>
                                    </>
                                ))}
                                {filteredPosts?.map((post) => (
                                    <CardComponent key={post.id} post={post} fetchPost={postRefetch} darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
                                ))}

                                {filteredGroups?.map((group) => (
                                    <div className={styles.searchUserList} onClick={() => handleGroupProfilePage(group.ID, group.GroupName)}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} >
                                            <img
                                                src={group.GroupBannerPic} // Replace with the actual image source
                                                style={{ width: '70px', height: '60px', borderRadius: '50%', margin: '15px' }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h3 style={{ margin: '5px' }}>{group.GroupName}</h3>
                                                <h5 style={{ margin: '5px' }}>Open For {group.GroupPrivacy}</h5>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {isUser && filteredUserList?.map((user) => (
                            <>
                                <div
                                    onClick={() => {
                                        handleLinkProfile(user.firstname, user.surname, user.id)
                                    }}
                                    className={styles.searchUserList}>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <img
                                            src="../assets/Capture.PNG" // Replace with the actual image source
                                            alt={`${user.firstname}'s profile`}
                                            style={{ width: '70px', height: '60px', borderRadius: '50%', margin: '15px' }}
                                        />
                                        <div></div>
                                        <h4>{user.firstname} {user.surname}</h4>
                                    </div>
                                </div>
                            </>
                        ))}

                        {isPost && filteredPosts?.map((post) => (
                            <CardComponent key={post.id} post={post} fetchPost={postRefetch} darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
                        ))}

                        {isGroup && filteredGroups?.map((group) => (
                            <div className={styles.searchUserList} onClick={() => handleGroupProfilePage(group.ID, group.GroupName)}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} >
                                    <img
                                        src={group.GroupBannerPic} // Replace with the actual image source
                                        style={{ width: '70px', height: '60px', borderRadius: '50%', margin: '15px' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ margin: '5px' }}>{group.GroupName}</h3>
                                        <h5 style={{ margin: '5px' }}>Open For {group.GroupPrivacy}</h5>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div >
        </>
    );
};


export default Search;