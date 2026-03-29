import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) { setError('Plotëso të gjitha fushat'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/auth/login', { username, password });
            login(res.data);
            if (res.data.role === 'cashier') {
                navigate('/pos', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Gabim gjatë hyrjes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">M</div>
                <h1 className="login-title">Marketi SHPK</h1>
                <p className="login-subtitle">Sistemi i Kasës</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="login-error">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Përdoruesi</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Emri i përdoruesit..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fjalëkalimi</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Fjalëkalimi..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary btn--lg login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Duke hyrë...' : 'Hyr'}
                    </button>
                </form>
            </div>
        </div>
    );
}
