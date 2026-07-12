import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone'; // Note: React-dropzone is installed as part of general installs
import toast from 'react-hot-toast';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client.js';
import { updateUser, setTranscriptVerified } from '../../redux/slices/authSlice.js';

const TranscriptUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            toast.success(`${selectedFile.name} selected successfully!`);
        } else {
            toast.error("Please drop an official PDF transcript file.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select or drop a transcript file first.");
            return;
        }

        setUploading(true);
        const toastId = toast.loading("Processing transcript. Parsing GPAs...");

        const formData = new FormData();
        formData.append('transcript', file);

        try {
            const response = await apiClient.post('/transcripts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(response.data.message || "Transcript verified and parsed!", { id: toastId });
            
            const refreshedStudent = response.data.data;
            
            // Sync refreshed student profile to Redux state
            dispatch(updateUser(refreshedStudent));
            dispatch(setTranscriptVerified(true));

            // Redirect back to dashboard panel
            navigate('/dashboard');
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to process transcript. Make sure the name overlaps with your profile.";
            toast.error(errorMsg, { id: toastId, duration: 6000 });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_60%)] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <div className="glass-card rounded-3xl p-8 shadow-2xl space-y-6 relative">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer border border-slate-700/20 transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white font-display">Verify Transcript</h2>
                            <p className="text-xs text-slate-400">Upload your MNNIT transcript PDF to calculate standings.</p>
                        </div>
                    </div>

                    {/* Drag-and-drop zone */}
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                            isDragActive 
                                ? 'border-sky-500 bg-sky-500/5' 
                                : file 
                                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/10'
                        }`}
                    >
                        <input {...getInputProps()} />
                        
                        {file ? (
                            <div className="flex flex-col items-center space-y-3 text-center">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <FileText className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white truncate max-w-xs">{file.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to verify</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-3 text-center">
                                <div className="h-14 w-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                                    <UploadCloud className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">Drag & drop your transcript here</p>
                                    <p className="text-[10px] text-slate-400 mt-1">or click to browse files (PDF only)</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Information alert card */}
                    <div className="p-4 bg-[#0a0f1d] rounded-2xl border border-[rgba(255,255,255,0.03)] flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Verification Rules</span>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                The name on the document must overlap with your registered profile name. Duplicate files or uploads from other student profiles will trigger integrity check failures.
                            </p>
                        </div>
                    </div>

                    {/* Upload Actions */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || !file}
                        className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all duration-300 shadow-lg shadow-sky-500/10 hover:shadow-sky-400/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                Analyzing Document...
                            </>
                        ) : (
                            <>
                                Verify Academic Record
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TranscriptUpload;
