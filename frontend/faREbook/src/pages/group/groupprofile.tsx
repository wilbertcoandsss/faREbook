import React, { useEffect, useRef, useState } from 'react';
import styles from '../../styles/style.module.scss';
import { useNavigate, useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_FRIENDS, GET_USER_BY_TOKEN, GET_USER_ID, SUGGESTED_FRIENDS } from '../../queries/userquery';
import { AiFillFile, AiFillWechat, AiOutlineClose, AiOutlineCloseCircle, AiOutlineEdit, AiOutlineFile, AiOutlinePauseCircle, AiOutlinePlayCircle, AiOutlineSearch, AiOutlineSortAscending, AiOutlineSortDescending, AiOutlineWarning } from 'react-icons/ai';
import { FaBirthdayCake } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { BsFillTrashFill, BsGenderFemale, BsGenderMale, BsUpload, BsVolumeDownFill, BsVolumeMuteFill } from 'react-icons/bs';
import { GET_ALL_POST } from '../../queries/postquery';
import CardComponent from '../../components/homepage/cardPost';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { GET_ALL_REELS, GET_REELS_BY_ID } from '../../queries/reelsquery';
import Navbar from '../../components/homepage/navbar';
import AllFriendCard from './../friends/allfriendscard';
import { encryptStorage } from './../auth/login';
import FriendCard from './../friends/friendscard';
import { ACC_INV, ADD_CHAT_GROUP_HEADER, ADD_NEW_GROUP_MEMBER, CHANGE_COVER, CHECK_REQ_GROUP, CHECK_ROLE, DELETE_FILE, DELETE_GROUP_POST, DELETE_INV, GET_GROUP_FILES, GET_GROUP_INFO, GET_GROUP_POST, INSERT_FILES, INSERT_GROUP_POST, LEAVE_GROUP, LEAVE_GROUP_AS_ADMIN, PROMOTE_ADMIN } from '../../queries/groupqueries';
import CreatePost from '../../components/homepage/createPost';
import { LiaSortAmountDownSolid, LiaSortAmountUpSolid } from "react-icons/lia";
import Popup from '../../components/popup';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Messenger from '../messenger/messenger';
import { INSERT_CHAT_HEADER } from '../../queries/chatqueries';
import GroupMessenger from '../messenger/groupmessenger';
import { BiHomeAlt } from 'react-icons/bi';
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";
import GroupCardComponent from '../../components/homepage/groupCardPost';

const GroupProfile = () => {
    // Construct the link using encodedId

    const savedTheme = localStorage.getItem('darkTheme');
    const [darkTheme, setDarkTheme] = useState(savedTheme === 'dark');

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const styles = darkTheme ? darkstyles : lightstyles;

    useEffect(() => {
        localStorage.setItem('darkTheme', darkTheme ? 'dark' : 'light');
    }, [darkTheme]);

    const { id = '' } = useParams();
    // For Reels
    const decodedEncryptedData = atob(id);
    var bytes = CryptoJS.AES.decrypt(decodedEncryptedData, 'webeganteng');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    const [groupId, groupName] = originalText.split('.');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement | null>(null);


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

    const [currentTab, setCurrentTab] = useState("About");
    const [limit, setLimit] = useState(4);
    const [offset, setOffset] = useState(0);
    const [itemLoaded, setItemLoaded] = useState(4);
    const [isLoading, setIsLoading] = useState(false);

    const [addFiles] = useMutation(INSERT_FILES);
    const [deleteFile] = useMutation(DELETE_FILE);
    const [invFriends] = useMutation(ADD_NEW_GROUP_MEMBER);
    const [leaveGroup] = useMutation(LEAVE_GROUP);

    const token = encryptStorage.getItem("jwtToken");
    const { data: userDataToken, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data: groupData, loading: groupLoading, refetch: groupDataRefech } = useQuery(GET_GROUP_INFO, {
        variables: {
            groupId: groupId
        }
    })

    const { data: groupReqData, refetch: groupReqRefetch } = useQuery(CHECK_REQ_GROUP, {
        variables: {
            groupId: groupId
        }
    })

    const { data: userData, loading: userLoading } = useQuery(GET_USER_ID, {
        variables: { id: groupData?.getGroupInfo?.GroupAdmin }
    });

    const { data: groupPostData, loading: groupPostLoading, refetch: groupPostRefetch, fetchMore } = useQuery(GET_GROUP_POST, {
        variables: {
            offset: offset,
            limit: limit,
            groupId: groupId
        }
    })

    const { data: groupFilesData, refetch: groupFilesRefetch } = useQuery(GET_GROUP_FILES, {
        variables: {
            groupId: groupId
        }
    })

    const { data: roleData } = useQuery(CHECK_ROLE, {
        variables: {
            groupId: groupId,
            userId: userDataToken?.validateJWT?.id
        }
    })

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: userDataToken?.validateJWT?.id
        }
    });

    console.log(friendsData)
    window.onscroll = async function (ev) { // ini untuk detect kalau sedang di scroll
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) { // kalau misalnya udh sampai di bagian bawah
            if (groupPostData?.getAllGroupPost?.length >= itemLoaded) {
                const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
                setItemLoaded(itemLoaded + 4)
                // setScrollPosition(currentPosition);
                setIsLoading(true);
                await fetchMore({
                    variables: { limit: limit, offset: itemLoaded },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return {
                            getAllGroupPost: [...prev.getAllGroupPost, ...fetchMoreResult.getAllGroupPost],
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
    // const [removedFriendIds, setRemovedFriendIds] = useState<string[]>([]);
    // const handleRemoveFriend = (friendId: string) => {
    //     setRemovedFriendIds([...removedFriendIds, friendId]);
    // };
    const [searchText, setSearchText] = useState('');
    const sortedFiles = [...(groupFilesData?.getGroupFiles || [])];
    const [sortOrder, setSortOrder] = useState('asc')

    if (sortOrder === 'asc') {
        sortedFiles.sort((file1, file2) => file1.UploadedDate.localeCompare(file2.UploadedDate));
    } else if (sortOrder === 'desc') {
        sortedFiles.sort((file1, file2) => file2.UploadedDate.localeCompare(file1.UploadedDate));
    }

    const filteredFiles = sortedFiles.filter(file =>
        file.FileName.toLowerCase().includes(searchText.toLowerCase())
    );

    const [btnPopup, setBtnPopup] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [delGroupPost] = useMutation(DELETE_GROUP_POST);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [selectedFileType, setSelectedFileType] = useState("");

    const navigate = useNavigate();



    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newSelectedFile = event.target.files[0];
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/bmp',
                'image/webp',
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo',
                'video/x-flv',
                'video/x-matroska',
                'video/webm',
                'audio/mpeg', // mp3
                'audio/webm', // webm audio
                'audio/wav', // wav
                'audio/ogg', // ogg audio
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
                'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
                'text/plain', // txt
            ];

            if (allowedTypes.includes(newSelectedFile.type) && newSelectedFile.size <= 10 * 1024 * 1024) {
                setSelectedFile(newSelectedFile);
                setSelectedFileName(newSelectedFile.name)
                setSelectedFileType(newSelectedFile.type)
                setErrorMsg("");
            } else {
                setErrorMsg('Only image, video, audio, text, office files are allowed.');
            }
        }
    };

    const insertFile = async () => {
        if (errorMsg) {

        }
        else {
            setBtnPopup(false);
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(today.getDate()).padStart(2, '0');
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');
            const seconds = String(today.getSeconds()).padStart(2, '0');

            const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            var mediaUrls;

            if (selectedFile) {
                console.log("MASUK GK")
                setIsLoading(true);
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('upload_preset', 'f8wczy1d');

                let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
                apiUrl += 'upload';

                try {
                    const response = await Axios.post(apiUrl, formData);
                    const secureUrl = response.data.secure_url;
                    mediaUrls = secureUrl;
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }

            const newFile = {
                GroupId: groupId,
                OwnerId: userDataToken?.validateJWT?.id,
                FileName: selectedFileName,
                FileType: selectedFileType,
                UploadedDate: "",
                MediaUrl: mediaUrls
            }

            await addFiles({
                variables: {
                    newFile: newFile
                }
            }).then(() => {
                setSelectedFile(null);
                groupFilesRefetch();
                setIsLoading(false);
            })
        }
    }

    const handleDeleteFile = async (selectedFileId: string) => {
        console.log(selectedFileId)
        await deleteFile({
            variables: {
                fileId: selectedFileId
            }
        }).then(() => {
            groupFilesRefetch();
        })
    }

    function downloadPdf(docId: string, docName: string) {
        console.log(docId);

        // Find the last index of "/"
        const lastSlashIndex = docId.lastIndexOf('/');

        // Find the index of the slash before the last one
        const secondLastSlashIndex = docId.lastIndexOf('/', lastSlashIndex - 1);

        // Create the modified URL
        const modifiedImageUrl = docId.substring(0, secondLastSlashIndex + 1) + "fl_attachment/" + docId.substring(secondLastSlashIndex + 1);

        const downloadLink = document.createElement('a');

        // Set the anchor's attributes
        downloadLink.href = modifiedImageUrl;
        downloadLink.download = docName; // Set the desired filename for the downloaded file

        // Trigger a click event on the anchor element
        downloadLink.click();
    }

    function getFileExtensionFromMimeType(mimeType) {
        const extensionMap = {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            // Add more mappings as needed
        };

        return extensionMap[mimeType] || 'Other';
    }

    const [invitePopup, setInvitePopup] = useState(false);

    const [targetInvFriends, setTargetInvFriends] = useState("");
    const [leaveGroupPopup, setLeaveGroupPopup] = useState(false);
    const [changeCover] = useMutation(CHANGE_COVER);
    const [leaveGroupAdmin] = useMutation(LEAVE_GROUP_AS_ADMIN);

    const inviteFriends = async () => {
        const newMember = {
            UserID: targetInvFriends,
            GroupID: groupId,
            Role: "Member",
            Status: "Pending",
        }

        await invFriends({
            variables: {
                newMember: newMember
            }
        }).then(() => {
            toast.success('Invitation success!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setInvitePopup(false);
        })
    }

    const [acceptInv] = useMutation(ACC_INV)
    const [declineInv] = useMutation(DELETE_INV)
    const [promoteAdmin] = useMutation(PROMOTE_ADMIN);
    const [coverGroupPopup, setCoverGroupPopup] = useState(false);
    const [errorAdminMsgPopup, setErrorAdminMsgPopup] = useState(false);

    const [insertChatHeader] = useMutation(ADD_CHAT_GROUP_HEADER);

    const [goGroupChat, setGoGroupChat] = useState(false);

    return (
        <>
            <Navbar darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
            {isLoading && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '5' }}>
                    <img src="../assets/load.gif" width={"75px"} height={"75px"}></img>
                    <h1 style={{ color: 'white' }}>Uploading...</h1>
                </div>
            )}
            <div className={styles.container} style={{ height: '' }}>
                <div className={styles.sidebar} style={{ width: '15%', backgroundColor: darkTheme ? '#18191a' : 'white', color: darkTheme ? 'white' : 'black' }}>
                    <h2 style={{ margin: '0px' }}>{groupName}</h2>
                    <hr className={styles.lineBreak}></hr>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }} onClick={() => setGoGroupChat(false)}>
                        <BiHomeAlt style={{ width: '30px', height: '30px' }} />
                        Home
                    </div>
                    <br></br>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }} onClick={() => setGoGroupChat(true)}>
                        <AiFillWechat style={{ width: '30px', height: '30px' }} />
                        Group Chat
                    </div>
                </div>
                <div className={styles.main} style={{ backgroundColor: darkTheme ? '#242526' : 'white', width: '85%' }}>
                    {goGroupChat ? (
                        <GroupMessenger groupId={groupId} darkTheme={darkTheme}/>
                    ) : (
                        <div>
                            <div>
                                <img src={groupData?.getGroupInfo?.GroupBannerPic} className={styles.coverPhoto}></img>
                                {roleData?.checkRole == "Admin" && (
                                    <AiOutlineEdit style={{ position: 'absolute', width: '35px', height: '35px', backgroundColor: 'white', top: '410px', right: '40px', borderRadius: '50%', padding: '6px' }} onClick={() => setCoverGroupPopup(true)} />
                                )}
                            </div>
                            <div className={styles.profileContainer} style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                                <div className={styles.mainContainerProfile} style={{ marginLeft: '0px' }}>
                                    <div className={styles.profileInfo}>
                                        <div className={styles.userDetails} style={{ marginLeft: '0px' }}>
                                            <div>
                                                <h1>{groupName}</h1>
                                                <h3>{groupData?.getGroupInfo?.GroupDesc}</h3>
                                                <h3>{groupData?.getGroupInfo?.GroupMember
                                                    .filter(member => member.GroupMember.Status === "Approved")
                                                    .length} members</h3>
                                                <h3>
                                                    Created By: {userData?.getUser?.firstname} {userData?.getUser?.surname} on{' '}
                                                    {new Date(groupData?.getGroupInfo?.GroupCreated).toLocaleDateString('en-GB', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </h3>
                                            </div>
                                            <div style={{ marginRight: '30px' }}>
                                                {groupData?.getGroupInfo?.GroupMember.some(member => member.UserData.id === userData?.getUser?.id) ? (
                                                    <>
                                                        <div className={styles.organizeMemberBtn}>
                                                            <h4
                                                                style={{
                                                                    margin: '5px',
                                                                    textAlign: 'center'
                                                                }}
                                                                onClick={() => setInvitePopup(true)}>Invite</h4>
                                                        </div>
                                                        <br></br>
                                                        <div className={styles.organizeMemberBtn}>
                                                            <h4
                                                                style={{
                                                                    margin: '5px',
                                                                    textAlign: 'center'
                                                                }}
                                                                onClick={() => setLeaveGroupPopup(true)}>Leave</h4>
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.lineBreak}></div>
                                    <div className={styles.menuTabProfile}>
                                        <div onClick={() => setCurrentTab("Members")} className={currentTab == "Members" ? styles.selectedTabProfile : ""}>
                                            Members
                                        </div>
                                        <div onClick={() => setCurrentTab("Posts")} className={currentTab == "Posts" ? styles.selectedTabProfile : ""}>
                                            Posts
                                        </div>
                                        <div onClick={() => setCurrentTab("Files")} className={currentTab == "Files" ? styles.selectedTabProfile : ""}>
                                            Files
                                        </div>
                                        {roleData?.checkRole == "Admin" && (
                                            <div onClick={() => setCurrentTab("Organize")} className={currentTab == "Organize" ? styles.selectedTabProfile : ""}>
                                                Organize Members
                                            </div>
                                        )}
                                    </div>
                                    <hr className={styles.lineBreak} style={{ marginTop: '15px', width: '100%' }}></hr>
                                    <div className={styles.profileDetailsTab} style={{ paddingBottom: '0px' }}>
                                        {currentTab == "Members" && (
                                            <>
                                                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                    {groupData?.getGroupInfo?.GroupMember
                                                        .filter(member => member.GroupMember.Status === "Approved")
                                                        .map((member) => (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                <img src="../assets/Capture.PNG" style={{ borderRadius: '50%', width: '50px', height: '50px' }} alt="Profile" />
                                                                <h3 style={{ marginBottom: '5px' }}>{member.UserData.firstname} {member.UserData.surname}</h3>
                                                                <h4 style={{ marginTop: '10px' }}>{member.GroupMember.Role}</h4>
                                                            </div>
                                                        ))}
                                                </div>
                                            </>
                                        )}
                                        {currentTab == "Posts" && (
                                            <div style={{ width: '80%' }}>
                                                <CreatePost trigger={btnPopup} setTrigger={setBtnPopup} fetchPost={groupPostRefetch} groupId={groupId} darkTheme={darkTheme} /> {/* Show CreatePost component */}
                                                {groupPostData?.getAllGroupPost?.map((post) => (
                                                    <div style={{ position: 'relative' }}>
                                                        <GroupCardComponent groupId={groupId} groupName={groupName} groupPP={groupData?.getGroupInfo?.GroupBannerPic} key={post.id} post={post} fetchPost={groupPostRefetch} darkTheme={darkTheme} />
                                                        {roleData.checkRole == "Admin" &&
                                                            <BsFillTrashFill onClick={async () => {
                                                                await delGroupPost({
                                                                    variables: {
                                                                        postId: post.id
                                                                    }
                                                                }).then(() => {
                                                                    groupPostData
                                                                    toast.success('Post succesfully removed!', {
                                                                        position: "top-center",
                                                                        autoClose: 3000,
                                                                        hideProgressBar: false,
                                                                        closeOnClick: true,
                                                                        pauseOnHover: true,
                                                                        draggable: true,
                                                                        progress: undefined,
                                                                        theme: "light",
                                                                    });
                                                                    groupPostRefetch();
                                                                })
                                                            }} style={{ position: 'absolute', top: '25px', right: '0px' }} />
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {currentTab == "Files" && (
                                            <>
                                                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                                    <h1>Files</h1>
                                                    <div className={styles.searchBarMessenger} style={{ marginTop: '5px', padding: '12px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search in Facebook"
                                                            style={{
                                                                width: '180px'
                                                            }}
                                                            onChange={(e) => setSearchText(e.target.value)}
                                                        />
                                                        <span className={styles.searchIconMsg}><AiOutlineSearch style={{ color: 'gray' }} /></span>
                                                    </div>
                                                    <br></br>
                                                    <div style={{ width: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                                        <div style={{ background: darkTheme ? '#3a3b3c' : '#e4e6e8', width: '180%', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: '0.5px solid black' }}>
                                                            <div style={{ width: '30%', padding: '10px' }}>File Name</div>
                                                            <div style={{ width: '10%', padding: '10px' }}>Type</div>
                                                            <div
                                                                onClick={() => {
                                                                    if (sortOrder == 'asc') {
                                                                        setSortOrder('desc')
                                                                    }
                                                                    else {
                                                                        setSortOrder('asc');
                                                                    }
                                                                }}

                                                                style={{ width: '30%', padding: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                                                <div>
                                                                    Uploaded Date
                                                                </div>
                                                                <div>
                                                                    {sortOrder == 'asc' ? (
                                                                        <AiOutlineSortAscending style={{ width: '30px', height: '30px', color: '#256ff1' }} />

                                                                    ) : (
                                                                        <AiOutlineSortDescending style={{ width: '30px', height: '30px', color: '#256ff1' }} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div style={{ width: '15%', padding: '10px' }}>Action</div>
                                                        </div>
                                                        {filteredFiles.map((file) => (
                                                            <div key={file.id} style={{ background: 'whitesmoke', width: '180%', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'left' }}>
                                                                <div style={{ width: '30%', padding: '10px' }}>{file.FileName}</div>
                                                                <div style={{ width: '10%', padding: '10px' }}>{getFileExtensionFromMimeType(file.FileType)}</div>
                                                                <div style={{ width: '30%', padding: '10px' }}>
                                                                    {new Date(file.UploadedDate).toLocaleString('en-US', {
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: 'numeric',
                                                                        minute: 'numeric',
                                                                        second: 'numeric',
                                                                        hour12: true
                                                                    })}
                                                                    <br></br>
                                                                    by {file.OwnerData.firstname} {file.OwnerData.surname}
                                                                </div>
                                                                <div style={{ width: '15%', padding: '10px', gap: '20px', display: 'flex', justifyContent: 'space-around' }}>
                                                                    {(file.OwnerData.id === userDataToken?.validateJWT?.id || roleData.checkRole === "Admin") && (
                                                                        <div onClick={() => handleDeleteFile(file.ID)}>
                                                                            Delete
                                                                        </div>
                                                                    )}
                                                                    {/* <a href="https://res.cloudinary.com/demo/image/upload/fl_attachment:my_custom_filename/sample.jpg">Download</a> */}
                                                                    <div onClick={() => downloadPdf(file.MediaUrl, file.FileName)}>
                                                                        Download
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <br></br>
                                                        <div>
                                                            <h3 onClick={() => setBtnPopup(true)}>
                                                                Add Files
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <Popup trigger={btnPopup} setTrigger={setBtnPopup}>
                                                        <div>
                                                            <h2>Upload Files</h2>
                                                            <hr className={styles.lineBreak}></hr>
                                                            Uploaded By:
                                                            <div>
                                                                <img src="../assets/Capture.PNG" style={{ width: '55px', height: '55px', borderRadius: '50%', marginRight: '20px' }}></img>
                                                                {userDataToken?.validateJWT.firstname} {userDataToken?.validateJWT.surname}
                                                            </div>
                                                            <div className={styles.uploadContainer}>
                                                                {errorMsg && (
                                                                    <div className={styles.errorContainerUpload}>
                                                                        <AiOutlineCloseCircle style={{ width: '50px', height: '50px' }} />
                                                                        <br></br>
                                                                        {errorMsg}
                                                                    </div>
                                                                )}
                                                                <br></br>
                                                                <div className={styles.uploadInnerContainer} style={{ textAlign: 'center' }}>
                                                                    <label className="file-input-label">
                                                                        <input type="file" className="file-input" style={{ display: 'none', width: '100%' }} onChange={handleFileInputChange} />
                                                                        <BsUpload style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '6vh' }} />
                                                                        Add File to upload (min. 10mb)
                                                                        <br></br>
                                                                        (audio, video, text, etc)
                                                                    </label>
                                                                </div>
                                                                <h2>Media Post Preview</h2>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                                                                        {selectedFile && (
                                                                            <>
                                                                                <div style={{ position: 'relative', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                                                                    <AiOutlineFile style={{ color: 'black', width: '50px', height: '50px' }} />
                                                                                    <br></br>
                                                                                    <h5 style={{ margin: '0px' }}>File Name: {selectedFileName}</h5>
                                                                                    <br></br>
                                                                                    <h5 style={{ margin: '0px' }}>File Type: {selectedFileType}</h5>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => {
                                                                    insertFile()
                                                                }} style={{ width: '100%', background: '#3270dc', border: 'none', padding: '10px', borderRadius: '15px', color: 'white', marginTop: '15px', marginBottom: '30px' }}>
                                                                    Post
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </div>
                                            </>
                                        )}
                                        {currentTab == "Organize" && (
                                            <>
                                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                                                        <h1>Join Request</h1>
                                                        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                            {groupReqData?.checkRequest?.map((user) => (
                                                                <>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                        <img src="../assets/Capture.PNG" style={{ borderRadius: '50%', width: '50px', height: '50px' }}></img>
                                                                        <h3 style={{ marginBottom: '5px' }}>{user.firstname} {user.surname}</h3>
                                                                        <div className={styles.organizeMemberBtn}>
                                                                            <h4
                                                                                onClick={() => {
                                                                                    acceptInv({
                                                                                        variables: {
                                                                                            userId: user.id,
                                                                                            groupId: groupId,
                                                                                            status: "Approved"
                                                                                        }
                                                                                    }).then(() => {
                                                                                        toast.success('Member succesfully approved!', {
                                                                                            position: "top-center",
                                                                                            autoClose: 3000,
                                                                                            hideProgressBar: false,
                                                                                            closeOnClick: true,
                                                                                            pauseOnHover: true,
                                                                                            draggable: true,
                                                                                            progress: undefined,
                                                                                            theme: "light",
                                                                                        });
                                                                                        groupDataRefech();
                                                                                        groupReqRefetch();
                                                                                    })
                                                                                }}
                                                                                style={{ margin: '5px', textAlign: 'center' }
                                                                                }
                                                                            > Accept</h4>
                                                                        </div>
                                                                        <div className={styles.organizeMemberBtn}>
                                                                            <h4
                                                                                onClick={() => {
                                                                                    declineInv({
                                                                                        variables: {
                                                                                            userId: user.id,
                                                                                            groupId: groupId,
                                                                                        }
                                                                                    }).then(() => {
                                                                                        toast.warning('Member succesfully declined!', {
                                                                                            position: "top-center",
                                                                                            autoClose: 3000,
                                                                                            hideProgressBar: false,
                                                                                            closeOnClick: true,
                                                                                            pauseOnHover: true,
                                                                                            draggable: true,
                                                                                            progress: undefined,
                                                                                            theme: "light",
                                                                                        });
                                                                                        groupDataRefech();
                                                                                        groupReqRefetch();
                                                                                    })
                                                                                }}
                                                                                style={{ margin: '5px', textAlign: 'center' }}>Decline</h4>
                                                                        </div>
                                                                    </div >
                                                                </>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <br></br>
                                                    <br></br>
                                                    <h1>All Members</h1>
                                                    <h3>Admin</h3>
                                                    <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                        {groupData?.getGroupInfo?.GroupMember.filter(member => member.GroupMember.Status === "Approved" && member.GroupMember.Role === "Admin").map((member) => (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                <img src="../assets/Capture.PNG" style={{ borderRadius: '50%', width: '50px', height: '50px' }}></img>
                                                                <h3 style={{ marginBottom: '5px' }}>{member.UserData.firstname} {member.UserData.surname}</h3>
                                                                <h4 style={{ marginTop: '10px' }}>{member.GroupMember.Role}</h4>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <h1>Members</h1>
                                                    <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column' }}>
                                                        {groupData?.getGroupInfo?.GroupMember.filter(member => member.GroupMember.Status === "Approved" && member.GroupMember.Role == "Member").map((member) => (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                <img src="../assets/Capture.PNG" style={{ borderRadius: '50%', width: '50px', height: '50px' }}></img>
                                                                <h3 style={{ marginBottom: '5px' }}>{member.UserData.firstname} {member.UserData.surname}</h3>
                                                                <h4 style={{ marginTop: '10px' }}>{member.GroupMember.Role}</h4>
                                                                {member.GroupMember.Role == "Admin" ? (
                                                                    <>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className={styles.organizeMemberBtn}>
                                                                            <h4 style={{ margin: '5px', textAlign: 'center' }}
                                                                                onClick={() => {
                                                                                    declineInv({
                                                                                        variables: {
                                                                                            userId: member.UserData.id,
                                                                                            groupId: groupId,
                                                                                        }
                                                                                    }).then(() => {
                                                                                        toast.warning('Member succesfully kicked!', {
                                                                                            position: "top-center",
                                                                                            autoClose: 3000,
                                                                                            hideProgressBar: false,
                                                                                            closeOnClick: true,
                                                                                            pauseOnHover: true,
                                                                                            draggable: true,
                                                                                            progress: undefined,
                                                                                            theme: "light",
                                                                                        });
                                                                                        groupDataRefech();
                                                                                        groupReqRefetch();
                                                                                    })
                                                                                }}
                                                                            >Kick</h4>
                                                                        </div>
                                                                        <br></br>
                                                                        <div className={styles.organizeMemberBtn}>
                                                                            <h4 style={{ margin: '5px', textAlign: 'center' }}
                                                                                onClick={() => {
                                                                                    promoteAdmin({
                                                                                        variables: {
                                                                                            userId: member.UserData.id,
                                                                                            groupId: groupId,
                                                                                        }
                                                                                    }).then(() => {
                                                                                        toast.success('Member succesfully promoted!', {
                                                                                            position: "top-center",
                                                                                            autoClose: 3000,
                                                                                            hideProgressBar: false,
                                                                                            closeOnClick: true,
                                                                                            pauseOnHover: true,
                                                                                            draggable: true,
                                                                                            progress: undefined,
                                                                                            theme: "light",
                                                                                        });
                                                                                        groupDataRefech();
                                                                                        groupReqRefetch();
                                                                                    })
                                                                                }}
                                                                            >Promote</h4>
                                                                        </div>
                                                                        <br></br>
                                                                    </>
                                                                )}

                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <Popup trigger={invitePopup} setTrigger={setInvitePopup}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                                                <h2>Invite your friends</h2>
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
                                                        const friendIsMember = groupData?.getGroupInfo?.GroupMember.some(
                                                            (member) => member.UserData.id === friend.FriendsID
                                                        );

                                                        // Render the option only if the friend is not a group member
                                                        if (!friendIsMember) {
                                                            return (
                                                                <option key={friend.FriendsID} value={friend.FriendsID}>
                                                                    {friend.FriendsData.firstname} {friend.FriendsData.surname}
                                                                </option>
                                                            );
                                                        }

                                                        return null; // Don't render anything if friend is a group member
                                                    })}
                                                </select>
                                                <div className={styles.startChatBtn} onClick={inviteFriends}>
                                                    Invite to the group!
                                                </div>
                                            </div>
                                        </Popup>
                                        <Popup trigger={leaveGroupPopup} setTrigger={setLeaveGroupPopup}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                                                {roleData?.checkRole == "Admin" && (
                                                    <div style={{}}>
                                                        <h2>You are admin on this group</h2>
                                                    </div>
                                                )}
                                                {groupData?.getGroupInfo?.GroupMember.length == 1 && (
                                                    <div style={{ backgroundColor: '#ffc107', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
                                                        <AiOutlineWarning style={{ width: '50px', height: '50px' }} />
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <h4 style={{ margin: '10px' }}>Because you're the only one in this group</h4>
                                                            <h4 style={{ margin: '10px' }}>If you leave, then the group will be deleted!</h4>
                                                        </div>
                                                    </div>
                                                )}
                                                <h2>Are you sure want to leave the group ?</h2>
                                                <div onClick={async () => {
                                                    if (roleData?.checkRole == "Admin") {
                                                        const result = await leaveGroupAdmin({
                                                            variables: {
                                                                userId: userDataToken?.validateJWT?.id,
                                                                groupId: groupId
                                                            }
                                                        })
                                                        console.log(result.data.exitGroupAdmin);
                                                        if (result.data.exitGroupAdmin == false) {
                                                            setErrorAdminMsgPopup(true);
                                                            setLeaveGroupPopup(false);
                                                        }
                                                        else {
                                                            setLeaveGroupPopup(false);
                                                            navigate('/group');
                                                        }
                                                    }
                                                    else {
                                                        leaveGroup({
                                                            variables: {
                                                                userId: userDataToken?.validateJWT?.id,
                                                                groupId: groupId
                                                            }
                                                        }).then(() => {
                                                            navigate('/group')
                                                        })
                                                    }
                                                }}>
                                                    Yes
                                                </div>
                                                <div onClick={() => { setLeaveGroupPopup(false) }}>
                                                    No
                                                </div>
                                            </div>
                                        </Popup>
                                        <Popup trigger={coverGroupPopup} setTrigger={setCoverGroupPopup}>
                                            <div>
                                                <div className={styles.uploadInnerContainer} style={{ textAlign: 'center' }}>
                                                    <label className="file-input-label">
                                                        <input type="file" className="file-input" style={{ display: 'none', width: '100%' }} onChange={handleFileInputChange} />
                                                        <BsUpload style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '6vh' }} />
                                                        Add File to upload (min. 10mb)
                                                        <br></br>
                                                        (audio, video, text, etc)
                                                    </label>
                                                </div>
                                                <h2>Cover Photo Preview</h2>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                                                        {selectedFile && (
                                                            <>
                                                                <div style={{ position: 'relative', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                                                    <img src={URL.createObjectURL(selectedFile)} alt={`Image Preview`} style={{ position: 'relative', width: '100%' }} />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <button onClick={async () => {
                                                    var mediaUrls;
                                                    setIsLoading(true);
                                                    if (selectedFile) {
                                                        const formData = new FormData()
                                                        formData.append('file', selectedFile);
                                                        formData.append('upload_preset', 'f8wczy1d');

                                                        let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
                                                        apiUrl += 'image/upload';

                                                        try {
                                                            const response = await Axios.post(apiUrl, formData);
                                                            const secureUrl = response.data.secure_url;
                                                            mediaUrls = secureUrl;
                                                        } catch (error) {
                                                            console.error('Error uploading file:', error);
                                                        }

                                                        await changeCover({
                                                            variables: {
                                                                groupId: groupId,
                                                                mediaUrl: mediaUrls
                                                            }
                                                        }).then(() => {
                                                            setIsLoading(false);
                                                            groupDataRefech();
                                                            setCoverGroupPopup(false);
                                                        })
                                                    }
                                                }} style={{ width: '100%', background: '#3270dc', border: 'none', padding: '10px', borderRadius: '15px', color: 'white', marginTop: '15px', marginBottom: '30px' }}>
                                                    Change Cover Photo
                                                </button>
                                            </div>
                                        </Popup>
                                        <Popup trigger={errorAdminMsgPopup} setTrigger={setErrorAdminMsgPopup}>
                                            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
                                                <h2>Leaving Group Information</h2>
                                                <br></br>
                                                <h4>Because you're the only admin in this group and there are many members in this group</h4>
                                                <h4>so please choose one of your members to become an Admin for this group</h4>
                                                <br></br>
                                                <div onClick={() => setErrorAdminMsgPopup(false)}>
                                                    Okay, I Understand
                                                </div>
                                            </div>
                                        </Popup>
                                    </div>
                                </div>
                                <div className={styles.userProfileMainContainer}>

                                </div>
                            </div>
                        </div>
                    )}
                </div >
            </div >
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

export default GroupProfile;