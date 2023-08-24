import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import styles from "../../styles/style.module.scss"
import { useMutation, useQuery } from '@apollo/client';
import { ADD_USERS, GET_EMAIL, LOGIN_USER } from '../../queries/userquery';
import emailjs from 'emailjs-com';
import CryptoJS from 'crypto-js';
import { encryptStorage } from './login';

const Register = () => {

    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [tnc, setTnc] = useState("");

    const [error, setError] = useState("")
    const [addUser, { data: registerData }] = useMutation(ADD_USERS);
    const { data: emailData } = useQuery(GET_EMAIL, {
        variables: { email }
    });

    const { data: searchData } = useQuery(GET_EMAIL, {
        variables: { email }
    })

    // if (!encryptStorage.getItem("jwtToken")) {
    //     navigate('/login');
    // }
    // else {
    //     navigate('/')
    // }

    const registerUser = async () => {
        console.log(firstName, surname, email, password, dob, gender, tnc);

        if (firstName == "") {
            setError("First Name must be filled!");
            return;
        }
        else if (surname == "") {
            setError("Surname must be filled!");
            return;
        }
        else if (email == "") {
            setError("Email must be filled!");
            return;
        }
        else if (!email.endsWith("@gmail.com")) {
            setError("Email must be ends with @gmail.com");
            return;
        }
        else if (emailData) {
            setError("Email must be unique!");
            return;
        }
        else if (!password.match("^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$")) {
            setError("Password at least contains 1 number and character");
            return;
        }
        else if (Date.parse(dob) > Date.now()) {
            setError("DOB must be greater than today!");
            return;
        }
        else if (gender == "") {
            setError("Gender must be chosen!");
            return;
        }
        else if (tnc == "") {
            setError("TnC must be checked!");
            return;
        }
        else {
            const inputUser = {
                firstname: firstName,
                surname: surname,
                email: email,
                password: password,
                Dob: dob,
                verifcode: "",
                isverified: false,
                gender: gender,
                profilepic: ""
            }

            try {
                const result = await addUser({
                    variables: {
                        inputUser: inputUser,
                    },
                });

                if (result.data && result.data.createUser) {
                    console.log(result.data.createUser.id);
                    const verifLink = result.data.createUser.id;
                    var ciphertext = CryptoJS.AES.encrypt(verifLink, 'webeganteng').toString()
                    const encodedEncryptedData = btoa(ciphertext);
                    // You can now perform further actions with the created user data, if needed.
                    emailjs.init('gPqRUoev9iRxl2vef');
                    var params = {
                        from_name: "faREbook Development Team",
                        email_id: email,
                        message: `Hi, ${firstName}. Please click this link: http://localhost:5173/verification/${encodedEncryptedData}" Verification Link`
                    }

                    emailjs.send('service_g296tw6', 'template_68bi8z5', params)
                    setIsRegister(true);
                } else {
                    console.log('Error: createUser data not available');
                }
            } catch (error) {
                console.log('Error during mutation:', error);
            }
        }
    }

    return (
        <>
            {isRegister ? (
                <div className={styles.registerContainer}>
                    Please check on your registered email <strong>({email})</strong>
                    <br></br>
                    We already send the confirmation link to that email.
                    <br></br>
                    <a href='https://mail.google.com'>Click here to go to Gmail!</a>
                </div>
            ) : (
                <>
                    <div className={styles.registerContainer}>
                        <img width="250px" height="250px" src='assets/logofb.svg'></img>
                        <div className={styles.registerInnerContainer}>
                            <h2>Create a new account</h2>
                            <h3>It's quick and easy</h3>
                            <div>
                                <div className={styles.errorMsg1} style={{ display: error == "" ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
                                    <div >
                                        <strong>Invalid Requirements</strong>
                                        <br></br>
                                        {error}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <input type='text' placeholder='First name' onChange={(e) => setFirstName(e.target.value)}></input>
                                <input type='text' placeholder='Surname' onChange={(e) => setSurname(e.target.value)}></input>
                            </div>
                            <div>
                                <input type='text' placeholder='Email address' onChange={(e) => setEmail(e.target.value)}></input>
                            </div>
                            <div>
                                <input type='password' placeholder='Password' onChange={(e) => setPassword(e.target.value)}></input>
                            </div>
                            <div>
                                <input type='date' placeholder='Dob' onChange={(e) => setDob(e.target.value)}></input>
                            </div>
                            <div>
                                <select onChange={(e) => setGender(e.target.value)}>
                                    <option value="">Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', alignItems: 'flex-start' }}>
                                <div className="">
                                    <input type='checkbox' onChange={(e) => setTnc(e.target.value)}></input>
                                </div>
                                <div>
                                    I Agree To Terms & Conditions that applied!
                                </div>
                            </div>
                            <br></br>
                            <div>
                                <button className={styles.primaryBtn} onClick={registerUser}>Create new account</button>
                            </div>
                            <br></br>
                            <Link to="/login">Already have an account?</Link>
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
            )}
        </>
    );
}

export default Register;