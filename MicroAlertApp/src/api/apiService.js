import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 Replace with your LAPTOP IPv4
const BASE_URL = 'http://10.16.133.130:5000/api';

const API = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15 seconds timeout
});

// =======================
// REQUEST INTERCEPTOR
// =======================
 
API.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        } catch (error) {
            console.log("Request Interceptor Error:", error);
            return config;
        }
    },
    (error) => Promise.reject(error)
);


// =======================
// RESPONSE INTERCEPTOR
// =======================

API.interceptors.response.use(
    (response) => response,
    async (error) => {

        // 🔐 Auto logout if token expired
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            console.log("Session expired. Please login again.");
        }

        // 🌐 Network Error Handling
        if (!error.response) {
            console.log("Network Error: Check backend & IP address");
        }

        return Promise.reject(error);
    }
);

export default API;