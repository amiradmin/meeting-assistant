// API service for backend communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
    }

    return data;
};

export const refreshToken = async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/api/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error('Token refresh failed');
    }

    return data;
};

export const getUserProfile = async (accessToken) => {
    const response = await fetch(`${API_BASE_URL}/api/users/me/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to get user profile');
    }

    return data;
};