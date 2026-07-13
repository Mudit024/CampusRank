import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
    LogOut, CheckCircle2, AlertCircle, FileText, ArrowRight, 
    ShieldAlert, Trophy, TrendingUp, Bell, Sparkles, GraduationCap, 
    Award, ShieldCheck, Check, Loader2, X 
} from 'lucide-react';
import { logoutSuccess, loginSuccess } from '../../redux/slices/authSlice.js';
import apiClient from '../../api/client.js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const IconMap = {
    Trophy: <Trophy className="h-6 w-6 text-amber-400" />,
    GraduationCap: <GraduationCap className="h-6 w-6 text-sky-400" />,
    Sparkles: <Sparkles className="h-6 w-6 text-indigo-400" />,
    TrendingUp: <TrendingUp className="h-6 w-6 text-emerald-400" />,
    Award: <Award className="h-6 w-6 text-purple-400" />
};

const DashboardPlaceholder = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Notification Panel state
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);

    // Refresh profile details on mount
    const refreshProfile = async () => {
        try {
            const response = await apiClient.get('/auth/me');
            dispatch(loginSuccess(response.data.data));
        } catch (e) {
            console.error("Failed to refresh profile info:", e);
        }
    };

    // Fetch alerts feed
    const fetchNotifications = async () => {
        if (!user?.isTranscriptVerified) return;
        setNotifLoading(true);
        try {
            const response = await apiClient.get('/notifications');
            setNotifications(response.data.data || []);
        } catch (e) {
            console.error("Failed to load notifications:", e);
        } finally {
            setNotifLoading(false);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    useEffect(() => {
        if (user?.isTranscriptVerified) {
            fetchNotifications();
        }
    }, [user?.isTranscriptVerified]);

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

    const handleMarkAllRead = async () => {
        try {
            await apiClient.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("Cleared notifications count!");
        } catch (e) {
            toast.error("Failed to clear alerts count.");
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-start py-10 px-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(192,132,252,0.04)_0%,transparent_60%)] pointer-events-none" />

            <div className="max-w-4xl w-full space-y-8 relative">
                
                {/* 1. Dashboard Header Section */}
                <div className="flex justify-between items-center bg-[#0a0f1d]/40 backdrop-blur-md rounded-2xl p-4 border border-[rgba(255,255,255,0.03)]">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">MNNIT Allahabad</span>
                            <span className="text-sm font-bold text-white font-display">CampusRank Dashboard</span>
                        </div>
                    </div>

                    {/* Action Panel: Notifications and Logout */}
                    <div className="flex items-center gap-2.5 relative">
                        {user?.isTranscriptVerified && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer border border-slate-800/80 transition relative"
                                >
                                    <Bell className="h-4.5 w-4.5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border border-[#070b13] animate-pulse" />
                                    )}
                                </button>

                                {/* Dropdown panel */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-80 glass-card rounded-2xl shadow-2xl z-50 overflow-hidden border border-[rgba(255,255,255,0.06)]"
                                        >
                                            <div className="p-4 bg-[#0a0f1d] border-b border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                                                <span className="text-xs font-bold text-white">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button 
                                                        onClick={handleMarkAllRead}
                                                        className="text-[10px] text-sky-400 hover:text-sky-300 font-bold cursor-pointer transition flex items-center gap-1"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-64 overflow-y-auto divide-y divide-[rgba(255,255,255,0.02)]">
                                                {notifLoading ? (
                                                    <div className="p-8 text-center text-slate-400 text-xs">
                                                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-sky-400 mb-1" />
                                                        Loading feed...
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-500 text-xs">
                                                        No alerts in your history.
                                                    </div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div key={n._id} className={`p-4 text-left space-y-1 transition-all ${n.isRead ? 'opacity-60' : 'bg-sky-500/5'}`}>
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-xs font-bold text-white">{n.title}</span>
                                                                {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1" />}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <button 
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer border border-slate-800/80 transition"
                            title="Log Out"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>

                {/* 2. Main Dashboard Panel */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                    
                    {/* Left side: Student profile stats summary card */}
                    <div className="md:col-span-2 space-y-6">
                        {!user?.isTranscriptVerified ? (
                            // Unverified view
                            <div className="glass-card rounded-3xl p-6 text-center space-y-5 border border-amber-500/10">
                                <div className="flex flex-col items-center">
                                    <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mb-3">
                                        <ShieldAlert className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white font-display">Verify Transcript</h2>
                                    <p className="text-[11px] text-slate-400 mt-1">Standings and progress maps are locked.</p>
                                </div>
                                <div className="p-3.5 bg-[#0a0f1d] rounded-2xl border border-[rgba(255,255,255,0.03)] text-left">
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        Upload your official MNNIT transcript PDF. Our parser will extract your GPA, class year, and compute your standings ranking in real-time.
                                    </p>
                                </div>
                                <Link
                                    to="/dashboard/upload"
                                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-300 shadow-md shadow-sky-500/10 font-display cursor-pointer"
                                >
                                    <FileText className="h-4 w-4" />
                                    Upload Transcript
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            // Verified profile details card
                            <div className="glass-card rounded-3xl p-6 space-y-6 border border-emerald-500/10 relative overflow-hidden">
                                <div className="absolute top-[-30%] left-[-20%] h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl" />
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-3 animate-pulse">
                                        <ShieldCheck className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white font-display">Transcript Verified</h2>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Welcome back, {user?.name}</p>
                                </div>

                                {/* Extracted details list */}
                                <div className="p-4 bg-[#0a0f1d]/80 rounded-2xl border border-[rgba(255,255,255,0.03)] space-y-2 font-mono text-[11px] text-slate-300">
                                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.02)] pb-1.5">
                                        <span>Roll No:</span>
                                        <span className="text-white font-bold">{user?.rollNumber}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.02)] pb-1.5">
                                        <span>Branch:</span>
                                        <span className="text-sky-400 font-bold">{user?.department?.code}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.02)] pb-1.5">
                                        <span>Program:</span>
                                        <span className="text-white font-bold">{user?.program?.code}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.02)] pb-1.5">
                                        <span>Admission Batch:</span>
                                        <span className="text-indigo-400 font-bold">{user?.batch}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.02)] pb-1.5">
                                        <span>Active Term:</span>
                                        <span className="text-white font-bold">Sem {user?.semester}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span>Overall CPI:</span>
                                        <span className="text-emerald-400 font-extrabold text-sm">{user?.cgpa?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>

                                {/* CTA buttons list */}
                                <div className="flex flex-col gap-2">
                                    <Link
                                        to="/dashboard/leaderboard"
                                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-sky-500/10 font-display cursor-pointer"
                                    >
                                        <Trophy className="h-4 w-4" />
                                        Class Standings
                                    </Link>
                                    <Link
                                        to="/dashboard/analytics"
                                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-sky-400 hover:text-sky-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition font-display cursor-pointer"
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                        Performance Analytics
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side: Unlocked Badges / Achievements list */}
                    <div className="md:col-span-3 space-y-6">
                        <div className="glass-card rounded-3xl p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                <h3 className="text-sm font-bold text-white font-display">Unlocked Achievements</h3>
                            </div>

                            {!user?.isTranscriptVerified ? (
                                <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl">
                                    Upload transcript to unlock academic badge achievements.
                                </div>
                            ) : !user?.achievements || user.achievements.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl space-y-1">
                                    <p className="font-semibold text-white">No badges unlocked yet.</p>
                                    <p className="text-[10px] text-slate-500">Keep scanning term PDFs to qualify for academic milestones!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user.achievements.map((ach, idx) => (
                                        <motion.div
                                            key={`ach-${idx}`}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-4 bg-[#0a0f1d]/85 rounded-2xl border border-[rgba(255,255,255,0.03)] hover:border-amber-500/20 transition-all flex items-start gap-3 relative overflow-hidden group shadow-md"
                                        >
                                            {/* Glowing light badge behind icon */}
                                            <div className="absolute top-[-20%] right-[-10%] h-12 w-12 bg-amber-500/5 rounded-full blur-lg group-hover:bg-amber-500/10 transition" />
                                            
                                            {/* Icon holder */}
                                            <div className="p-3 bg-[#070b13] rounded-xl border border-[rgba(255,255,255,0.04)] text-amber-400 flex items-center justify-center shrink-0">
                                                {IconMap[ach.icon] || <Trophy className="h-6 w-6 text-amber-400" />}
                                            </div>
                                            
                                            {/* Details text */}
                                            <div className="text-left space-y-0.5">
                                                <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                                                <p className="text-[10px] text-slate-400 leading-relaxed">{ach.description}</p>
                                                <span className="block text-[8px] text-slate-500 font-mono pt-1">
                                                    Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPlaceholder;
