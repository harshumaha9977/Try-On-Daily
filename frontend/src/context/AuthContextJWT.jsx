import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            setCurrentUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (username, password) => {
        const response = await fetch('https://acre-stopped-backer.ngrok-free.dev/token', {
            method: 'POST',
            headers: { 'bypass-tunnel-reminder': 'true', 'ngrok-skip-browser-warning': 'true',  'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username,
                password,
                grant_type: 'password'
            })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        const user = { username };

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
    };

    // Register function
    const register = async (username, email, password) => {
        const response = await fetch('https://acre-stopped-backer.ngrok-free.dev/register', {
            method: 'POST',
            headers: { 'bypass-tunnel-reminder': 'true', 'ngrok-skip-browser-warning': 'true',  'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                hashed_password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Registration failed');
        }

        return await login(username, password);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}