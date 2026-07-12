import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Award, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client.js';
import { loginSuccess } from '../../redux/slices/authSlice.js';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        // Enforce college domain on the client side
        if (!data.email.toLowerCase().endsWith("@mnnit.ac.in")) {
            toast.error("Registration is restricted to official college emails (@mnnit.ac.in) only.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Creating your CampusRank account...");
        
        try {
            const response = await apiClient.post('/auth/register', data);
            
            toast.success(response.data.message || "Registration successful! Welcome to CampusRank.", { id: toastId });
            
            // Log the user in directly (bypass OTP verification)
            const { user } = response.data.data;
            dispatch(loginSuccess(user));
            
            // Redirect straight to dashboard home
            navigate('/dashboard');
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,189,248,0.06)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(192,132,252,0.06)_0%,transparent_60%)] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass-card rounded-3xl p-8 shadow-2xl relative">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-sky-500/20">
                            <Award className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
                        <p className="text-xs text-slate-400 mt-1">Get verified rankings with your official email.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        
                        {/* Name Field */}
                        <div className="space-y-1.5">
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
                        <div className="space-y-1.5">
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
                        <div className="space-y-1.5">
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
                    </form>

                    <div className="mt-8 text-center text-[10px] text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
