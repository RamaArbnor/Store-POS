import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Icon from '../components/Icon';
import '../App.css';

const EMPTY = { barcode: '', name: '', price: '', stock: '', brand: '', category: '', description: '' };

export default function Products() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch]     = useState('');
    const [loading, setLoading]   = useState(true);
    const [modal, setModal]       = useState(null); // null | 'add' | 'edit'
    const [form, setForm]         = useState(EMPTY);
    const [error, setError]       = useState('');
    const [delConfirm, setDelConfirm] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:5000/products')
            .then((res) => { setProducts(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            products.filter((p) =>
                p.name?.toLowerCase().includes(q) ||
                p.barcode?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            )
        );
    }, [products, search]);

    const openAdd  = () => { setForm(EMPTY); setError(''); setModal('add'); };
    const openEdit = (p) => { setForm({ ...p }); setError(''); setModal('edit'); };
    const closeModal = () => { setModal(null); setForm(EMPTY); setError(''); };

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.barcode || !form.name || !form.price) { setError('Barkodi, Emri dhe Çmimi janë të detyrueshme'); return; }
        const req = modal === 'add'
            ? axios.post('http://localhost:5000/products', form)
            : axios.put(`http://localhost:5000/products/${form.barcode}`, form);
        req.then(() => { load(); closeModal(); })
           .catch((err) => setError(err.response?.data?.error || 'Gabim gjatë ruajtjes'));
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/products/${id}`)
            .then(() => { load(); setDelConfirm(null); })
            .catch(() => {});
    };

    const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Produktet</h1>
                    <p className="page-subtitle">Menaxho të gjitha produktet e dyqanit</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--primary" onClick={openAdd}>
                        <Icon name="plus" size={15} />
                        Shto Produkt
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Icon name="search" size={16} className="search-bar__icon" />
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder="Kërko sipas emrit, barkodi, brendi ose kategorisë..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button className="search-bar__clear" onClick={() => setSearch('')}>✕</button>
                )}
            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2 className="table-card__title">
                        {filtered.length} produkte {search ? `(nga ${products.length})` : ''}
                    </h2>
                </div>
                <div className="table-card__body" style={{ padding: 0 }}>
                    {loading ? (
                        <div className="loading-state">Duke ngarkuar...</div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <Icon name="products" size={32} />
                            <p>{search ? 'Nuk u gjend asnjë produkt' : 'Nuk ka produkte të regjistruara'}</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Barkodi</th>
                                    <th>Emri</th>
                                    <th>Çmimi</th>
                                    <th>Stoku</th>
                                    <th>Brendi</th>
                                    <th>Kategoria</th>
                                    <th style={{ textAlign: 'right' }}>Veprime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.id}>
                                        <td className="col-muted col-mono">{p.barcode}</td>
                                        <td><strong>{p.name}</strong></td>
                                        <td className="text-primary">{Number(p.price).toFixed(2)} €</td>
                                        <td>
                                            <span className={`badge ${p.stock <= 5 ? 'badge--danger' : p.stock <= 10 ? 'badge--warning' : 'badge--success'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="col-muted">{p.brand || '—'}</td>
                                        <td className="col-muted">{p.category || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="row-actions">
                                                <button className="btn-icon btn-icon--edit" onClick={() => openEdit(p)} title="Ndrysho">
                                                    <Icon name="edit" size={14} />
                                                </button>
                                                <button className="btn-icon btn-icon--delete" onClick={() => setDelConfirm(p)} title="Fshij">
                                                    <Icon name="trash" size={14} />
                                                </button>
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
                    <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">{modal === 'add' ? 'Shto Produkt' : 'Ndrysho Produkt'}</h2>
                            <button className="modal__close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal__body">
                                {error && <div className="form-error">{error}</div>}
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Barkodi *</label>
                                        <input className="form-input" value={form.barcode} onChange={(e) => f('barcode', e.target.value)} disabled={modal === 'edit'} autoFocus />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Emri *</label>
                                        <input className="form-input" value={form.name} onChange={(e) => f('name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Çmimi (€) *</label>
                                        <input type="number" className="form-input" value={form.price} onChange={(e) => f('price', e.target.value)} step="0.01" min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stoku</label>
                                        <input type="number" className="form-input" value={form.stock} onChange={(e) => f('stock', e.target.value)} min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Brendi</label>
                                        <input className="form-input" value={form.brand} onChange={(e) => f('brand', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Kategoria</label>
                                        <input className="form-input" value={form.category} onChange={(e) => f('category', e.target.value)} />
                                    </div>
                                    <div className="form-group form-group--full">
                                        <label className="form-label">Përshkrimi</label>
                                        <input className="form-input" value={form.description} onChange={(e) => f('description', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal__footer">
                                <button type="button" className="btn btn--ghost" onClick={closeModal}>Anulo</button>
                                <button type="submit" className="btn btn--primary">
                                    {modal === 'add' ? 'Regjistro' : 'Ruaj Ndryshimet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {delConfirm && (
                <div className="modal-overlay" onClick={() => setDelConfirm(null)}>
                    <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Konfirmo Fshirjen</h2>
                            <button className="modal__close" onClick={() => setDelConfirm(null)}>✕</button>
                        </div>
                        <div className="modal__body">
                            <p>A je i sigurtë që dëshiron të fshish produktin <strong>"{delConfirm.name}"</strong>?</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Ky veprim nuk mund të kthehet prapa.</p>
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
