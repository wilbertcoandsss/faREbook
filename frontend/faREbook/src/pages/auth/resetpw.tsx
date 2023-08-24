import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GET_EMAIL, GET_USER_ID, CHECK_PW, SET_VERIFIED, RESET_PW } from "../../queries/userquery";
import styles from "../../styles/style.module.scss"
import CryptoJS from 'crypto-js';

const ResetPw = () => {
    const navigate = useNavigate();
    const [isDone, setIsDone] = useState(false);
    const { id = '' } = useParams();
    const decodedEncryptedData = atob(id);
    var bytes = CryptoJS.AES.decrypt(decodedEncryptedData, 'webeganteng');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    const { data: userData, loading: userLoading } = useQuery(GET_USER_ID, {
        variables: {
            id: originalText
        }
    });

    console.log(userData)

    const [checkPw, { data: pwData, error: pwError }] = useMutation(CHECK_PW);
    const [resetPw, { data: resetData }] = useMutation(RESET_PW);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    if (userLoading) {
        return <div>Loading...</div>
    }



    const resetPassword = async () => {
        console.log("SABAR", userData?.getUser?.id, password);

        const res = await checkPw({
            variables: { pw: password, id: userData?.getUser?.id }
        })

        if (password.length == 0) {
            setError("Please fill in your New Password!");
            return;
        }

        if (confirmPw.length == 0) {
            setError("Please confirm your New Password!");
            return;
        }

        if (confirmPw != password) {
            setError("Confirm Password must be same")
            return;
        }

        if (res.data.checkPassword == false) {
            setError("New Password must be different from Old Password!");
            return;
        }
        else {
            setError("");
            await resetPw({
                variables: { pw: password, id: id }
            })
            console.log("SANTUYY AMAN");
            setIsDone(true);
            return;
        }
    }


    return (
        <>
            {userData ? (
                isDone ? (
                    <div className={styles.loginContainer} style={{ textAlign: 'center' }}>
                        <img width="250px" height="250px" src='../assets/logofb.svg'></img>
                        <div className={styles.loginInnerContainer}>
                            <h4>Congratulations!</h4>
                            Your password has been succesfully recovered!
                            <br></br>
                            <button className={styles.primaryLoginAgainBtn} style={{width: '175px'}}
                                onClick={() => navigate('/login')}>
                                Click here to login again
                            </button>

                        </div>
                    </div>
                ) :
                    <div className={styles.resetContainer}>
                        <img width="250px" height="250px" src='../assets/logofb.svg'></img>
                        <div className={styles.resetInnerContainer}>
                            <h3>Reset your Password</h3>
                            <hr className={styles.lineBreak}></hr>
                            <div>
                                <div className={styles.errorMsg1} style={{ display: error == "" ? 'none' : 'flex' }}>
                                    <div >
                                        <strong>Invalid Requirements</strong>
                                        <br></br>
                                        {error}
                                    </div>
                                </div>
                            </div>
                            <h4>Please enter your new Password!</h4>
                            <input type="password" placeholder="New Password" onChange={(e) => setPassword(e.target.value)}></input>
                            <hr className={styles.lineBreak}></hr>
                            <h4>Confirm it again!</h4>
                            <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPw(e.target.value)}></input>
                            <hr className={styles.lineBreak}></hr>
                            <button className={styles.primaryBtn} style={{ margin: 'auto' }} onClick={resetPassword}>Reset Password</button>
                        </div>

                    </div>
            )
                : (
                    <>404 Not Found</>
                )
            }
        </>
    )
}

export default ResetPw;