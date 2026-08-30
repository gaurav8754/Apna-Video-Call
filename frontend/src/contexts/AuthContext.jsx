import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);

    const navigate = useNavigate(); // ✅ correct hook

    // REGISTER
    const handleRegister = async (name, username, password) => {
        try {
            const response = await client.post("/register", {
                name,
                username,
                password,
            });

            if (response.status === httpStatus.CREATED) {
                return response.data.message;
            }
        } catch (err) {
            console.error("Registration error:", err);
            throw err;
        }
    };

    // LOGIN
    const handleLogin = async (username, password) => {
        try {
            const response = await client.post("/login", {
                username,
                password,
            });

            console.log("Login Response:", response.data);

            if (response.status === httpStatus.OK) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("username", username);
                navigate("/home");
            }
        } catch (err) {
            console.error("Login error:", err);
            throw err;
        }
    };


    // GET HISTORY
    const getHistoryOfUser = async () => {
        try {
            const response = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token"),
                },
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    // ADD TO HISTORY
    const addToUserHistory = async (meetingCode) => {
        try {
            const response = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode,
            });
            return response;
        } catch (err) {
            throw err;
        }
    };

    // DELETE FROM HISTORY
    const deleteHistoryItem = async (id) => {
        try {
            const response = await client.delete(`/delete_activity/${id}`, {
                params: {
                    token: localStorage.getItem("token"),
                },
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const data = {
        userData,
        setUserData,
        addToUserHistory,
        getHistoryOfUser,
        deleteHistoryItem,
        handleRegister,
        handleLogin,
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
