import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Award, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import apiClient from '../../api/client.js';
import { loginSuccess } from '../../redux/slices/authSlice.js';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Timer cooldown loop for resending OTP codes
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Google Identity Services Loader
    useEffect(() => {
        const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientID) return;

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: clientID,
                    callback: handleGoogleResponse
                });

                window.google.accounts.id.renderButton(
                    document.getElementById('google-signup-btn'),
                    { 
                        theme: 'outline', 
                        size: 'large', 
                        width: 320,
                        text: 'signup_with',
                        shape: 'pill'
                    }
                );
            }
        };

        return () => {
            try {
                document.body.removeChild(script);
            } catch (e) {
                // Ignore removal failure
            }
        };
    }, []);

    // Handle Google JWT Token response
    const handleGoogleResponse = async (response) => {
        setLoading(true);
        const toastId = toast.loading("Authenticating via Google...");
        try {
            const apiRes = await apiClient.post('/auth/google-login', {
                idToken: response.credential
            });
            toast.success("Successfully logged in with Google!", { id: toastId });
            dispatch(loginSuccess(apiRes.data.data.user));
            navigate('/');
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Google Authentication failed.";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    });

    // Step 1: Submit signup registration details
    const onSubmit = async (data) => {
        if (!data.email.toLowerCase().endsWith("@mnnit.ac.in")) {
            toast.error("Registration is restricted to official college emails (@mnnit.ac.in) only.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Sending account verification OTP...");
        
        try {
            const response = await apiClient.post('/auth/register', data);
            toast.success(response.data.message || "OTP code sent to email!", { id: toastId });
            setRegisteredEmail(data.email);
            setOtpSent(true);
            setResendCooldown(60); // 60s resend cooldown
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP code
    const onVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.trim().length !== 6) {
            toast.error("Please enter a valid 6-digit OTP code.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Verifying registration OTP code...");

        try {
            const response = await apiClient.post('/auth/verify-otp', {
                email: registeredEmail,
                otp: otpCode.trim()
            });

            toast.success("Account successfully verified! Welcome to CampusRank.", { id: toastId });
            dispatch(loginSuccess(response.data.data.user));
            navigate('/');
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Verification failed. Check code.";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP code
    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        const toastId = toast.loading("Resending verification code...");
        try {
            await apiClient.post('/auth/resend-otp', { email: registeredEmail });
            toast.success("A new verification code has been sent!", { id: toastId });
            setResendCooldown(60);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to resend code.";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Background grids */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(192,132,252,0.06)_0%,transparent_60%)] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-card rounded-3xl p-8 shadow-2xl relative bg-[#0a0f1d]/50 backdrop-blur-sm border border-slate-800/40">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-sky-500/20">
                            <Award className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                            {otpSent ? "Verify Email" : "Create Account"}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {otpSent ? "Enter the 6-digit code sent to your MNNIT inbox" : "Get verified rankings with your official email."}
                        </p>
                    </div>

                    {!otpSent ? (
                        /* Registration Form */
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Name Field */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                                        <User className="h-4.5 w-4.5" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-xs"
                                        {...register('name', { required: 'Name is required' })}
                                    />
                                </div>
                                {errors.name && <p className="text-[10px] text-rose-400">{errors.name.message}</p>}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">College Email (@mnnit.ac.in)</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                                        <Mail className="h-4.5 w-4.5" />
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="yourname@mnnit.ac.in"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-xs"
                                        {...register('email', { 
                                            required: 'College email is required',
                                            pattern: {
                                                value: /^[a-zA-Z0-9._%+-]+@mnnit\.ac\.in$/,
                                                message: 'Must be an official @mnnit.ac.in email address'
                                            }
                                        })}
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] text-rose-400">{errors.email.message}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5 text-left">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                                        <Lock className="h-4.5 w-4.5" />
                                    </span>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-xs"
                                        {...register('password', { 
                                            required: 'Password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                        })}
                                    />
                                </div>
                                {errors.password && <p className="text-[10px] text-rose-400">{errors.password.message}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all duration-300 shadow-md shadow-sky-500/10 hover:shadow-sky-400/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Sign Up
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            {/* Google Auth Divider */}
                            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                                <>
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="h-[1px] bg-slate-800 flex-1" />
                                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">or signup with</span>
                                        <div className="h-[1px] bg-slate-800 flex-1" />
                                    </div>

                                    {/* Google Login Trigger container */}
                                    <div id="google-signup-btn" className="w-full overflow-hidden flex justify-center text-xs" />
                                </>
                            )}
                        </form>
                    ) : (
                        /* OTP Verification View */
                        <form onSubmit={onVerifyOTP} className="space-y-6">
                            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-850 text-left font-mono text-[10px] text-slate-405 leading-normal">
                                <span>Code dispatched to: </span>
                                <strong className="text-white block mt-0.5">{registeredEmail}</strong>
                                <span className="block mt-2 text-sky-400">💡 Tip: For local testing, check your backend server console logs for the OTP code!</span>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">6-Digit Verification Code</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="000000"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center tracking-widest text-lg font-bold py-3 rounded-xl glass-input placeholder:opacity-30 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otpCode.length !== 6}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Verify & Login
                                        <ShieldCheck className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-between text-[10px] pt-1">
                                <button
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="text-slate-450 hover:text-white flex items-center gap-1 transition"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Go Back
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendCooldown > 0}
                                    className="text-sky-400 hover:text-sky-300 disabled:text-slate-500 flex items-center gap-1 transition disabled:cursor-not-allowed font-semibold"
                                >
                                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                </button>
                            </div>
                        </form>
                    )}

                    {!otpSent && (
                        <div className="mt-8 text-center text-[10px] text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
