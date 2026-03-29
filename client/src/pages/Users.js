import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import '../App.css';

const EMPTY = { username: '', password: '', name: '', role: 'cashier' };
const ROLES = [
    { value: 'admin',   label: 'Administrator' },
    { value: 'manager', label: 'Menaxher' },
    { value: 'cashier', label: 'Arkatare' },
];
const ROLE_BADGE = { admin: 'badge--danger', manager: 'badge--warning', cashier: 'badge--info' };

export default function Users() {
    const { user: me } = useAuth();
    const [users, setUsers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [modal, setModal]       = useState(null);
    const [form, setForm]         = useState(EMPTY);
    const [error, setError]       = useState('');
    const [delConfirm, setDelConfirm] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:5000/users')
            .then((res) => { setUsers(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAdd  = () => { setForm(EMPTY); setError(''); setModal('add'); };
    const openEdit = (u) => { setForm({ ...u, password: '' }); setError(''); setModal('edit'); };
    const closeModal = () => { setModal(null); setForm(EMPTY); setError(''); };

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.username || !form.name) { setError('Emri dhe username janë të detyrueshme'); return; }
        if (modal === 'add' && !form.password) { setError('Fjalëkalimi është i detyrueshëm'); return; }

        const req = modal === 'add'
            ? axios.post('http://localhost:5000/users', form)
            : axios.put(`http://localhost:5000/users/${form.id}`, form);

        req.then(() => { load(); closeModal(); })
           .catch((err) => setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'));
    };

    const handleDelete = (id) => {
        if (id === me?.id) return;
        axios.delete(`http://localhost:5000/users/${id}`)
            .then(() => { load(); setDelConfirm(null); })
            .catch(() => {});
    };

    const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Përdoruesit</h1>
                    <p className="page-subtitle">Menaxho llogaritë e stafit dhe të drejtat e aksesit</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--primary" onClick={openAdd}>
                        <Icon name="plus" size={15} />
                        Shto Përdorues
                    </button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2 className="table-card__title">{users.length} përdorues</h2>
                </div>
                <div className="table-card__body" style={{ padding: 0 }}>
                    {loading ? (
                        <div className="loading-state">Duke ngarkuar...</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Emri i Plotë</th>
                                    <th>Username</th>
                                    <th>Roli</th>
                                    <th>Krijuar</th>
                                    <th style={{ textAlign: 'right' }}>Veprime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="user-avatar">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong>{u.name}</strong>
                                                    {u.id === me?.id && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>(Ju)</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="col-mono col-muted">{u.username}</td>
                                        <td>
                                            <span className={`badge ${ROLE_BADGE[u.role] || 'badge--info'}`}>
                                                {ROLES.find((r) => r.value === u.role)?.label || u.role}
                                            </span>
                                        </td>
                                        <td className="col-muted">{u.created_at?.split(' ')[0] || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="row-actions">
                                                <button className="btn-icon btn-icon--edit" onClick={() => openEdit(u)} title="Ndrysho">
                                                    <Icon name="edit" size={14} />
                                                </button>
                                                {u.id !== me?.id && (
                                                    <button className="btn-icon btn-icon--delete" onClick={() => setDelConfirm(u)} title="Fshij">
                                                        <Icon name="trash" size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {modal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">{modal === 'add' ? 'Shto Përdorues' : 'Ndrysho Përdorues'}</h2>
                            <button className="modal__close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal__body">
                                {error && <div className="form-error">{error}</div>}
                                <div className="form-group">
                                    <label className="form-label">Emri i Plotë *</label>
                                    <input className="form-input" value={form.name} onChange={(e) => f('name', e.target.value)} autoFocus placeholder="P.sh. Arbnor Rama" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Username *</label>
                                    <input className="form-input" value={form.username} onChange={(e) => f('username', e.target.value)} placeholder="P.sh. arbnor" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Fjalëkalimi {modal === 'edit' && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(lëre bosh për të mos ndryshuar)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.password}
                                        onChange={(e) => f('password', e.target.value)}
                                        placeholder={modal === 'add' ? 'Fut fjalëkalimin...' : 'Fjalëkalimi i ri (opsional)...'}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Roli *</label>
                                    <select className="form-input form-select" value={form.role} onChange={(e) => f('role', e.target.value)}>
                                        {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                                <div className="role-info">
                                    <strong>Administrator:</strong> Qasje e plotë — mund të menaxhojë përdoruesit<br />
                                    <strong>Menaxher:</strong> Stoku, produktet dhe raportet<br />
                                    <strong>Arkatare:</strong> Vetëm kasa (POS)
                                </div>
                            </div>
                            <div className="modal__footer">
                                <button type="button" className="btn btn--ghost" onClick={closeModal}>Anulo</button>
                                <button type="submit" className="btn btn--primary">
                                    {modal === 'add' ? 'Krijo Llogarinë' : 'Ruaj Ndryshimet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {delConfirm && (
                <div className="modal-overlay" onClick={() => setDelConfirm(null)}>
                    <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Fshij Përdoruesin</h2>
                            <button className="modal__close" onClick={() => setDelConfirm(null)}>✕</button>
                        </div>
                        <div className="modal__body">
                            <p>A je i sigurtë që dëshiron të fshish llogarinë e <strong>"{delConfirm.name}"</strong>?</p>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--ghost" onClick={() => setDelConfirm(null)}>Anulo</button>
                            <button className="btn btn--danger" onClick={() => handleDelete(delConfirm.id)}>
                                <Icon name="trash" size={14} /> Fshij
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
