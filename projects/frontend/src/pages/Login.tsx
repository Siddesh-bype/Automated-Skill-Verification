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
