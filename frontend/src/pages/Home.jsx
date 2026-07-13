import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Trophy, TrendingUp, ShieldCheck, ShieldAlert,
    ArrowRight, GraduationCap, Users, BookOpen, Clock, FileText
} from 'lucide-react';

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const isAuthenticated = !!user;
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#060a12] text-slate-300 relative overflow-hidden flex flex-col justify-between">
            {/* Cinematic MNNIT Campus Background Overlay */}
            <div 
                className="absolute inset-0 bg-[length:100%_auto] bg-top bg-no-repeat opacity-[0.25] pointer-events-none z-0" 
                style={{ backgroundImage: "url('/mnnit_campus.png')" }} 
            />
            {/* Vignette dark overlay shroud */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#060a12]/30 via-[#060a12]/75 to-[#060a12] pointer-events-none z-0" />

            {/* Main Hero & Content Container */}
            <div className="relative z-10 flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-4 py-16 md:py-24 text-center space-y-16">
                
                {/* Hero Headers */}
                <div className="space-y-6 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-widest font-mono shadow-lg"
                    >
                        <GraduationCap className="h-4 w-4 text-sky-400" />
                        Motilal Nehru National Institute of Technology Allahabad
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-display"
                    >
                        Academic standings, ranks & analytics{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-300">
                            portal for students
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto"
                    >
                        Upload your official web-generated transcript to parse academic summaries. Securely evaluate your CPI standings, check absolute ranks within department cohorts, and visualize progress trends.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="max-w-xl mx-auto p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-[10px] text-amber-400 font-mono leading-relaxed text-left flex items-start gap-2 shadow-lg"
                    >
                        <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                            <strong>Privacy Notice:</strong> This data is public and your CPI can be viewed by other students on the standings leaderboard. If you are willing to make this information public, only then proceed to verify and update your profile transcript.
                        </span>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-4"
                    >
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-sky-500/10 font-display cursor-pointer"
                            >
                                Enter Ranks Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-500/10 font-display cursor-pointer"
                                >
                                    Verify with College Mail
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                                >
                                    Access Profile
                                </Link>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Structured Portal Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left pt-6">
                    {/* Column 1 */}
                    <div className="p-6 bg-[#0a0f1d]/50 backdrop-blur-sm border border-slate-800/40 rounded-3xl space-y-3 hover:border-slate-800 transition">
                        <div className="h-10 w-10 rounded-xl bg-sky-500/5 border border-sky-500/10 flex items-center justify-center text-sky-400">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Standings Leaderboards</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            View absolute rank standings across your admission batch, department branches, and program cohorts computed securely using verified CPI details.
                        </p>
                    </div>

                    {/* Column 2 */}
                    <div className="p-6 bg-[#0a0f1d]/50 backdrop-blur-sm border border-slate-800/40 rounded-3xl space-y-3 hover:border-slate-800 transition">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white">GPA Trend Graphing</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Plot term-by-term SPI results directly against university averages. Run comparison sweeps by inputting registration numbers side-by-side.
                        </p>
                    </div>

                    {/* Column 3 */}
                    <div className="p-6 bg-[#0a0f1d]/50 backdrop-blur-sm border border-slate-800/40 rounded-3xl space-y-3 hover:border-slate-800 transition">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Secure PDF Parser</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Upload your official web-generated transcript directly. Our parser extracts GPAs and metadata instantly without manual entries.
                        </p>
                    </div>

                    {/* Column 4 */}
                    <div className="p-6 bg-[#0a0f1d]/50 backdrop-blur-sm border border-slate-800/40 rounded-3xl space-y-3 hover:border-slate-800 transition">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white">Campus Exclusivity</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Restricts student signups and standings exclusively to official college emails (@mnnit.ac.in) for authenticated leaderboards.
                        </p>
                    </div>
                </div>

                {/* MNNIT Campus supported degrees grid */}
                <div className="border-t border-slate-800/40 pt-10 text-center space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono block">
                        Supported MNNIT Programs & Branches
                    </span>
                    <div className="flex flex-wrap justify-center items-center gap-3 text-[10px] font-semibold text-slate-400">
                        <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">B.Tech (B.Technology)</span>
                        <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">MCA (Computer Applications)</span>
                        <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">MBA (Management Studies)</span>
                        <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">M.Tech (Master of Technology)</span>
                        <span className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">M.Sc (Scientific Computing)</span>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800/40 py-6 text-center text-[10px] text-slate-500 relative z-10 bg-[#060a12]/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span>© {new Date().getFullYear()} CampusRank. Built for MNNIT Allahabad. All rights reserved.</span>
                    <span className="flex items-center gap-1.5 font-mono">
                        <BookOpen className="h-3 w-3" />
                        Campus Exclusivity Restricted
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Home;
