import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route wrapper that redirects logged-in users away from authentication views (login/register)
 */
const PublicRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
