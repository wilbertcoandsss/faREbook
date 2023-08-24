import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { ACC_REQ, DECLINE_FRIEND_REQ, GET_ALL_FRIENDS, GET_ALL_USER, GET_FRIEND_REQ, GET_USER, GET_USER_BY_TOKEN, MUTUAL_FRIENDS, SUGGESTED_FRIENDS } from "../../queries/userquery";
import { Navigate, useNavigate } from "react-router-dom";
import { encryptStorage } from "../auth/login";
import Navbar from "../../components/homepage/navbar";
import styles from "../../styles/style.module.scss";
import { FaUsers } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import FriendCard from "./friendscard";
import AllFriendCard from "./allfriendscard";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";

const Friends = () => {
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

    if (encryptStorage.getItem("jwtToken")) {

    }
    else {
        navigate('/login');
    }


    const [isAllFriends, setIsAllFriends] = useState(false);
    const [isFriendsHome, setIsFriendsHome] = useState(true);
    const [isApprovePage, setIsApprovePage] = useState(false);


    const [searchQuery, setSearchQuery] = useState('');

    const [deleteReq] = useMutation(DECLINE_FRIEND_REQ);
    const [addReq] = useMutation(ACC_REQ);

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

    const { data: friendsReqData, loading: friendsReqLoading, refetch: friendsReqRefetch } = useQuery(GET_FRIEND_REQ, {
        variables: {
            userId: userData?.validateJWT?.id
        }
    });

    const { data: suggestedFriendsData, loading: suggestedFriendsLoading, refetch: suggestedFriendsRefetch } = useQuery(SUGGESTED_FRIENDS, {
        variables: {
            userId: userData?.validateJWT?.id
        }
    })

    if (encryptStorage.getItem("jwtToken")) {
        // console.log(userData.validateJWT.firstname);
    }
    else {
        navigate('/login');
    }


    const handleSearchQueryChange = (newQuery) => {
        setSearchQuery(newQuery);
    };

    const confirmReq = async (friendsId: string) => {
        await addReq({
            variables: {
                userId: userData?.validateJWT?.id,
                friendsId: friendsId

            }
        }).then(() => {
            friendsRefetch();
            friendsReqRefetch();
            suggestedFriendsRefetch();
        })
    }

    const declineReq = async (friendsId: string) => {
        await deleteReq({
            variables: {
                userId: userData?.validateJWT?.id,
                friendsId: friendsId
            }
        }).then(() => {
            friendsRefetch();
            friendsReqRefetch();
            suggestedFriendsRefetch();
        })
    }

    const handleHomeClick = () => {
        setIsFriendsHome(true);
        setIsAllFriends(false);
    }

    const handleAllFriendsClick = () => {
        setIsFriendsHome(false);
        setIsAllFriends(true);
    }

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <div className={styles.container} style={{ height: '100vh' }}>
                <div className={styles.sidebar} style={{ width: '18%', backgroundColor: darkTheme ? '#18191a' : 'whitesmoke', color: darkTheme ? 'white' : 'black' }}>
                    <h2 style={{ margin: '0px' }}>Friends</h2>
                    <br></br>
                    <div className={styles.friendDiv} onClick={() => handleHomeClick()}>
                        {isFriendsHome ? (
                            <FaUsers style={{ color: '#007bff' }} />
                        ) : (
                            <FaUsers style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                        <p style={{ marginLeft: '50px', fontSize: '18px' }}>Home</p>
                    </div>
                    <div className={styles.friendDiv} onClick={() => handleAllFriendsClick()}>
                        {isAllFriends ? (
                            <FiUsers style={{ color: '#007bff' }} />
                        ) : (
                            <FiUsers style={{ color: darkTheme ? 'white' : 'black' }} />
                        )}
                        <p style={{ marginLeft: '50px', fontSize: '18px' }}>All Friends</p>
                    </div>
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white', width: '85%', paddingLeft: '25px' }}>
                    {isFriendsHome ? (
                        <>
                            <h2 style={{ margin: '0px', marginBottom: '30px', color: darkTheme ? 'white' : 'black' }}>Requested Friends</h2>
                            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start' }}>
                                {friendsReqData?.getFriendRequest?.map((user) => (
                                    <div key={user.id} className={styles.friendsCard}>
                                        <img
                                            src="assets/Capture.PNG" // Replace with the actual image source
                                            alt={`${user.firstname}'s profile`}
                                            style={{ width: '100%', height: '185px', borderRadius: '15px 15px 0px 0px' }}
                                        />
                                        <h2 style={{ margin: '10px 0' }}>{user.FriendsData.firstname} {user.FriendsData.surname}</h2>
                                        <div className={styles.confirmFriendsBtn} onClick={() => confirmReq(user.FriendsID)}>
                                            Confirm
                                        </div>
                                        <div className={styles.deleteFriendsBtn} onClick={() => declineReq(user.FriendsID)}>
                                            Delete
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <h2 style={{ margin: '0px', marginBottom: '30px', color: darkTheme ? 'white' : 'black' }}>Suggested Friends</h2>
                            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start' }}>
                                {suggestedFriendsData?.getSuggestedFriends?.map((user) => (
                                    <FriendCard key={user.id} friend={user} user={userData} refetch={suggestedFriendsRefetch} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 style={{ margin: '0px', marginBottom: '30px', color: darkTheme ? 'white' : 'black' }}>All Friends</h2>
                            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start' }}>
                                {friendsData?.getAllFriends?.map((user) => (
                                    <>
                                        <AllFriendCard key={user.id} friend={user} user={userData} />
                                    </>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Friends;