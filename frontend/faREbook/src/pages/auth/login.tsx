import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import styles from "../../styles/style.module.scss";
import { useMutation, useQuery } from '@apollo/client';
import { CHECK_VERIF, GET_USER_BY_TOKEN, LOGIN_USER } from '../../queries/userquery';
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('rogerganteng', {
    encAlgorithm: 'Rabbit',
});

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")
    const [loginUser, { data: loginData, loading: loginLoading, error: errorLoading }] = useMutation(LOGIN_USER);

    const token = encryptStorage.getItem("jwtToken");
    const { data, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    const { data: verifData } = useQuery(CHECK_VERIF, {
        variables: {
            email: email ? email : ""
        }
    })

    // if (!encryptStorage.getItem("jwtToken")) {
    //     navigate('/login');
    // }
    // else {
    //     navigate('/')
    // }

    const userLogin = async () => {
        if (email == "") {
            setError("Email must be not empty!");
            return;
        }
        else if (password == "") {
            setError("Password must be not empty!");
            return;
        }
        else if (verifData?.checkVerified == false) {
            console.log(verifData)
            setError("User not verified!");
            return;
        }
        else {
            try {
                const { data } = await loginUser({ variables: { email, password } });
                console.log(data.loginUser);
                setError("")
                encryptStorage.setItem("jwtToken", data.loginUser.token)
                navigate('/');
            } catch (error) {
                setError("Credentials invalid!");
            }
        }

        return
    }


    return (
        <>
            <div className={styles.loginContainer}>
                <img width="250px" height="250px" src='assets/logofb.svg'></img>
                <div className={styles.loginInnerContainer}>
                    <h2>Log in to FaREbook</h2>
                    <div>
                        <div className={styles.errorMsg} style={{ display: error == "" ? 'none' : 'block' }}>
                            <div >
                                <strong>Invalid Credentials</strong>
                                <br></br>
                                {error}
                            </div>
                        </div>
                    </div>
                    <div>
                        <input type='text' placeholder='Email address' onChange={(e) => setEmail(e.target.value)}></input>
                    </div>
                    <div>
                        <input type='password' placeholder='Password' onChange={(e) => setPassword(e.target.value)}></input>
                    </div>
                    <br></br>
                    <div>
                        <button className={styles.primaryBtn}
                            onClick={userLogin}>Log in</button>
                    </div>
                    <br></br>
                    <Link to="/forgotAcc">Forgotten account?</Link>
                    <h4>or</h4>
                    <div>
                        <button onClick={() => navigate('/register')} className={styles.primaryBtn}>
                            Create new account</button>
                    </div>
                </div>
            </div>
            <div className={styles.footer}>
                <ul>
                    <li><a href="https://www.facebook.com/privacy/policy/?entry_point=comet_dropdown" target="_blank" rel="noopener noreferrer">Privacy</a></li>
                    <li><a href="https://www.facebook.com/policies?ref=pf" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
                    <li><a href="https://www.facebook.com/business/" target="_blank" rel="noopener noreferrer">Advertising</a></li>
                    <li><a href="https://about.meta.com/" target="_blank" rel="noopener noreferrer">More about Meta © 2023</a></li>
                    <li><a href="https://www.facebook.com/policies/cookies/" target="_blank" rel="noopener noreferrer">Cookies</a></li>
                </ul>
                <div>
                    Copyright WB23-1 © 2023
                </div>
            </div>
        </>
    );
}

export default Login;