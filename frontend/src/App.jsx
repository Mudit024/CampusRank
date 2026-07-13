import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import DashboardPlaceholder from './pages/dashboard/DashboardPlaceholder.jsx';
import TranscriptUpload from './pages/dashboard/TranscriptUpload.jsx';
import Leaderboard from './pages/dashboard/Leaderboard.jsx';
import Analytics from './pages/dashboard/Analytics.jsx';
import Home from './pages/Home.jsx';
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';
import PublicRoute from './components/routes/PublicRoute.jsx';
import Layout from './components/layout/Layout.jsx';

function App() {
    return (
        <>
            {/* Real-time alert notifications toast mount */}
            <Toaster 
                position="top-center" 
                toastOptions={{
                    style: {
                        background: '#0c1222',
                        color: '#f8fafc',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '12px',
                        borderRadius: '12px'
                    }
                }} 
            />

            <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Layout>
                            <DashboardPlaceholder />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/upload" element={
                    <ProtectedRoute>
                        <Layout>
                            <TranscriptUpload />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/leaderboard" element={
                    <ProtectedRoute requireVerified={true}>
                        <Layout>
                            <Leaderboard />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/analytics" element={
                    <ProtectedRoute requireVerified={true}>
                        <Layout>
                            <Analytics />
                        </Layout>
                    </ProtectedRoute>
                } />
                
                <Route path="/" element={
                    <Layout>
                        <Home />
                    </Layout>
                } />
                
                {/* Fallbacks */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
