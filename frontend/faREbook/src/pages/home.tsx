import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { GET_USER, GET_USER_BY_TOKEN } from "../queries/userquery";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { encryptStorage } from "../pages/auth/login";
import Navbar from "../components/homepage/navbar";
import Popup from '../components/popup';
import createPost from "../components/homepage/createPost";
import CreatePost from "../components/homepage/createPost";
import { GET_ALL_POST } from "../queries/postquery";
import CardComponent from "../components/homepage/cardPost";
import { animateScroll as scroll } from 'react-scroll';
import CryptoJS from 'crypto-js';
import { AiFillPlusCircle, AiOutlinePlus } from "react-icons/ai";
// const CryptoJS = require('crypto-js');
import lightstyles from "../styles/style.module.scss";
import darkstyles from "../styles/dark.module.scss";

const Home = () => {

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

    const { loading: postLoading, error: postError, data: postData, refetch: postRefetch, fetchMore } = useQuery(GET_ALL_POST, {
        variables: {
            offset: offset,
            limit: limit
        }
    });

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

    const [searchQuery, setSearchQuery] = useState('');

    const lowercaseSearchQuery = searchQuery.toLowerCase();

    const filteredPosts = postData?.getAllPost.filter((post) => {
        const lowercaseContentText = post.contentText.toLowerCase();
        const lowercaseFirstname = post.authorData.firstname.toLowerCase();
        const lowercaseSurname = post.authorData.surname.toLowerCase();

        const contentMatches = lowercaseContentText.includes(lowercaseSearchQuery);

        const authorCombined = lowercaseFirstname + ' ' + lowercaseSurname; // Concatenate firstname and surname
        const authorMatches = authorCombined.includes(lowercaseSearchQuery); // Check if combined author matches

        return contentMatches || authorMatches;
    });

    const imageUrl = `${window.location.origin}/assets/load.gif`;

    const handleSearchQueryChange = (newQuery) => {
        setSearchQuery(newQuery);
    };

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

    }
    else {
        navigate('/login');
    }


    const handleLinkProfile = () => {
        const name = `${data.validateJWT.firstname}.${data.validateJWT.surname}.${data.validateJWT.id}`;
        var ciphertext = CryptoJS.AES.encrypt(name, 'webeganteng').toString()
        const encodedEncryptedData = btoa(ciphertext);
        navigate(`/profile/${encodedEncryptedData}`)
    }

    console.log("tema skrng", darkTheme);

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <>
                {isLoading && (
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '5' }}>
                        <img src={imageUrl} width={"75px"} height={"75px"}></img>
                        <h1 style={{ color: 'white' }}>Please wait</h1>
                    </div>
                )}
                <div className={styles.mainBody}>
                    <div className={styles.leftBody} style={{ gap: '10px' }}>
                        <div onClick={() => navigate('/friends')}>
                            <div>
                                <img src="assets/friends.png" style={{ width: '40px', height: '40px', }}></img>
                            </div>
                            <div>
                                Friends
                            </div>
                        </div>
                        <div onClick={() => navigate('/group')}>
                            <div>
                                <img src="assets/group.png" style={{ width: '40px', height: '40px', }}></img>
                            </div>
                            <div>
                                Groups
                            </div>
                        </div>
                        <div onClick={() => navigate('/stories')}>
                            <div>
                                <img src="assets/stories.png" style={{ width: '40px', height: '40px', }}></img>
                            </div>
                            <div>
                                Stories
                            </div>
                        </div>
                        <div onClick={() => navigate('/reels')}>
                            <div>
                                <img src="assets/reels.png" style={{ width: '40px', height: '40px', }}></img>
                            </div>
                            <div>
                                Reels
                            </div>
                        </div>
                    </div>
                    <div className={styles.centerBody}>
                        <div>
                            <CreatePost trigger={btnPopup} setTrigger={setBtnPopup} fetchPost={postRefetch} darkTheme={darkTheme} setDarkTheme={setDarkTheme} /> {/* Show CreatePost component */}
                            {postLoading ? (
                                <p>Loading...</p>
                            ) : postError ? (
                                <p>Error: {postError.message}</p>
                            ) : (
                                <div>
                                    {postData?.getAllPost?.map((post) => (
                                        <CardComponent key={post.id} post={post} fetchPost={postRefetch} darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.rightBody}>

                    </div>
                </div>
                <>
                </>
            </>
        </>
    );
};


export default Home;