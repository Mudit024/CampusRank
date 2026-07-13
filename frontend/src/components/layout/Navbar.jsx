import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    GraduationCap, LogOut, Loader2, Trophy, 
    TrendingUp, LayoutDashboard, Home as HomeIcon, Sparkles
} from 'lucide-react';
import { logoutSuccess } from '../../redux/slices/authSlice.js';
import apiClient from '../../api/client.js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const isAuthenticated = !!user;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        const toastId = toast.loading("Logging out...");
        try {
            await apiClient.post('/auth/logout');
            dispatch(logoutSuccess());
            toast.success("Logged out successfully!", { id: toastId });
            navigate('/login');
        } catch (error) {
            toast.error("Logout failed.", { id: toastId });
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="w-full bg-[#0a0f1d]/60 backdrop-blur-md border-b border-[rgba(255,255,255,0.04)] sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <GraduationCap className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-sm font-black text-white font-display tracking-tight">
                        Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Rank</span>
                    </span>
                </Link>

                {/* Main Navigation Links (Desktop - Always Available) */}
                <div className="hidden md:flex items-center gap-1.5 text-xs">
                    <Link 
                        to="/"
                        className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-medium ${
                            isActive('/') 
                                ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/10' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <HomeIcon className="h-3.5 w-3.5" />
                        Home
                    </Link>

                    <Link 
                        to="/dashboard/leaderboard"
                        className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-medium ${
                            isActive('/dashboard/leaderboard') 
                                ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/10' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Trophy className="h-3.5 w-3.5" />
                        Class Standings
                    </Link>

                    <Link 
                        to="/dashboard/analytics"
                        className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-medium ${
                            isActive('/dashboard/analytics') 
                                ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/10' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Student Analytics
                    </Link>

                    {isAuthenticated && (
                        <Link 
                            to="/dashboard"
                            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 font-medium ${
                                isActive('/dashboard') 
                                    ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/10' 
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            Dashboard
                        </Link>
                    )}
                </div>

                {/* Right Session Action Controls */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            {/* Explicit Log Out Text Button (Desktop) */}
                            <button 
                                onClick={handleLogout}
                                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 font-semibold rounded-xl text-xs border border-slate-800/80 transition cursor-pointer focus:outline-none"
                                title="Log Out"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/register"
                                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-xs transition"
                            >
                                Join
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Navigation bar (Always Available) */}
            <div className="md:hidden flex border-t border-[rgba(255,255,255,0.03)] bg-[#070b13]/85 text-[10px] items-center justify-around py-2">
                <Link to="/" className={`flex flex-col items-center gap-0.5 ${isActive('/') ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                    <HomeIcon className="h-4 w-4" />
                    Home
                </Link>
                <Link to="/dashboard/leaderboard" className={`flex flex-col items-center gap-0.5 ${isActive('/dashboard/leaderboard') ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                    <Trophy className="h-4 w-4" />
                    Standings
                </Link>
                <Link to="/dashboard/analytics" className={`flex flex-col items-center gap-0.5 ${isActive('/dashboard/analytics') ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                    <TrendingUp className="h-4 w-4" />
                    Analytics
                </Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" className={`flex flex-col items-center gap-0.5 ${isActive('/dashboard') ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </button>
                    </>
                ) : (
                    <Link to="/login" className={`flex flex-col items-center gap-0.5 ${isActive('/login') ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                        <LogOut className="h-4 w-4" />
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
