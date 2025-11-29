import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isAppReady, setIsAppReady] = useState(false);

    // check if user is logged in
    useEffect(() => {
        const init = async () => {
            try {
                const t = await AsyncStorage.getItem('token');
                const u = await AsyncStorage.getItem('user');

                if (t && u) {
                    // console.log('Found user session');
                    setAuthToken(t);
                    setUserData(JSON.parse(u));
                }
            } catch (e) {
                console.warn('Auth init error', e);
            } finally {
                setIsAppReady(true);
            }
        };
        init();
    }, []);

    const login = async (username, password) => {
        // console.log('Logging in:', username);
        const response = await client.post('/auth/signin', { username, password });

        const { token, user } = response.data;

        setAuthToken(token);
        setUserData(user);

        // save to storage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
    };

    const register = async (username, password) => {
        const response = await client.post('/auth/signup', { username, password });

        const { token, user } = response.data;

        setAuthToken(token);
        setUserData(user);

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
    };

    const logout = async () => {
        try {
            await AsyncStorage.clear(); // clear everything
            setUserData(null);
            setAuthToken(null);
        } catch (e) {
            console.log('Logout error', e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user: userData,
            token: authToken,
            loading: !isAppReady,
            signIn: login,
            signUp: register,
            signOut: logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
