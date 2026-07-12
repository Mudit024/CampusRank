import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldAlert } from 'lucide-react';
import { logoutSuccess } from '../../redux/slices/authSlice.js';
import apiClient from '../../api/client.js';
import toast from 'react-hot-toast';

const DashboardPlaceholder = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                
                {/* 1. Unverified State View */}
                {!user?.isTranscriptVerified ? (
                    <div className="text-center space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 mb-4">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white font-display">Verify Profile</h2>
                            <p className="text-xs text-slate-400 mt-1">Unlock standings by uploading your transcript.</p>
                        </div>

                        <div className="p-4 bg-[#0a0f1d] rounded-2xl border border-[rgba(255,255,255,0.04)] text-left space-y-2">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                To protect ranks integrity, you must upload your official MNNIT transcript PDF. Our parser will extract your GPA and link it to the leaderboard standings.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                to="/dashboard/upload"
                                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all duration-300 shadow-md shadow-sky-500/10 hover:shadow-sky-400/20 flex items-center justify-center gap-1.5 cursor-pointer font-display"
                            >
                                <FileText className="h-4.5 w-4.5" />
                                Upload Transcript PDF
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-slate-800/40"
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </button>
                        </div>
                    </div>
                ) : (
                    // 2. Verified State View
                    <div className="text-center space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-4 animate-pulse">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-white font-display">Transcript Verified!</h2>
                            <p className="text-xs text-slate-400 mt-1">Your academic profile is actively synced.</p>
                        </div>

                        <div className="p-4 bg-[#0a0f1d] rounded-2xl border border-[rgba(255,255,255,0.04)] text-left space-y-2.5">
                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Extracted MNNIT Data</span>
                            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                                <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-1">
                                    <span>Name:</span>
                                    <span className="text-white font-bold">{user?.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-1">
                                    <span>Roll Number:</span>
                                    <span className="text-white font-bold">{user?.rollNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-1">
                                    <span>Department:</span>
                                    <span className="text-sky-400 font-bold">{user?.department?.code || 'MNNIT'}</span>
                                </div>
                                <div className="flex justify-between border-b border-[rgba(255,255,255,0.03)] pb-1">
                                    <span>Batch:</span>
                                    <span className="text-indigo-400 font-bold">{user?.batch}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Semester:</span>
                                    <span className="text-emerald-400 font-bold">Sem {user?.semester}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleLogout}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-slate-800/40"
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPlaceholder;
