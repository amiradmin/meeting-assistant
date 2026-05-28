// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Get token directly without any state
    const token = localStorage.getItem('access_token');

    // Simple check - no complex logic that could cause re-renders
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Return children directly - no extra wrapping
    return children;
};

export default PrivateRoute;