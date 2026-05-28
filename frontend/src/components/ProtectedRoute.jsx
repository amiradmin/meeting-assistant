import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        // User is not authenticated, redirect to login
        return <Navigate to="/login" replace />;
    }

    // Check if token is expired (optional)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
            // Token expired, clear storage and redirect to login
            localStorage.clear();
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;