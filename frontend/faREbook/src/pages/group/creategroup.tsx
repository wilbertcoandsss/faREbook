import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { GET_ALL_FRIENDS, GET_USER, GET_USER_BY_TOKEN } from "../../queries/userquery";
import { Navigate, useNavigate } from "react-router-dom";
import { encryptStorage } from "../auth/login";
import Navbar from "../../components/homepage/navbar";
import styles from "../../styles/style.module.scss";
import { AiOutlineClose, AiOutlinePlus, AiOutlineSearch } from "react-icons/ai";
import { BiHomeAlt } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import { ADD_CHAT_GROUP_HEADER, ADD_NEW_GROUP, ADD_NEW_GROUP_MEMBER } from "../../queries/groupqueries";
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";

const CreateGroup = () => {
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

    const token = encryptStorage.getItem("jwtToken");
    const { data, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });
    const [groupMembers, setGroupMembers] = useState<string[]>([]); // Specify the type as string[]

    const addMember = (member: string) => {
        // Check if the member is already in the list
        if (!groupMembers.includes(member)) {
            setGroupMembers([...groupMembers, member]);
        }
    };

    const removeMember = (member: string) => {
        const updatedMembers = groupMembers.filter((m) => m !== member);
        setGroupMembers(updatedMembers);
    };

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: data?.validateJWT?.id
        }
    });

    if (encryptStorage.getItem("jwtToken")) {
        console.log(data?.validateJWT.firstname);
    }
    else {
        navigate('/login');
    }

    const logout = async () => {
        encryptStorage.clear();
        navigate('/');
    }

    const [insertChatHeader] = useMutation(ADD_CHAT_GROUP_HEADER);

    const [groupName, setGroupName] = useState("")
    const [groupPrivacy, setGroupPrivacy] = useState("")
    const [groupDesc, setGroupDesc] = useState("");

    const [insertNewGroup] = useMutation(ADD_NEW_GROUP)
    const [insertNewGroupMember] = useMutation(ADD_NEW_GROUP_MEMBER)

    const createNewGroup = async () => {
        if (groupName == "" || groupPrivacy == "" || groupDesc == "") {
            toast.error('Please fill in all the fields!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
        else {
            const newGroup = {
                GroupName: groupName,
                GroupPrivacy: groupPrivacy,
                GroupDesc: groupDesc,
                GroupAdmin: data?.validateJWT.id,
                GroupBannerPic: "",
                GroupCreated: ""
            }

            console.log(newGroup, groupMembers)
            const groupResult = await insertNewGroup({
                variables: {
                    newGroup: newGroup
                }
            })

            console.log(groupResult.data.insertGroup.ID, groupMembers)

            const newMemberAdmin = {
                UserID: data?.validateJWT.id,
                GroupID: groupResult.data?.insertGroup.ID,
                Role: "Admin",
                Status: "Approved"
            }

            await insertNewGroupMember({
                variables: {
                    newMember: newMemberAdmin
                }
            })

            for (const memberID of groupMembers) {
                const newMember = {
                    UserID: memberID,
                    GroupID: groupResult.data?.insertGroup.ID,
                    Role: "Member",
                    Status: "Pending"
                };

                await insertNewGroupMember({
                    variables: {
                        newMember: newMember
                    }
                });
            }

            await insertChatHeader({
                variables: {
                    groupId: groupResult.data?.insertGroup.ID
                }
            })

            navigate('/group');
        }
    }

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            <div className={styles.container}>
                <div className={styles.sidebar} style={{ width: '18%', height: '100vh', backgroundColor: darkTheme ? '#18191a' : 'white', color: darkTheme ? 'white' : 'black' }}>
                    <h2 style={{ margin: '0px' }}>Create Group</h2>
                    <br></br>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                        <img src="../assets/Capture.PNG" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></img>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1px', flexDirection: 'column' }}>
                            <h5 style={{ margin: '0px' }}>{data?.validateJWT.firstname} {data?.validateJWT.surname}</h5>
                            <h6 style={{ margin: '0px' }}>Admin</h6>
                        </div>
                    </div>
                    <br></br>
                    <h4>Group Name</h4>
                    <div className={styles.formInputTextStories}>
                        <input type="text" placeholder="Input Group Name" onChange={(e) => setGroupName(e.target.value)}></input>
                    </div>
                    <h4>Group Description</h4>
                    <div className={styles.formInputTextStories}>
                        <input type="text" placeholder="Input Group Desc" onChange={(e) => setGroupDesc(e.target.value)}></input>
                    </div>
                    <h4>Group Privacy</h4>
                    <div className={styles.formInputTextStories}>
                        <select
                            value={groupPrivacy}
                            onChange={(e) => setGroupPrivacy(e.target.value)}
                            className={styles.fontStyleSelect}
                            style={{
                                borderRadius: '5px',
                                padding: '8px',
                                fontSize: '12px'
                            }}
                        >
                            <option value="">Select privacy...</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <h4>Group Members (Optional)</h4>
                    <div>
                        <select
                            onChange={(e) => addMember(e.target.value)}
                            style={{
                                borderRadius: '5px',
                                padding: '8px',
                                fontSize: '12px',
                                color: 'black'
                            }}
                        >
                            <option value="">Select friends</option>
                            {friendsData?.getAllFriends?.map((friend) => (
                                <option key={friend.FriendsID} value={friend.FriendsID}>{friend.FriendsData.firstname} {friend.FriendsData.surname}</option>
                            ))}
                        </select>
                    </div>
                    {groupMembers.length > 0 && (
                        <div className={styles.invitedMembers}>
                            <h3>Invited Members:</h3>
                            {groupMembers.map((member) => {
                                const invitedFriend = friendsData?.getAllFriends?.find(
                                    (friend) => friend.FriendsID === member
                                );
                                if (invitedFriend) {
                                    return (
                                        <div key={invitedFriend.FriendsID} style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '8px 1px 5px 1px', backgroundColor: darkTheme ? '#242526' : 'white', borderRadius: '10px', padding: '8px', border: '1px solid rgb(187, 187, 187)' }}>
                                            {invitedFriend.FriendsData.firstname} {invitedFriend.FriendsData.surname}
                                            <AiOutlineClose
                                                onClick={() => removeMember(invitedFriend.FriendsID)}
                                                className="close-icon"
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                    <br></br>
                    <div>
                        <button className={styles.shareStoryBtn} onClick={createNewGroup}>
                            Create Group
                        </button>
                    </div>
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white', width: '85%', paddingLeft: '25px' }}>

                </div>
            </div>
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


export default CreateGroup;