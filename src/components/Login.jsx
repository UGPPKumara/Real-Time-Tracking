import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Spinner } from './Spinner';

const LoginView = () => {
    const [email, setEmail] = useState('admin@nuvoora.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code === 'auth/user-not-found' && email === 'admin@nuvoora.com') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                } catch (createError) {
                    setError(`Admin creation failed: ${createError.message}`);
                }
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Location Tracker</h1>
                <p className="text-center text-gray-500 mb-8">Sign in to your account</p>
                {error && <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-600 mb-2">Email</label>
                        <input type="email" id="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-600 mb-2">Password</label>
                        <input type="password" id="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center h-10" disabled={loading}>
                        {loading ? <Spinner /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;