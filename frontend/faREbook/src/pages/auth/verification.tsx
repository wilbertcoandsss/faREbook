import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GET_EMAIL, GET_USER_ID, SET_VERIFIED } from "../../queries/userquery";
import CryptoJS from 'crypto-js';
import styles from "../../styles/style.module.scss"

const Verification = () => {
    const { id = '' } = useParams();
    const decodedEncryptedData = atob(id);
    var bytes = CryptoJS.AES.decrypt(decodedEncryptedData, 'webeganteng');
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    const navigate = useNavigate();

    console.log(originalText)
    const { data: userData, loading: userLoading } = useQuery(GET_USER_ID, {
        variables: {
            id: originalText
        }
    });

    console.log(userData?.getUser)
    const [verif, { data: verifData, error: verifError }] = useMutation(SET_VERIFIED);

    if (userLoading) {
        return <div>Loading...</div>
    }

    if (userData) {
        verif({
            variables: { id: originalText }
        })
    }


    return (
        <>
            {userData ? (
                <div className={styles.loginContainer} style={{ textAlign: 'center' }}>
                    <img width="250px" height="250px" src='../assets/logofb.svg'></img>
                    <div className={styles.loginInnerContainer}>
                        <h4>Congratulations!</h4>
                        your account email ({userData.getUser.email}) has been verified!
                        <br></br>
                        <button className={styles.primaryLoginAgainBtn}
                            onClick={() => navigate('/login')}>
                            Click here to login again
                        </button>

                    </div>
                </div>
            ) : (
                <>404 not found</>
            )}
        </>
    )
}

export default Verification;