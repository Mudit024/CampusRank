import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
    LogOut, CheckCircle2, AlertCircle, FileText, ArrowRight, 
    ShieldAlert, Trophy, TrendingUp, Sparkles, GraduationCap, 
    Award, ShieldCheck, Calendar, BookOpen, User
} from 'lucide-react';
import { logoutSuccess, loginSuccess } from '../../redux/slices/authSlice.js';
import apiClient from '../../api/client.js';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const DashboardPlaceholder = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Refresh profile details on mount
    const refreshProfile = async () => {
        try {
            const response = await apiClient.get('/auth/me');
            dispatch(loginSuccess(response.data.data));
        } catch (e) {
            console.error("Failed to refresh profile info:", e);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    return (
        <div className="min-h-screen bg-[#070b13] text-slate-350 flex flex-col justify-start py-10 px-4 relative overflow-hidden">
            {/* Ambient Background Watermark image */}
            <div 
                className="absolute inset-0 bg-[length:100%_auto] bg-top bg-no-repeat filter blur-[4px] opacity-[0.05] pointer-events-none z-0" 
                style={{ backgroundImage: "url('/mnnit_campus.png')" }} 
            />
            {/* Vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070b13] via-[#070b13]/80 to-[#070b13] pointer-events-none z-0" />

            <div className="max-w-5xl w-full mx-auto space-y-8 relative z-10">
                
                {/* Header Welcome banner */}
                <div className="text-left space-y-1">
                    <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest font-mono">
                        Student Dossier Portal
                    </span>
                    <h1 className="text-2xl font-black text-white font-display tracking-tight">
                        Welcome, {user?.name || 'Student'}
                    </h1>
                    <p className="text-xs text-slate-400">Manage transcripts and explore peer ranking statistics.</p>
                </div>

                {!user?.isTranscriptVerified ? (
                    // Unverified Landing Layout (Keep centered, clean)
                    <div className="max-w-md mx-auto p-8 bg-slate-950/80 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl">
                        <div className="flex flex-col items-center">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
                                <ShieldAlert className="h-7 w-7" />
                            </div>
                            <h2 className="text-lg font-bold text-white font-display">Verification Required</h2>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                                Your account is unverified. Please upload your official MNNIT Allahabad transcript to calculate class standings.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/60 text-left">
                            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                                Only official web-generated transcript PDFs are parsed. File integrity signatures will be verified.
                            </p>
                        </div>

                        <Link
                            to="/dashboard/upload"
                            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition font-display cursor-pointer shadow-lg shadow-sky-500/10"
                        >
                            <FileText className="h-4 w-4" />
                            Upload Official Transcript
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    // Redesigned Two-Column Dashboard Layout
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column: Profile dossier cards (5 spans) */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5 shadow-xl text-left">
                                <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Profile Status</span>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-0.5">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Verified MNNIT Profile
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed Data List */}
                                <div className="space-y-3 font-mono text-[10px] text-slate-400">
                                    <div className="flex justify-between border-b border-slate-900 pb-2">
                                        <span>Full Name:</span>
                                        <span className="text-white font-semibold">{user?.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900 pb-2">
                                        <span>Reg Number:</span>
                                        <span className="text-white font-semibold">{user?.rollNumber}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900 pb-2">
                                        <span>Degree Program:</span>
                                        <span className="text-white font-semibold">{user?.program?.code || user?.program}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900 pb-2">
                                        <span>Department:</span>
                                        <span className="text-sky-400 font-semibold">{user?.department?.code || user?.department}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900 pb-2">
                                        <span>Admission:</span>
                                        <span className="text-indigo-400 font-semibold">{user?.batch} Batch</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Current Sem:</span>
                                        <span className="text-white font-semibold">Semester {user?.semester}</span>
                                    </div>
                                </div>

                                <Link
                                    to="/dashboard/upload"
                                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition font-display cursor-pointer"
                                >
                                    <FileText className="h-4 w-4" />
                                    Update Transcript
                                </Link>
                            </div>

                            {/* Semester update reminder banner */}
                            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex gap-3 text-left">
                                <AlertCircle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold text-white font-mono uppercase tracking-wider">Semester Updates</h4>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                                        Please re-upload your transcript after each semester results release to keep your ranks updated.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Statistics panel cards (7 spans) */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* Grid of Large Gauge Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl text-left space-y-3 shadow-lg">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Class Standings</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-sky-400 font-display">
                                            #{user?.classRank || '0'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            / {user?.totalClassStudents || '0'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono leading-tight">
                                        Placement among peers in program.
                                    </p>
                                </div>

                                <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl text-left space-y-3 shadow-lg">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Verified CGPA</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-emerald-400 font-display">
                                            {user?.cgpa?.toFixed(2) || '0.00'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">CPI</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono leading-tight">
                                        Official verified grade index.
                                    </p>
                                </div>
                            </div>

                            {/* Stat Card 1: Rankings Detail Sheet */}
                            <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4 shadow-xl text-left">
                                <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                                    <Award className="h-4.5 w-4.5 text-indigo-400" />
                                    Standings Breakdown
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-1">
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Admissions Batch Rank</span>
                                        <span className="text-xs font-bold text-slate-200">
                                            Rank #{user?.classRank || '0'}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-1">
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Academic Stream</span>
                                        <span className="text-xs font-bold text-slate-200">
                                            {user?.department?.code || 'CSE'} Department
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Main CTA Navigation buttons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    to="/dashboard/leaderboard"
                                    className="p-5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-3xl flex flex-col justify-between items-start gap-4 transition shadow-lg shadow-sky-500/10 text-left font-display cursor-pointer min-h-[110px]"
                                >
                                    <Trophy className="h-5 w-5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs font-bold block">Class Standings</span>
                                        <span className="text-[9px] opacity-80 block font-mono">View rankings and comparisons</span>
                                    </div>
                                </Link>

                                <Link
                                    to="/dashboard/analytics"
                                    className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-3xl flex flex-col justify-between items-start gap-4 transition text-left font-display cursor-pointer min-h-[110px]"
                                >
                                    <TrendingUp className="h-5 w-5 text-sky-400" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs font-bold text-white block">Performance Analytics</span>
                                        <span className="text-[9px] text-slate-450 block font-mono">Graph SPI progression trends</span>
                                    </div>
                                </Link>
                            </div>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default DashboardPlaceholder;
