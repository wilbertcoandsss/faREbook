import React, { useEffect } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { GET_USER, GET_USER_BY_TOKEN } from "../queries/userquery";
import { Navigate, useNavigate } from "react-router-dom";
import { encryptStorage } from "../pages/auth/login";
import Navbar from "../components/homepage/navbar";

const Notification = () => {

    const navigate = useNavigate();

    const logout = async () => {
        encryptStorage.clear();
        navigate('/');
    }

    const token = encryptStorage.getItem("jwtToken");
    const { data, loading } = useQuery(GET_USER_BY_TOKEN, {
        variables: { token: token }
    });

    if (loading) {
        return <div>Loading</div>
    }


    if (encryptStorage.getItem("jwtToken")) {
        console.log(data.validateJWT.firstname);
    }
    else {
        navigate('/login');
    }



    return (
        <>
            <Navbar />
            <div>
                Hi, {data.validateJWT.firstname}
                <br>
                </br>
                <button onClick={logout}>Logout</button>
            </div>
        </>
    );
};


export default Notification;