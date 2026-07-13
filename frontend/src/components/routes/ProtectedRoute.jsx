import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

/**
 * Route protection wrapper verifying user authentication and redirecting accordingly
 */
const ProtectedRoute = ({ children, requireVerified = false }) => {
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user) {
            toast.error("Please sign in to access CampusRank features.", { id: 'auth-required' });
        } else if (requireVerified && !user.isTranscriptVerified) {
            toast.error("Please upload and verify your transcript to access standings and analytics.", { id: 'verification-required' });
        }
    }, [user, requireVerified]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireVerified && !user.isTranscriptVerified) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
