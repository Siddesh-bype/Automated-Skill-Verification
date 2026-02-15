import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_wallet', data.user.wallet_address);
                enqueueSnackbar('Login successful!', { variant: 'success' });
                navigate('/');
            } else {
                enqueueSnackbar(data.error || 'Login failed', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Network error', { variant: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
            <div className="card-workspace max-w-md w-full p-8 border-surface-700/60 bg-surface-900/50 backdrop-blur-xl">
                <h2 className="text-3xl font-bold text-center mb-6 text-surface-50">Welcome Back</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full btn-primary-workspace py-3 rounded-lg font-semibold text-lg"
                    >
                        Log In
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-surface-900 text-surface-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => window.location.href = 'http://localhost:3001/api/auth/google'}
                            className="w-full inline-flex justify-center py-2 px-4 border border-surface-700 rounded-md shadow-sm bg-surface-800 text-sm font-medium text-surface-200 hover:bg-surface-700 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="ml-2">Google</span>
                        </button>
                        <button
                            onClick={() => window.location.href = 'http://localhost:3001/api/auth/github'}
                            className="w-full inline-flex justify-center py-2 px-4 border border-surface-700 rounded-md shadow-sm bg-surface-800 text-sm font-medium text-surface-200 hover:bg-surface-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2">GitHub</span>
                        </button>
                    </div>
                </div>
                <p className="mt-6 text-center text-surface-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
