import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
    LogOut, CheckCircle2, AlertCircle, FileText, ArrowRight, 
    ShieldAlert, Trophy, TrendingUp, Sparkles, GraduationCap, 
    Award, ShieldCheck, Loader2
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
        <div className="min-h-screen bg-[#060a12] text-slate-300 relative overflow-hidden flex flex-col justify-start py-10 px-4">
            {/* Blurred Campus Watermark background overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-[8px] scale-105 opacity-[0.06] pointer-events-none z-0" 
                style={{ backgroundImage: "url('/mnnit_campus.png')" }} 
            />
            {/* Vignette dark overlay shroud */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#060a12] via-[#060a12]/80 to-[#060a12] pointer-events-none z-0" />

            <div className="max-w-xl w-full mx-auto space-y-6 relative z-10">
                {/* Dashboard Intro Header */}
                <div className="text-left space-y-1">
                    <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider font-mono">
                        Student Dossier Portal
                    </span>
                    <h1 className="text-xl font-bold text-white font-display">
                        Welcome back, {user?.name || 'Student'}
                    </h1>
                </div>

                <div className="space-y-6">
                    {!user?.isTranscriptVerified ? (
                        // Unverified Landing Area
                        <div className="p-6 bg-[#0a0f1d]/50 backdrop-blur-sm border border-amber-500/10 rounded-3xl text-center space-y-5">
                            <div className="flex flex-col items-center">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-400 mb-3 animate-pulse">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <h2 className="text-base font-bold text-white">Verification Required</h2>
                                <p className="text-[11px] text-slate-400 mt-1">Upload your official transcript to access ranks & standings.</p>
                            </div>
                            <div className="p-4 bg-[#060a12]/80 rounded-2xl border border-slate-800/40 text-left">
                                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                                    Upload your official transcript PDF. Our parser will check file signatures and extract your academic history.
                                </p>
                            </div>
                            <Link
                                  to="/dashboard/upload"
                                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all font-display cursor-pointer"
                            >
                                <FileText className="h-4 w-4" />
                                Upload Transcript
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        // Verified Student Dossier Layout
                        <div className="p-6 bg-[#0a0f1d]/55 backdrop-blur-sm border border-emerald-500/15 rounded-3xl space-y-6 relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Dossier Status</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-0.5">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Verified Profile
                                    </span>
                                </div>
                                
                                {/* Circular CGPA Display Ring */}
                                <div className="h-16 w-16 rounded-full border-[3px] border-emerald-500/20 bg-[#060a12] flex flex-col items-center justify-center shadow-lg shadow-emerald-500/5 relative shrink-0">
                                    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono block leading-none">CPI</span>
                                    <span className="text-white text-xs font-black block mt-0.5 leading-none">{user?.cgpa?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>

                            {/* Academic Metadata Sheet */}
                            <div className="space-y-3 font-mono text-[11px] text-slate-400">
                                <div className="flex justify-between border-b border-slate-800/40 pb-2">
                                    <span>Full Name:</span>
                                    <span className="text-white font-semibold">{user?.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/40 pb-2">
                                    <span>Registration:</span>
                                    <span className="text-white font-semibold">{user?.rollNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/40 pb-2">
                                    <span>Branch/Dept:</span>
                                    <span className="text-sky-400 font-semibold">{user?.department?.code}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/40 pb-2">
                                    <span>Program/Deg:</span>
                                    <span className="text-white font-semibold">{user?.program?.code}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800/40 pb-2">
                                    <span>Admission:</span>
                                    <span className="text-indigo-400 font-semibold">{user?.batch} Batch</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Active Semester:</span>
                                    <span className="text-white font-semibold">Semester {user?.semester}</span>
                                </div>
                            </div>

                            {/* Local CTA Links */}
                            <div className="flex flex-col gap-2 pt-2">
                                <Link
                                    to="/dashboard/leaderboard"
                                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-sky-500/5 font-display cursor-pointer"
                                >
                                    <Trophy className="h-4 w-4" />
                                    View Class Standings
                                </Link>
                                <Link
                                    to="/dashboard/analytics"
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-sky-400 hover:text-sky-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition font-display cursor-pointer"
                                >
                                    <TrendingUp className="h-4 w-4" />
                                    Performance Analytics
                                </Link>
                            </div>

                            {/* Re-upload Trigger & Semester Update Note */}
                            <div className="border-t border-slate-800/40 pt-4 mt-2 space-y-3">
                                <div className="p-3.5 bg-[#060a12] rounded-2xl border border-slate-800/60 text-left">
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono flex items-start gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                                        <span>
                                            <strong>Note:</strong> After every semester result, please re-upload your transcript to get updated rankings and analytics.
                                        </span>
                                    </p>
                                </div>
                                <Link
                                    to="/dashboard/upload"
                                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-sky-450 hover:text-sky-350 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition font-display cursor-pointer"
                                >
                                    <FileText className="h-4 w-4" />
                                    Re-upload Transcript
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPlaceholder;
