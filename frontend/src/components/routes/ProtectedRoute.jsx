import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route protection wrapper verifying user authentication and redirecting accordingly
 */
const ProtectedRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
