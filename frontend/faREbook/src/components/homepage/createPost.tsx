import React, { useCallback, useEffect, useState } from "react";
import styles from "../../styles/style.module.scss";
import Popup from "../popup";
import { encryptStorage } from "../../pages/auth/login";
import { GET_ALL_FRIENDS, GET_USER_BY_TOKEN } from "../../queries/userquery";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import { ADD_POST, INSERT_MEDIA, INSERT_TAG } from "../../queries/postquery";
import { ToastContainer, toast } from 'react-toastify';
import Axios from 'axios';
import { BsUpload } from "react-icons/bs";
import 'react-toastify/dist/ReactToastify.css';
import { CiCircleRemove } from "react-icons/ci";
import { AiOutlineClose, AiOutlineCloseCircle } from "react-icons/ai";
import { INSERT_GROUP_POST } from "../../queries/groupqueries";
import { MdPublic } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import { BiUser } from "react-icons/bi";
import 'quill-mention';
import lightstyles from "../../styles/style.module.scss";
import darkstyles from "../../styles/dark.module.scss";

const CreatePost = (props) => {
    const navigate = useNavigate();

    const styles = props.darkTheme ? darkstyles : lightstyles;

    const [errorMsg, setErrorMsg] = useState("");

    const [btnPopup, setBtnPopup] = useState(false);
    const [nestedPopup, setNestedPopup] = useState(false);

    const [load, setLoad] = useState(Boolean);
    // Post Data
    const [postVisibility, setPostVisibility] = useState("public");
    const [editorContent, setEditorContent] = useState('');

    const [addPost, { data: postData }] = useMutation(ADD_POST);
    const [insertMedia, { data: mediaData }] = useMutation(INSERT_MEDIA);

    const [insertTag] = useMutation(INSERT_TAG);

    const [addGroupPost] = useMutation(INSERT_GROUP_POST);

    const [imageSelected, setImageSelected] = useState('');

    const getImageSrc = (visibility) => {
        if (visibility === 'public') {
            return 'assets/public.png';
        } else if (visibility === 'friends') {
            return 'assets/friendsvisible.png';
        } else if (visibility === 'specific') {
            return 'assets/friend.png';
        }
        return 'assets/public.png'; // Provide a default image source if needed
    };

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const removeSelectedFile = (indexToRemove) => {
        setSelectedFiles((prevSelected) => prevSelected.filter((_, index) => index !== indexToRemove));
    };


    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newSelectedFiles = Array.from(event.target.files);
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
            ];

            const validNewFiles = Array.from(newSelectedFiles).filter(
                (file: File) =>
                    allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
            );

            if (validNewFiles.length + selectedFiles.length > 10) {
                setErrorMsg('You can only upload up to 10 files in total.');
                return;
            }

            for (const file of newSelectedFiles) {
                if (!allowedTypes.includes(file.type)) {
                    setErrorMsg('Only image and video files are allowed.');
                    return;
                }

                await setSelectedFiles((prevSelected: any) => [
                    ...prevSelected,
                    file,
                ]);

                setErrorMsg("");
            }
        }
    };

    const [groupMembers, setGroupMembers] = useState<string[]>([]); // Specify the type as string[]

    const [taggedPopup, setTaggedPopup] = useState(false);

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

    const insertPost = async () => {

        if (editorContent == "") {
            setErrorMsg("Content must be not empty!");
            return;
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');

        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const inputPost = {
            contentText: editorContent,
            authorId: data.validateJWT.id,
            postDate: formattedDateTime,
            postPrivacy: postVisibility,
        }

        console.log(inputPost)

        let mediaUrls: string[] = []

        setLoad(true);
        setBtnPopup(false);

        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'f8wczy1d');

            let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
            if (file.type.includes('image')) {
                apiUrl += 'image/upload';
            } else if (file.type.includes('video')) {
                apiUrl += 'video/upload';
            } else {
                console.log(`Unsupported file type: ${file.type}`);
                continue;
            }

            try {
                const response = await Axios.post(apiUrl, formData);
                const secureUrl = response.data.secure_url;
                mediaUrls.push(secureUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        const result = await addPost({
            variables: {
                inputPost: inputPost
            }
        });

        for (const tag of groupMembers) {
            console.log(tag)
            console.log(result?.data.insertPost.id)
            await insertTag({
                variables: {
                    userId: tag,
                    postId: result.data.insertPost.id
                }
            })
        }

        await insertMedia({
            variables: {
                postId: result.data.insertPost.id,
                mediaUrls: mediaUrls
            }
        }).finally(() => {
            toast.success('Post successfully inserted!', {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            props.fetchPost();
            setSelectedFiles([]);
            setEditorContent("");
            setLoad(false);

        });
    }

    const insertGroupPost = async () => {

        if (editorContent == "") {
            setErrorMsg("Content must be not empty!");
            return;
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');

        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const inputPost = {
            groupId: props.groupId,
            contentText: editorContent,
            authorId: data.validateJWT.id,
            postDate: formattedDateTime,
            postPrivacy: postVisibility
        }

        console.log(inputPost)

        let mediaUrls: string[] = []

        setLoad(true);
        setBtnPopup(false);

        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'f8wczy1d');

            let apiUrl = 'https://api.cloudinary.com/v1_1/dw7bewmoo/';
            if (file.type.includes('image')) {
                apiUrl += 'image/upload';
            } else if (file.type.includes('video')) {
                apiUrl += 'video/upload';
            } else {
                console.log(`Unsupported file type: ${file.type}`);
                continue;
            }

            try {
                const response = await Axios.post(apiUrl, formData);
                const secureUrl = response.data.secure_url;
                mediaUrls.push(secureUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        const result = await addGroupPost({
            variables: {
                newGroupPost: inputPost
            }
        });


        await insertMedia({
            variables: {
                postId: result.data.insertGroupPost.id,
                mediaUrls: mediaUrls
            }
        }).finally(() => {
            toast.success('Post successfully inserted!', {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            props.fetchPost();
            setSelectedFiles([]);
            setEditorContent("");
            setLoad(false);

        });
    }

    const openNestedPopup = () => {
        setNestedPopup(true);
    };

    const handleVisibilityChange = (value) => {
        setPostVisibility(value);
        if (value === 'specific') {
            openNestedPopup();
        }
    };

    const [dots, setDots] = useState('.');

    useEffect(() => {
        if (load) {
            const interval = setInterval(() => {
                setDots(dots => dots === '...' ? '.' : dots + '.');
            }, 450);

            return () => clearInterval(interval);
        }
    }, [load]);

    const token = encryptStorage.getItem("jwtToken");
    const { data, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data: friendsData, loading: friendsLoading, refetch: friendsRefetch } = useQuery(GET_ALL_FRIENDS, {
        variables: {
            userId: data?.validateJWT?.id
        }
    });

    const mentionSource = useCallback(async (searchTerm, renderList) => {
        if (!friendsLoading && friendsData?.getAllFriends) {
            const matchedFriends = friendsData.getAllFriends.filter((friend) =>
                `${friend.FriendsData.firstname} ${friend.FriendsData.surname}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
            renderList(
                matchedFriends.map((friend) => ({
                    value: `${friend.FriendsData.firstname} ${friend.FriendsData.surname}`,
                    id: friend.FriendsID,
                }))
            );
        }
    }, [friendsData, friendsLoading]);

    const modules = {
        toolbar: [
            // other toolbar options
            ['link'],
            ['image'],
            ['mention'],
        ],
        mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ['@'],
            source: mentionSource,
        },
    };


    if (loading) {
        return <div>Loading</div>
    }


    if (encryptStorage.getItem("jwtToken")) {

    }
    else {
        navigate('/login');
    }

    const mentionClicked = editorContent.includes('@');

    return (
        <>
            <div className={styles.insertPostCard}>
                <div>
                    <img src={data?.validateJWT?.profilepic} style={{ width: '45px', height: '45px', borderRadius: '50%' }}></img>
                </div>
                <div className={styles.insertPostField} style={{ width: '36%' }}>
                    <button onClick={() => setBtnPopup(true)}>
                        What's on your mind, {data?.validateJWT?.firstname} ?
                    </button>
                </div>
            </div>

            {load && (
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: '5' }}>
                    <img src="assets/load.gif" width={"75px"} height={"75px"}></img>
                    <h1 style={{ color: 'white' }}>Please wait{dots}</h1>
                </div>
            )}

            <Popup trigger={btnPopup} setTrigger={setBtnPopup} darkTheme={props.darkTheme}
            >
                <div>
                    <h2>Create Post</h2>
                    <hr className={styles.lineBreak}></hr>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                        <div>
                            <img src={data?.validateJWT?.profilepic} style={{ width: '55px', height: '55px', borderRadius: '50%', marginRight: '20px' }}></img>
                        </div>
                        <div>
                            <h3>{data.validateJWT.firstname} {data.validateJWT.surname}</h3>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                <div>
                                    {postVisibility == "public" && (
                                        <MdPublic />
                                    )}
                                    {postVisibility == "friends" && (
                                        <FaUserFriends />
                                    )}
                                    {postVisibility == "specific" && (
                                        <BiUser />
                                    )}
                                </div>
                                <div>
                                    <select style={{
                                        border: `2px solid ${postVisibility === 'public'
                                            ? 'green'
                                            : postVisibility === 'friends'
                                                ? '#e3c042'
                                                : postVisibility === 'specific'
                                                    ? 'red'
                                                    : 'transparent'
                                            }`,
                                        outline: 'none',
                                        marginTop: '7px'
                                    }}
                                        onChange={(e) => handleVisibilityChange(e.target.value)}
                                        defaultValue="public"
                                    >
                                        <option value="public">Public</option>
                                        <option value="friends">Friends</option>
                                        <option value="specific">Specific Friends</option>
                                    </select>
                                </div>
                            </div>
                        </div>
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
                        <div className={styles.uploadInnerContainer}>
                            <label className="file-input-label">
                                <input type="file" className="file-input" style={{ display: 'none', width: '100%' }} onChange={handleFileInputChange} multiple />
                                <BsUpload style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '6vh' }} />
                                Add Photo/Video(s) to upload
                            </label>
                        </div>
                        <h2>Media Post Preview</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '100%', overflowY: 'scroll', maxHeight: '400px' }}>
                                {selectedFiles.map((file, index) => (
                                    <>
                                        <div key={index} style={{ position: 'relative', marginBottom: '10px' }}>
                                            {file.type.startsWith('image/') ? (
                                                <img src={URL.createObjectURL(file)} alt={`Image Preview ${index}`} className={styles.previewImg} />
                                            ) : (
                                                <video controls className={styles.previewVideo}>
                                                    <source src={URL.createObjectURL(file)} type={file.type} />
                                                </video>
                                            )}
                                            <button onClick={() => removeSelectedFile(index)} className={styles.removeButton}>
                                                <AiOutlineClose className={styles.removeMedBtn} />
                                            </button>
                                            <div className={styles.numbering}>
                                                {index + 1}
                                            </div>
                                        </div>
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>
                    <ReactQuill
                        value={editorContent}
                        modules={modules}
                        onChange={setEditorContent}
                        placeholder={`What's on your mind, ${data.validateJWT.firstname}`}
                        theme="snow"
                        style={{
                            border: 'none',
                            borderRadius: '30px',
                            color: props.darkTheme ? 'white' : 'black',
                        }}
                        className={styles.richEditor}
                    />
                    <br></br>
                    {mentionClicked && <p>
                        <br></br>
                        <br></br>
                        <br></br></p>}
                    <h4>Tagged Friends (Optional)</h4>
                    <div>
                        <select
                            onChange={(e) => addMember(e.target.value)}
                            style={{
                                borderRadius: '5px',
                                padding: '8px',
                                fontSize: '12px',
                                color: 'black',
                                width: '100%'
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
                            <h3>Tagged :</h3>
                            {groupMembers.map((member) => {
                                const invitedFriend = friendsData?.getAllFriends?.find(
                                    (friend) => friend.FriendsID === member
                                );
                                if (invitedFriend) {
                                    return (
                                        <div key={invitedFriend.FriendsID} style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '8px 1px 5px 1px', backgroundColor: props.darkTheme ? '#242526' : 'white', borderRadius: '10px', padding: '8px', border: '1px solid rgb(187, 187, 187)' }}>
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
                    <button onClick={() => {
                        if (props.groupId) {
                            insertGroupPost()
                        }
                        else {
                            insertPost()
                        }
                    }} style={{ width: '100%', background: '#3270dc', border: 'none', padding: '10px', borderRadius: '15px', color: 'white', marginTop: '15px', marginBottom: '30px' }}>
                        Post
                    </button>
                </div>
            </Popup>



            <Popup trigger={nestedPopup} setTrigger={setNestedPopup}>
                <h2>Nested Popup</h2>
                <hr className={styles.lineBreak}></hr>
                <h3>This is a nested popup</h3>
                {/* <button className={styles.closeBtn} onClick={() => setNestedPopup(false)}>Close Nested Popup</button> */}
            </Popup>
            <ToastContainer
                position="bottom-left"
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
    )
}

export default CreatePost;