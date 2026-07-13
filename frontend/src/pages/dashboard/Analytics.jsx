import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
    TrendingUp, ArrowLeft, Search, Users, Sparkles, Loader2, 
    FileText, User, GraduationCap, BarChart2, ShieldAlert
} from 'lucide-react';
import apiClient from '../../api/client.js';

const Analytics = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // Tab states: 'progress' (My Performance) or 'compare' (Compare Students)
    const [activeTab, setActiveTab] = useState('progress');
    
    // Performance state variables
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Peer comparison state variables
    const [targetRoll, setTargetRoll] = useState("");
    const [comparisonData, setComparisonData] = useState(null);
    const [compareLoading, setCompareLoading] = useState(false);

    // Fetch personal performance stats
    const fetchPersonalAnalytics = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/analytics');
            setAnalyticsData(response.data.data);
        } catch (error) {
            toast.error("Failed to load academic analytics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.isTranscriptVerified) {
            fetchPersonalAnalytics();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleCompareSubmit = async (e) => {
        e.preventDefault();
        if (!targetRoll.trim()) {
            return toast.error("Please enter a valid peer roll number.");
        }
        setCompareLoading(true);
        setComparisonData(null);
        try {
            const response = await apiClient.get('/analytics/compare', {
                params: { rollNumber: targetRoll.trim() }
            });
            setComparisonData(response.data.data);
            toast.success("Comparison profile loaded!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to find comparison student.");
        } finally {
            setCompareLoading(false);
        }
    };

    // Prepares benchmarking dataset
    const benchmarkDataset = analyticsData ? [
        { name: 'Your CGPA', gpa: user?.cgpa || 0, fill: '#38bdf8' },
        { name: 'Program Avg', gpa: analyticsData.averages.program, fill: '#6366f1' },
        { name: 'Branch Avg', gpa: analyticsData.averages.department, fill: '#10b981' },
        { name: 'College Avg', gpa: analyticsData.averages.college, fill: '#a855f7' }
    ] : [];

    // Prepares comparative line chart dataset
    const getComparisonChartData = () => {
        if (!comparisonData) return [];
        const maxSems = Math.max(
            comparisonData.studentA.history.length,
            comparisonData.studentB.history.length
        );
        const data = [];
        for (let i = 1; i <= maxSems; i++) {
            const semA = comparisonData.studentA.history.find(h => h.semester === i);
            const semB = comparisonData.studentB.history.find(h => h.semester === i);
            data.push({
                semester: `Sem ${i}`,
                [comparisonData.studentA.name]: semA ? semA.sgpa : null,
                [comparisonData.studentB.name]: semB ? semB.sgpa : null
            });
        }
        return data;
    };

    return (
        <div className="min-h-screen bg-[#070b13] py-10 px-4 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(56,189,248,0.04)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(192,132,252,0.04)_0%,transparent_60%)] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-8 relative">
                
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer border border-slate-800/60 transition-all duration-200"
                        >
                            <ArrowLeft className="h-4.5 w-4.5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2">
                                Comparative Analytics
                                <TrendingUp className="h-5 w-5 text-sky-400" />
                            </h1>
                            <p className="text-xs text-slate-400">Benchmarking semester progression, averages, and peer records.</p>
                        </div>
                    </div>
                </div>

                {/* Conditional Banner: If User has not uploaded Transcript yet */}
                {!user?.isTranscriptVerified ? (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 to-orange-600/5 border border-amber-500/20 text-center max-w-lg mx-auto space-y-5"
                    >
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 mb-4 animate-pulse">
                                <ShieldAlert className="h-8 w-8" />
                            </div>
                            <h3 className="text-base font-bold text-white font-display">Verify Transcript to Unlock</h3>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mt-1">
                                Performance progression charts and side-by-side peer comparisons are only available after verification. Upload your transcript PDF to proceed.
                            </p>
                        </div>
                        <Link
                            to="/dashboard/upload"
                            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/10 cursor-pointer font-display"
                        >
                            <FileText className="h-4.5 w-4.5" />
                            Upload Transcript
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                ) : (
                    // Verified Dashboard View
                    <div className="space-y-8">
                        {/* Tab Toggle buttons */}
                        <div className="flex border-b border-[rgba(255,255,255,0.06)] gap-6">
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`pb-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 focus:outline-none ${
                                    activeTab === 'progress' 
                                        ? 'text-sky-400 border-b-2 border-sky-400 font-bold' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <BarChart2 className="h-4 w-4" />
                                My Performance
                            </button>
                            <button
                                onClick={() => setActiveTab('compare')}
                                className={`pb-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 focus:outline-none ${
                                    activeTab === 'compare' 
                                        ? 'text-sky-400 border-b-2 border-sky-400 font-bold' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                Peer Comparison
                            </button>
                        </div>

                        {/* Tabs Container */}
                        <AnimatePresence mode="wait">
                            {/* Tab 1: Progress */}
                            {activeTab === 'progress' && (
                                <motion.div
                                    key="progress"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                                >
                                    {/* Chart 1: Progress Over Semesters */}
                                    <div className="glass-card rounded-3xl p-6 lg:col-span-2 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-sm font-bold text-white font-display">GPA Timeline</h3>
                                                <p className="text-[10px] text-slate-400">Progression of semester SGPA (SPI) vs. CGPA (CPI).</p>
                                            </div>
                                            <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                                Active
                                            </span>
                                        </div>
                                        
                                        {loading ? (
                                            <div className="h-72 flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                                            </div>
                                        ) : analyticsData?.history.length === 0 ? (
                                            <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
                                                No semester records could be fetched.
                                            </div>
                                        ) : (
                                            <div className="h-72 w-full text-xs">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={analyticsData?.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                                        <XAxis dataKey="semester" stroke="#94a3b8" tickFormatter={(v) => `Sem ${v}`} />
                                                        <YAxis stroke="#94a3b8" domain={[0, 10]} />
                                                        <Tooltip 
                                                            contentStyle={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                                                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                        />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="sgpa" name="SGPA (SPI)" stroke="#38bdf8" strokeWidth={3} activeDot={{ r: 6 }} />
                                                        <Line type="monotone" dataKey="cgpa" name="CGPA (CPI)" stroke="#a855f7" strokeWidth={3} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chart 2: Comparative Averages Benchmarking */}
                                    <div className="glass-card rounded-3xl p-6 space-y-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-white font-display">Averages Benchmarking</h3>
                                            <p className="text-[10px] text-slate-400">Comparing your CGPA with college standards.</p>
                                        </div>

                                        {loading ? (
                                            <div className="h-72 flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                                            </div>
                                        ) : (
                                            <div className="h-72 w-full text-xs">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={benchmarkDataset} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                                        <YAxis stroke="#94a3b8" domain={[0, 10]} />
                                                        <Tooltip 
                                                            contentStyle={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                                                            labelFormatter={() => 'Academic Benchmarks'}
                                                        />
                                                        <Bar dataKey="gpa" name="CGPA" radius={[8, 8, 0, 0]}>
                                                            {benchmarkDataset.map((entry, idx) => (
                                                                <rect key={`rect-${idx}`} fill={entry.fill} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab 2: Compare */}
                            {activeTab === 'compare' && (
                                <motion.div
                                    key="compare"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="space-y-6"
                                >
                                    {/* Search Panel */}
                                    <div className="glass-card rounded-2xl p-5">
                                        <form onSubmit={handleCompareSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                                    <Search className="h-4 w-4" />
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="Enter peer's registration number (e.g. 2024CA057)"
                                                    value={targetRoll}
                                                    onChange={(e) => setTargetRoll(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={compareLoading}
                                                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                                            >
                                                {compareLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                Compare Standings
                                            </button>
                                        </form>
                                    </div>

                                    {/* Side-by-Side Comparison details */}
                                    {comparisonData ? (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                                        >
                                            {/* Details Columns */}
                                            <div className="space-y-4">
                                                {/* Student A Details (Me) */}
                                                <div className="glass-card rounded-2xl p-5 border-l-4 border-sky-400 space-y-3">
                                                    <span className="text-[9px] uppercase font-bold tracking-wider text-sky-400">Me</span>
                                                    <h4 className="text-sm font-bold text-white leading-none">{comparisonData.studentA.name}</h4>
                                                    <span className="block text-[10px] text-slate-400 font-mono">{comparisonData.studentA.rollNumber}</span>
                                                    
                                                    <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                                                        <div className="p-2.5 bg-[#0a0f1d] rounded-xl text-center">
                                                            <span className="text-[9px] text-slate-500 block uppercase">Rank</span>
                                                            <span className="text-white font-bold block mt-0.5">#{comparisonData.studentA.rank}</span>
                                                        </div>
                                                        <div className="p-2.5 bg-[#0a0f1d] rounded-xl text-center">
                                                            <span className="text-[9px] text-slate-500 block uppercase">CPI</span>
                                                            <span className="text-sky-400 font-bold block mt-0.5">{comparisonData.studentA.cgpa.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Student B Details (Peer) */}
                                                <div className="glass-card rounded-2xl p-5 border-l-4 border-purple-400 space-y-3">
                                                    <span className="text-[9px] uppercase font-bold tracking-wider text-purple-400">Peer</span>
                                                    <h4 className="text-sm font-bold text-white leading-none">{comparisonData.studentB.name}</h4>
                                                    <span className="block text-[10px] text-slate-400 font-mono">{comparisonData.studentB.rollNumber}</span>
                                                    
                                                    <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                                                        <div className="p-2.5 bg-[#0a0f1d] rounded-xl text-center">
                                                            <span className="text-[9px] text-slate-500 block uppercase">Rank</span>
                                                            <span className="text-white font-bold block mt-0.5">#{comparisonData.studentB.rank}</span>
                                                        </div>
                                                        <div className="p-2.5 bg-[#0a0f1d] rounded-xl text-center">
                                                            <span className="text-[9px] text-slate-500 block uppercase">CPI</span>
                                                            <span className="text-purple-400 font-bold block mt-0.5">{comparisonData.studentB.cgpa.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comparative Line Chart */}
                                            <div className="glass-card rounded-3xl p-6 lg:col-span-2 space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-white font-display">GPA Progression Compare</h3>
                                                    <p className="text-[10px] text-slate-400">Side-by-side progression of SGPA (SPI) across semesters.</p>
                                                </div>

                                                <div className="h-72 w-full text-xs">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={getComparisonChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                                            <XAxis dataKey="semester" stroke="#94a3b8" />
                                                            <YAxis stroke="#94a3b8" domain={[0, 10]} />
                                                            <Tooltip 
                                                                contentStyle={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
                                                            />
                                                            <Legend />
                                                            <Line type="monotone" dataKey={comparisonData.studentA.name} stroke="#38bdf8" strokeWidth={3} activeDot={{ r: 6 }} />
                                                            <Line type="monotone" dataKey={comparisonData.studentB.name} stroke="#c084fc" strokeWidth={3} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="py-16 text-center border border-dashed border-[rgba(255,255,255,0.08)] rounded-3xl text-slate-400 text-xs">
                                            Search a student by roll number to overlay dynamic progress.
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
