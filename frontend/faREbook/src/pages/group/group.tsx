import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { GET_USER, GET_USER_BY_TOKEN } from "../../queries/userquery";
import { Navigate, useNavigate } from "react-router-dom";
import { encryptStorage } from "../auth/login";
import Navbar from "../../components/homepage/navbar";
import styles from "../../styles/style.module.scss";
import { AiOutlinePlus, AiOutlineSearch } from "react-icons/ai";
import { BiHomeAlt } from "react-icons/bi";
import { ACC_INV, CHECK_INV_GROUP, DELETE_INV, GET_ALL_GROUPS, GET_GROUP_BY_USERID, GET_USER_GROUP_POSTS } from "../../queries/groupqueries";
import cryptoJs from "crypto-js";
import { TbUsersPlus } from "react-icons/tb";
import Popup from "../../components/popup";
import { ToastContainer, toast } from "react-toastify";
import CardComponent from "../../components/homepage/cardPost";
import GroupCardComponent from "../../components/homepage/groupCardPost";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";

const Group = () => {
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

    const [limit, setLimit] = useState(4);
    const [offset, setOffset] = useState(0);
    const [itemLoaded, setItemLoaded] = useState(4);
    const [isLoading, setIsLoading] = useState(false);

    const logout = async () => {
        encryptStorage.clear();
        navigate('/');
    }

    const token = encryptStorage.getItem("jwtToken");
    const { data, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data: allGroupData } = useQuery(GET_ALL_GROUPS);

    const { data: groupDataByIdData, loading: groupDataByIdLoading, refetch: groupDataByIdRefetch } = useQuery(GET_GROUP_BY_USERID, {
        variables: {
            userId: data?.validateJWT?.id
        }
    })

    const { data: groupInvData, loading: groupInvLoading, refetch: groupInvRefetch } = useQuery(CHECK_INV_GROUP, {
        variables: {
            userId: data?.validateJWT?.id
        }
    })

    const { data: groupPostData, loading: groupPostLoading, refetch: groupPostDataRefetch, fetchMore } = useQuery(GET_USER_GROUP_POSTS, {
        variables: {
            userId: data?.validateJWT?.id,
            limit: limit,
            offset: offset
        }
    })

    if (encryptStorage.getItem("jwtToken")) {
        console.log(data?.validateJWT.firstname);
    }
    else {
        navigate('/login');
    }

    useEffect(() => {
        groupDataByIdRefetch()
    })

    console.log(
        groupPostData?.GetAllUserGroupPost.map((post) =>
            post.GroupPost.map((post2) => post2.contentText)
        )
    );

    const handleGroupProfilePage = (groupId: string, groupName: string) => {
        console.log("KLIK", groupId, groupName);
        const name = groupId + "." + groupName
        var ciphertext = cryptoJs.AES.encrypt(name, 'webeganteng').toString()
        const encodedEncryptedData = btoa(ciphertext);
        navigate(`/groupprofile/${encodedEncryptedData}`)
    }

    const [invitationPopup, setInvitationPopup] = useState(false);

    const [acceptInv] = useMutation(ACC_INV)
    const [declineInv] = useMutation(DELETE_INV)

    const [searchQuery, setSearchQuery] = useState("");

    const filteredGroups = allGroupData?.getAllGroup?.filter(group => {
        // Filter based on the search query and GroupPrivacy
        return (
            group.GroupPrivacy === 'public' &&
            group.GroupName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    window.onscroll = async function (ev) { // ini untuk detect kalau sedang di scroll
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) { // kalau misalnya udh sampai di bagian bawah
            if (groupPostData?.GetAllUserGroupPost) {
                groupPostData.GetAllUserGroupPost.forEach((post) => {
                    if (post.GroupPost && post.GroupPost.length >= itemLoaded) {
                        const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
                        setItemLoaded(itemLoaded + 4)
                        // setScrollPosition(currentPosition);
                        setIsLoading(true);
                        fetchMore({
                            variables: { limit: limit, offset: itemLoaded },
                            updateQuery: (prev, { fetchMoreResult }) => {
                                if (!fetchMoreResult) return prev;
                                return {
                                    GetAllUserGroupPost: [...prev.GetAllUserGroupPost, ...fetchMoreResult.GetAllUserGroupPost],
                                };
                            },
                        }).finally(() => {
                            setIsLoading(false);
                            // setTimeout(() => {
                            //     setIsLoading(false);
                            // }, 900); // Delay for 2 seconds (2000 milliseconds)
                        });
                    }
                });
            }
        }
    }

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            {isLoading && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '5' }}>
                    <img src="../assets/load.gif" width={"75px"} height={"75px"}></img>
                    <h1 style={{ color: 'white' }}>Uploading...</h1>
                </div>
            )}
            <div className={styles.container} style={{ height: searchQuery ? '100vh' : 'unset' }}>
                <div className={styles.sidebar} style={{ width: '18%', backgroundColor: darkTheme ? '#18191a' : 'white', color: darkTheme ? 'white' : 'black', }}>
                    <h2 style={{ margin: '0px' }}>Groups</h2>
                    <br></br>
                    <div className={styles.searchBarMessenger} style={{ marginTop: '5px' }}>
                        <input
                            type="text"
                            placeholder="Search in Facebook"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className={styles.searchIconMsg}><AiOutlineSearch style={{ color: 'gray' }} /></span>
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                        <BiHomeAlt style={{ width: '30px', height: '30px' }} />
                        My Group Feed
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }} onClick={() => setInvitationPopup(true)}>
                        <TbUsersPlus style={{ width: '30px', height: '30px' }} />
                        Invitation Group Request
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }} onClick={() => navigate('/creategroup')}>
                        <AiOutlinePlus style={{ width: '30px', height: '30px' }} />
                        Create New Group
                    </div>
                    <hr className={styles.lineBreak}></hr>
                    <h3>Groups you've managed</h3>
                    {groupDataByIdData?.getGroupById
                        ?.filter((groupUser) =>
                            groupUser.GroupMember.some(
                                (groupMember) =>
                                    groupMember.GroupMember.UserID === data?.validateJWT.id &&
                                    groupMember.GroupMember.Role === "Admin"
                            )
                        )
                        .map((filteredGroupUser) => (
                            <div className={styles.groupChoose} key={filteredGroupUser.ID} onClick={() => handleGroupProfilePage(filteredGroupUser.ID, filteredGroupUser.GroupName)}>
                                <img src={filteredGroupUser.GroupBannerPic} style={{ width: '55px', height: '55px', borderRadius: '50%' }} ></img>
                                <h3>{filteredGroupUser.GroupName}</h3>
                            </div>
                        ))}
                    <hr className={styles.lineBreak}></hr>
                    <h3>Groups you've joined</h3>
                    {groupDataByIdData?.getGroupById
                        ?.filter((groupUser) =>
                            groupUser.GroupMember.some(
                                (groupMember) =>
                                    groupMember.GroupMember.Role === "Member" &&
                                    groupMember.GroupMember.Status === "Approved"
                            )
                        )
                        .map((filteredGroupUser) => (
                            <div key={filteredGroupUser.ID} onClick={() => handleGroupProfilePage(filteredGroupUser.ID, filteredGroupUser.GroupName)}>
                                <h1>{filteredGroupUser.GroupName}</h1>
                            </div>
                        ))}
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white', width: '85%', paddingLeft: '25px' }}>
                    {searchQuery === "" ? (
                        <>
                            {groupPostData?.GetAllUserGroupPost?.map((post) => (
                                <div style={{ width: '93%' }}>
                                    <div key={post.FetchGroup.ID}>
                                        {post?.GroupPost?.map((groupPost) => (
                                            <div key={groupPost.id} >
                                                <GroupCardComponent groupId={post?.FetchGroup?.ID} groupName={post?.FetchGroup?.GroupName} groupPP={post?.FetchGroup?.GroupBannerPic} post={groupPost} fetchPost={groupPostDataRefetch} darkTheme={darkTheme} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            {filteredGroups?.map((group) => (
                                <div style={{ backgroundColor: 'white', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0px 15px 0px' }} onClick={() => handleGroupProfilePage(group.ID, group.GroupName)}>
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
                </div>
            </div >
            <Popup trigger={invitationPopup} setTrigger={setInvitationPopup} darkTheme={darkTheme}
            >
                <h2>Invitation</h2>
                <hr className={styles.lineBreak}></hr>
                {groupInvData?.checkInvitation?.map((inv) => (
                    <>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px', flexDirection: 'row', alignItems: 'center' }}>
                                <div>
                                    <h4>{inv.GroupName}</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: '35px' }}>
                                    <div onClick={() => {
                                        acceptInv({
                                            variables: {
                                                userId: data?.validateJWT?.id,
                                                groupId: inv.ID,
                                                status: "Approved"
                                            }
                                        }).then(() => {
                                            toast.success('Group succesfully approved!', {
                                                position: "top-center",
                                                autoClose: 3000,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: "light",
                                            });
                                            setInvitationPopup(false);
                                        })
                                    }}>
                                        Accept
                                    </div>
                                    <div onClick={() => {
                                        declineInv({
                                            variables: {
                                                userId: data?.validateJWT?.id,
                                                groupId: inv.ID
                                            }
                                        }).then(() => {
                                            toast.warning('Group declined!', {
                                                position: "top-center",
                                                autoClose: 3000,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: "light",
                                            });
                                            setInvitationPopup(false);
                                        })
                                    }}>
                                        Decline
                                    </div>
                                </div>
                            </div>
                        </div >
                    </>
                ))}
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


export default Group;