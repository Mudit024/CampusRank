import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
    Trophy, Medal, Users, GraduationCap, Search, Filter, 
    ArrowLeft, ChevronLeft, ChevronRight, Loader2, Sparkles,
    CheckCircle2, ArrowRight, ShieldAlert, RotateCcw, Award 
} from 'lucide-react';
import apiClient from '../../api/client.js';

// Dependent Dropdown Branches Map
const DEGREE_BRANCH_OPTIONS = {
    "B.Tech": [
        { code: "BT", name: "Bio-Technology" },
        { code: "CH", name: "Chemical Engineering" },
        { code: "CE", name: "Civil Engineering" },
        { code: "CSE", name: "Computer Science & Engineering" },
        { code: "EE", name: "Electrical Engineering" },
        { code: "ECE", name: "Electronics & Communication Engineering" },
        { code: "IT", name: "Information Technology" },
        { code: "ME", name: "Mechanical Engineering" },
        { code: "PI", name: "Production & Industrial Engineering" },
        { code: "ECM", name: "Engineering and Computational Mechanics" },
        { code: "MAT", name: "Materials Engineering" }
    ],
    "MCA": [
        { code: "CA", name: "Computer Science & Engineering" }
    ],
    "MBA": [
        { code: "MS", name: "Management Studies" }
    ],
    "M.Sc": [
        { code: "MA", name: "Mathematics and Scientific Computing" }
    ],
    "M.Tech": [
        { code: "BT", name: "Bio-Technology" },
        { code: "CH", name: "Chemical Engineering" },
        { code: "CE", name: "Civil Engineering" },
        { code: "CSE", name: "Computer Science & Engineering" },
        { code: "EE", name: "Electrical Engineering" },
        { code: "ECE", name: "Electronics & Communication Engineering" },
        { code: "IT", name: "Information Technology" },
        { code: "ME", name: "Mechanical Engineering" },
        { code: "PI", name: "Production & Industrial Engineering" },
        { code: "ECM", name: "Engineering and Computational Mechanics" },
        { code: "MAT", name: "Materials Engineering" }
    ]
};

const Leaderboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // Leaderboard data lists
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRanks, setMyRanks] = useState(null);
    const [totalStudentsCount, setTotalStudentsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Pagination & General filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [batch, setBatch] = useState("");

    // Selected dropdown strings
    const [selectedDegree, setSelectedDegree] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");

    // Full collections from DB to lookup corresponding Mongo ObjectIds
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);

    // Fetch filters catalog first
    useEffect(() => {
        const loadInitialCatalogs = async () => {
            try {
                const response = await apiClient.get('/leaderboard', { params: { limit: 1 } });
                const { filters } = response.data.data;
                setDepartments(filters.departments || []);
                setPrograms(filters.programs || []);
            } catch (e) {
                console.error("Failed to load filters catalog lists:", e);
            }
        };
        loadInitialCatalogs();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            let programId = undefined;
            let departmentId = undefined;

            // Resolve program code depending on user selection
            if (selectedDegree) {
                let lookupProgCode = selectedDegree.toUpperCase(); // MCA / MBA
                if (selectedDegree === "M.Sc") {
                    lookupProgCode = "M.SC-MA";
                }
                // B.Tech / M.Tech codes incorporate the branch (e.g. B.TECH-CSE)
                if ((selectedDegree === "B.Tech" || selectedDegree === "M.Tech") && selectedBranch) {
                    lookupProgCode = `${selectedDegree.toUpperCase()}-${selectedBranch}`;
                }

                const matchedProg = programs.find(p => p.code === lookupProgCode);
                if (matchedProg) {
                    programId = matchedProg._id;
                }
            }

            // Resolve department code
            if (selectedBranch) {
                const matchedDept = departments.find(d => d.code === selectedBranch);
                if (matchedDept) {
                    departmentId = matchedDept._id;
                }
            }

            const params = {
                page,
                limit: 15,
                search: search.trim() || undefined,
                batch: batch || undefined,
                program: programId,
                department: departmentId
            };

            const response = await apiClient.get('/leaderboard', { params });
            const { leaderboard: list, pagination, myRanks: ranks } = response.data.data;

            setLeaderboard(list);
            setMyRanks(ranks);
            setTotalPages(pagination.pages);
            setTotalStudentsCount(pagination.total || list.length);
        } catch (error) {
            toast.error("Failed to load standings leaderboard.");
        } finally {
            setLoading(false);
        }
    };

    // Reload standings when dependencies update
    useEffect(() => {
        if (departments.length > 0 && programs.length > 0) {
            fetchLeaderboard();
        }
    }, [page, batch, selectedDegree, selectedBranch, departments, programs]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLeaderboard();
    };

    const handleClearFilters = () => {
        setSearch("");
        setBatch("");
        setSelectedDegree("");
        setSelectedBranch("");
        setPage(1);
    };

    // Calculate dynamic percentile standing badge
    const getPercentile = (rank, total) => {
        if (!rank || !total) return null;
        const percentile = ((total - rank + 1) / total) * 100;
        const topPercent = 100 - percentile + (100 / total);
        return topPercent <= 1 ? "Top 1%" : `Top ${Math.round(topPercent)}%`;
    };

    // Top 3 Podium Displays (only active on page 1 of default listings)
    const showPodium = page === 1 && !search && !batch && !selectedDegree && !selectedBranch && leaderboard.length >= 3;
    const podiumStudents = showPodium ? leaderboard.slice(0, 3) : [];
    const tableStudents = showPodium ? leaderboard.slice(3) : leaderboard;

    // Arrange Podium order: [Silver (#2), Gold (#1), Bronze (#3)]
    const arrangedPodium = showPodium ? [
        { ...podiumStudents[1], rank: 2, color: 'text-slate-300', bg: 'bg-slate-400/5', border: 'border-slate-400/20', scale: 0.95 },
        { ...podiumStudents[0], rank: 1, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/30', scale: 1.05 },
        { ...podiumStudents[2], rank: 3, color: 'text-amber-700', bg: 'bg-amber-800/5', border: 'border-amber-800/20', scale: 0.90 }
    ] : [];

    return (
        <div className="min-h-screen bg-[#070b13] py-10 px-4 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(56,189,248,0.05)_0%,transparent_60%)] pointer-events-none" />
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
                                Leaderboard Standings
                                <Sparkles className="h-5 w-5 text-sky-400 animate-pulse" />
                            </h1>
                            <p className="text-xs text-slate-400">Compare SGPA/CGPA records with verified student standings.</p>
                        </div>
                    </div>
                </div>

                {/* Conditional Banner: If User has not uploaded Transcript yet */}
                {!user?.isTranscriptVerified && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-600/5 border border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-4"
                    >
                        <div className="flex items-start gap-4 text-left">
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Join the Standings!</h3>
                                <p className="text-xs text-slate-400 max-w-xl mt-0.5 leading-relaxed">
                                    You are currently in guest view. Upload your verified college transcript to sync your CGPA, unlock class standings, and rank among your batchmates.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/dashboard/upload"
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10 font-display whitespace-nowrap"
                        >
                            Verify Profile
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                )}

                {/* 1. Student Personal Standing Card */}
                {user?.isTranscriptVerified && myRanks && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                    >
                        {/* Branch Rank */}
                        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300 w-full max-w-sm">
                            <div className="absolute top-[-30%] right-[-10%] h-20 w-20 bg-emerald-500/5 rounded-full blur-xl" />
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Class Standing (Branch Rank)</span>
                                <Users className="h-4.5 w-4.5 text-emerald-400" />
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                                <span className="text-3xl font-black text-white font-mono">#{myRanks.department}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Branch: {user?.department?.code}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. Visual Top-3 Podium Display */}
                {showPodium && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col md:flex-row justify-center items-end gap-6 py-6"
                    >
                        {arrangedPodium.map((student, idx) => (
                            <motion.div
                                key={student._id}
                                style={{ scale: student.scale }}
                                className={`w-full md:w-72 glass-card rounded-3xl p-6 flex flex-col items-center justify-between relative overflow-hidden border ${student.border} ${student.bg} shadow-lg space-y-4`}
                            >
                                {/* Position Banner */}
                                <div className="absolute top-3 left-3 h-7 w-7 rounded-full bg-[#0a0f1d] border border-[rgba(255,255,255,0.06)] flex items-center justify-center font-bold text-xs text-white">
                                    #{student.rank}
                                </div>

                                {/* Rank Trophy Icon */}
                                <div className="flex flex-col items-center">
                                    <div className={`p-4 bg-[#0c1222] rounded-2xl border border-[rgba(255,255,255,0.04)] ${student.color} mb-2`}>
                                        {student.rank === 1 ? <Trophy className="h-8 w-8 text-amber-400" /> : <Award className="h-8 w-8" />}
                                    </div>
                                    <h3 className="text-sm font-bold text-white text-center truncate max-w-[180px]">
                                        {student.name}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 tracking-wider font-mono">{student.rollNumber}</span>
                                </div>

                                {/* Visual Standing Metrics */}
                                <div className="w-full bg-[#080d1a]/60 border border-[rgba(255,255,255,0.03)] rounded-2xl p-3 text-center">
                                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Verified CPI</span>
                                    <span className="text-xl font-black text-white font-mono mt-0.5 block tracking-tight">
                                        {student.cgpa?.toFixed(2) || '0.00'}
                                    </span>
                                </div>

                                {/* Program badge */}
                                <div className="flex items-center gap-1.5 text-[9px] bg-slate-900 border border-slate-800/40 text-slate-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider font-display">
                                    <span>{student.program?.code || 'MCA'}</span>
                                    <span className="text-slate-700">•</span>
                                    <span>{student.department?.code || 'CA'}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* 3. Dependent Filters Panel */}
                <div className="glass-card rounded-2xl p-4.5">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                <Search className="h-4 w-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name or registration number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
                            />
                        </div>

                        {/* Dependent Filters Group */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* 1. Batch Filter */}
                            <select
                                value={batch}
                                onChange={(e) => { setBatch(e.target.value); setPage(1); }}
                                className="px-3 py-2.5 rounded-xl glass-input text-xs cursor-pointer focus:outline-none"
                            >
                                <option value="" className="bg-[#070b13]">All Batches</option>
                                <option value="2026" className="bg-[#070b13]">Batch 2026</option>
                                <option value="2025" className="bg-[#070b13]">Batch 2025</option>
                                <option value="2024" className="bg-[#070b13]">Batch 2024</option>
                                <option value="2023" className="bg-[#070b13]">Batch 2023</option>
                            </select>

                            {/* 2. Degree Filter (Master list) */}
                            <select
                                value={selectedDegree}
                                onChange={(e) => { 
                                    setSelectedDegree(e.target.value); 
                                    setSelectedBranch(""); // Reset branch when degree is changed!
                                    setPage(1); 
                                }}
                                className="px-3 py-2.5 rounded-xl glass-input text-xs cursor-pointer focus:outline-none"
                            >
                                <option value="" className="bg-[#070b13]">All Degrees</option>
                                <option value="B.Tech" className="bg-[#070b13]">B.Tech.</option>
                                <option value="MCA" className="bg-[#070b13]">MCA</option>
                                <option value="MBA" className="bg-[#070b13]">MBA</option>
                                <option value="M.Sc" className="bg-[#070b13]">M.Sc.</option>
                                <option value="M.Tech" className="bg-[#070b13]">M.Tech.</option>
                            </select>

                            {/* 3. Dependent Branch Filter (Populated dynamically) */}
                            <select
                                value={selectedBranch}
                                onChange={(e) => { setSelectedBranch(e.target.value); setPage(1); }}
                                disabled={!selectedDegree}
                                className="px-3 py-2.5 rounded-xl glass-input text-xs cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="" className="bg-[#070b13]">
                                    {!selectedDegree ? "Select Degree First" : "All Branches"}
                                </option>
                                {selectedDegree && DEGREE_BRANCH_OPTIONS[selectedDegree]?.map(b => (
                                    <option key={b.code} value={b.code} className="bg-[#070b13]">{b.name}</option>
                                ))}
                            </select>

                            {/* Action Buttons */}
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-xs transition duration-200 cursor-pointer"
                            >
                                Apply
                            </button>

                            {(search || batch || selectedDegree || selectedBranch) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:text-white text-slate-400 rounded-xl transition duration-200 cursor-pointer"
                                    title="Reset filters"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 4. Leaderboard Standings Table */}
                <div className="glass-card rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.04)] shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                    <th className="py-4.5 px-6 text-center w-20">Rank</th>
                                    <th className="py-4.5 px-4">Student</th>
                                    <th className="py-4.5 px-4">Registration No</th>
                                    <th className="py-4.5 px-4">Degree</th>
                                    <th className="py-4.5 px-4 text-center">Batch</th>
                                    <th className="py-4.5 px-4 text-center">Semester</th>
                                    <th className="py-4.5 px-6 text-right">CPI</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-2.5 text-slate-400">
                                                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                                                    <span className="text-xs">Fetching standings catalog...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : tableStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-20 text-center text-slate-400 text-xs">
                                                No verified student standings found matching the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        tableStudents.map((row, idx) => {
                                            const isMe = row.rollNumber === user?.rollNumber;
                                            return (
                                                <motion.tr 
                                                    key={row._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className={`border-b border-[rgba(255,255,255,0.02)] text-xs text-slate-300 hover:bg-[rgba(255,255,255,0.01)] transition-all ${
                                                        isMe ? 'bg-sky-500/5 font-semibold text-white border-y border-sky-500/20' : ''
                                                    }`}
                                                >
                                                    {/* Rank numbers */}
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="flex justify-center">
                                                            {row.collegeRank === 1 ? (
                                                                <span className="h-5.5 w-5.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold text-[10px]">1</span>
                                                            ) : row.collegeRank === 2 ? (
                                                                <span className="h-5.5 w-5.5 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-300 flex items-center justify-center font-bold text-[10px]">2</span>
                                                            ) : row.collegeRank === 3 ? (
                                                                <span className="h-5.5 w-5.5 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-700 flex items-center justify-center font-bold text-[10px]">3</span>
                                                            ) : (
                                                                <span className="text-slate-400 font-semibold font-mono text-[10px]">#{row.collegeRank}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Name */}
                                                    <td className="py-4 px-4 font-semibold text-white">
                                                        <div className="flex items-center gap-1.5">
                                                            {row.name}
                                                            {isMe && <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">Me</span>}
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Roll No */}
                                                    <td className="py-4 px-4 font-mono font-medium text-slate-400">{row.rollNumber}</td>
                                                    
                                                    {/* Course / Program details */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-white">{row.program?.code || 'MCA'}</span>
                                                            <span className="text-[10px] text-slate-500 font-medium">({row.department?.code || 'CA'})</span>
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Batch */}
                                                    <td className="py-4 px-4 text-center text-slate-400">{row.batch}</td>
                                                    
                                                    {/* Semester */}
                                                    <td className="py-4 px-4 text-center text-slate-400">Sem {row.semester}</td>
                                                    
                                                    {/* CGPA */}
                                                    <td className="py-4 px-6 text-right font-bold text-white font-mono">
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">{row.cgpa?.toFixed(2) || '0.00'}</span>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-between items-center py-4 px-6 bg-[rgba(255,255,255,0.01)] border-t border-[rgba(255,255,255,0.03)]">
                            <span className="text-[10px] text-slate-500 font-medium">Page {page} of {totalPages}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/20"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/20"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
