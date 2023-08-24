import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState, } from "react";
import { Link, useParams } from "react-router-dom";
import { GET_EMAIL, GET_USER_ID, SET_VERIFIED } from "../../queries/userquery";
import styles from "../../styles/style.module.scss"
import { useNavigate } from "react-router-dom";
import emailjs from 'emailjs-com';
import CryptoJS from 'crypto-js';

const ForgotAcc = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("")
    const navigate = useNavigate();
    const [isForgot, setIsForgot] = useState(false);


    const { data: emailData } = useQuery(GET_EMAIL, {
        variables: { email }
    });

    const confirm = () => {
        if (!emailData) {
            setError("Email not found!");
            return;
        }
        else {
            setError("");
            const verifLink = emailData.getUserByEmail.id;
            var ciphertext = CryptoJS.AES.encrypt(verifLink, 'webeganteng').toString()
            const encodedEncryptedData = btoa(ciphertext);
            emailjs.init('gPqRUoev9iRxl2vef');
            var params = {
                from_name: "faREbook Development Team",
                email_id: email,
                message: `Hi, ${emailData.getUserByEmail.firstname}. Please click this link: http://localhost:5173/resetpw/${encodedEncryptedData}" to recover your password`
            }

            emailjs.send('service_g296tw6', 'template_68bi8z5', params)
            setIsForgot(true);
        }
    }

    return (
        <>
            {isForgot ? (
                <div className={styles.forgotContainer}>
                    Please check your email <strong>{emailData.getUserByEmail.email}</strong>
                    <br></br>
                    We already send the recovery link to that email.
                    <br></br>
                    <a href='https://mail.google.com'>Click here to go to Gmail!</a>
                </div>
            ) : (
                <div className={styles.forgotContainer}>
                    <img width="250px" height="250px" src='../assets/logofb.svg'></img>
                    <div className={styles.forgotInnerContainer}>
                        <h3>Find Your Account</h3>
                        <hr className={styles.lineBreak}></hr>
                        <div>
                            <div className={styles.errorMsg1} style={{ display: error == "" ? 'none' : 'flex' }}>
                                <div >
                                    <strong>Invalid Requirements</strong>
                                    <br></br>
                                    Email not found!
                                </div>
                            </div>
                        </div>
                        <h4>Please enter your email address to search for your account.</h4>
                        <input type="text" placeholder="Email address" onChange={(e) => setEmail(e.target.value)}></input>
                        <hr className="line-break"></hr>
                        <div className={styles.accBtn}>
                            <div>
                                <button onClick={() => navigate('/login')} className={styles.primaryBtn} style={{ backgroundColor: 'red', width: '105%' }}>Cancel</button>
                            </div>
                            <div>
                                <button className={styles.primaryBtn} style={{ width: '105%' }} onClick={confirm}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}


export default ForgotAcc;