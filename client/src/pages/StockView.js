import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/Icon';
import '../App.css';

export default function StockView() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch]     = useState('');
    const [filter, setFilter]     = useState('all'); // all | low | out
    const [loading, setLoading]   = useState(true);
    const navigate = useNavigate();

    const load = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:5000/products')
            .then((res) => { setProducts(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        let list = [...products];
        if (filter === 'low') list = list.filter((p) => p.stock > 0 && p.stock <= 10);
        if (filter === 'out') list = list.filter((p) => p.stock <= 0);
        const q = search.toLowerCase();
        if (q) list = list.filter((p) =>
            p.name?.toLowerCase().includes(q) ||
            p.barcode?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q)
        );
        setFiltered(list);
    }, [products, search, filter]);

    const lowCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outCount = products.filter((p) => p.stock <= 0).length;

    const stockClass = (stock) => {
        if (stock <= 0)  return 'badge badge--danger';
        if (stock <= 5)  return 'badge badge--warning';
        if (stock <= 10) return 'badge badge--info';
        return 'badge badge--success';
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Pamja e Stokut</h1>
                    <p className="page-subtitle">Gjendja aktuale e inventarit</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--secondary" onClick={() => navigate('/stock/receive')}>
                        <Icon name="receive" size={15} /> Merr Stok
                    </button>
                    <button className="btn btn--secondary" onClick={() => navigate('/stock/adjust')}>
                        <Icon name="adjust" size={15} /> Rregulllo
                    </button>
                </div>
            </div>

            {/* Filter chips */}
            <div className="filter-chips">
                <button className={`filter-chip ${filter === 'all' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('all')}>
                    Të gjitha ({products.length})
                </button>
                <button className={`filter-chip filter-chip--warning ${filter === 'low' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('low')}>
                    Stok i Ulët ({lowCount})
                </button>
                <button className={`filter-chip filter-chip--danger ${filter === 'out' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('out')}>
                    Pa Stok ({outCount})
                </button>
            </div>

            <div className="search-bar">
                <Icon name="search" size={16} className="search-bar__icon" />
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder="Kërko produkt..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button className="search-bar__clear" onClick={() => setSearch('')}>✕</button>}
            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2 className="table-card__title">{filtered.length} produkte</h2>
                    <button className="btn btn--ghost btn--sm" onClick={load}>⟳ Rifresko</button>
                </div>
                <div className="table-card__body" style={{ padding: 0 }}>
                    {loading ? (
                        <div className="loading-state">Duke ngarkuar...</div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <Icon name="products" size={32} />
                            <p>Nuk u gjet asnjë produkt</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Barkodi</th>
                                    <th>Emri</th>
                                    <th>Brendi</th>
                                    <th>Kategoria</th>
                                    <th style={{ textAlign: 'right' }}>Çmimi</th>
                                    <th style={{ textAlign: 'center' }}>Stoku</th>
                                    <th style={{ textAlign: 'right' }}>Veprime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.id} className={p.stock <= 0 ? 'row--danger' : p.stock <= 10 ? 'row--warning' : ''}>
                                        <td className="col-muted col-mono">{p.barcode}</td>
                                        <td><strong>{p.name}</strong></td>
                                        <td className="col-muted">{p.brand || '—'}</td>
                                        <td className="col-muted">{p.category || '—'}</td>
                                        <td style={{ textAlign: 'right' }} className="text-primary">
                                            {Number(p.price).toFixed(2)} €
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={stockClass(p.stock)}>{p.stock}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn btn--ghost btn--sm"
                                                onClick={() => navigate(`/stock/adjust?barcode=${p.barcode}`)}
                                            >
                                                Rregulllo
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
