import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import '../App.css';

export default function StockAdjust() {
    const [barcode, setBarcode]   = useState('');
    const [product, setProduct]   = useState(null);
    const [newQty, setNewQty]     = useState('');
    const [reason, setReason]     = useState('');
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const [saving, setSaving]     = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [params]  = useSearchParams();

    useEffect(() => {
        const bc = params.get('barcode');
        if (bc) {
            setBarcode(bc);
            lookupBarcode(bc);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const lookupBarcode = async (bc) => {
        if (!bc) return;
        setError('');
        setProduct(null);
        try {
            const res = await axios.get(`http://localhost:5000/products/${bc.trim()}`);
            if (!res.data || !res.data.barcode) { setError('Produkti nuk u gjet'); return; }
            setProduct(res.data);
            setNewQty(String(res.data.stock));
        } catch {
            setError('Produkti nuk u gjet');
        }
    };

    const handleScan = (e) => {
        if (e.keyCode !== 13 || !barcode.trim()) return;
        e.preventDefault();
        lookupBarcode(barcode.trim());
    };

    const diff = product ? (parseInt(newQty, 10) || 0) - product.stock : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product) { setError('Skano një produkt fillimisht'); return; }
        if (newQty === '' || isNaN(parseInt(newQty, 10))) { setError('Fut sasian e re'); return; }
        if (parseInt(newQty, 10) < 0) { setError('Sasia nuk mund të jetë negative'); return; }
        setSaving(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/stock/adjust', {
                barcode: product.barcode,
                newQty: parseInt(newQty, 10),
                reason,
                userId: user?.id,
                userName: user?.name,
            });
            setSuccess(`Stoku i "${product.name}" u rregullua me sukses! (${product.stock} → ${newQty})`);
            setProduct(null);
            setBarcode('');
            setNewQty('');
            setReason('');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Gabim gjatë rregullimit');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Rregulllo Stok</h1>
                    <p className="page-subtitle">Ndrysho manualisht sasinë e stokut të një produkti</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--ghost" onClick={() => navigate('/stock')}>
                        <Icon name="arrow_left" size={15} /> Kthehu
                    </button>
                </div>
            </div>

            {success && <div className="alert alert--success"><Icon name="check" size={16} />{success}</div>}

            <div className="adjust-layout">
                <div className="table-card adjust-form-card">
                    <div className="table-card__header">
                        <h2 className="table-card__title">Zgjedh Produktin</h2>
                    </div>
                    <div className="table-card__body">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

                            <div className="form-group">
                                <label className="form-label">Barkodi</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Skano ose shkruaj barkod..."
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        onKeyDown={handleScan}
                                        autoFocus
                                    />
                                    <button type="button" className="btn btn--secondary" onClick={() => lookupBarcode(barcode)}>
                                        Kërko
                                    </button>
                                </div>
                                <span className="form-hint">Shtyp Enter ose kliko Kërko</span>
                            </div>

                            {product && (
                                <>
                                    <div className="product-preview">
                                        <div className="product-preview__header">
                                            <span className="product-preview__name">{product.name}</span>
                                            <span className="badge badge--info">{product.category || 'Pa kategori'}</span>
                                        </div>
                                        <div className="product-preview__details">
                                            <div className="product-preview__stat">
                                                <span className="product-preview__stat-label">Stoku Aktual</span>
                                                <span className={`product-preview__stat-value ${product.stock <= 5 ? 'text-danger' : product.stock <= 10 ? 'text-warning' : ''}`}>
                                                    {product.stock} copë
                                                </span>
                                            </div>
                                            <div className="product-preview__stat">
                                                <span className="product-preview__stat-label">Çmimi</span>
                                                <span className="product-preview__stat-value text-primary">{Number(product.price).toFixed(2)} €</span>
                                            </div>
                                            {product.brand && (
                                                <div className="product-preview__stat">
                                                    <span className="product-preview__stat-label">Brendi</span>
                                                    <span className="product-preview__stat-value">{product.brand}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Sasia e Re *</label>
                                        <input
                                            type="number"
                                            className="form-input form-input--xl"
                                            value={newQty}
                                            onChange={(e) => setNewQty(e.target.value)}
                                            min="0"
                                            required
                                            style={{ textAlign: 'center' }}
                                        />
                                        {newQty !== '' && (
                                            <div className={`adjust-diff ${diff > 0 ? 'adjust-diff--pos' : diff < 0 ? 'adjust-diff--neg' : ''}`}>
                                                {diff === 0 ? 'Asnjë ndryshim' : diff > 0 ? `+${diff} copë` : `${diff} copë`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Arsyeja (Opsionale)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="P.sh. Inventar fizik, Humbje, Dhuratë..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                                        <button type="button" className="btn btn--ghost" onClick={() => { setProduct(null); setBarcode(''); setNewQty(''); }}>
                                            Pastro
                                        </button>
                                        <button type="submit" className="btn btn--primary btn--lg" disabled={saving || diff === 0}>
                                            {saving ? 'Duke ruajtur...' : '✓ Konfirmo Rregullimin'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>

                {/* Info panel */}
                <div className="adjust-info-panel">
                    <div className="table-card">
                        <div className="table-card__header">
                            <h2 className="table-card__title">Udhëzime</h2>
                        </div>
                        <div className="table-card__body">
                            <div className="info-list">
                                <div className="info-item">
                                    <Icon name="scan" size={16} />
                                    <span>Skano barkod ose futë manualisht dhe shtyp Enter</span>
                                </div>
                                <div className="info-item">
                                    <Icon name="adjust" size={16} />
                                    <span>Fut sasinë e re të saktë që duhet të jetë në magazinë</span>
                                </div>
                                <div className="info-item">
                                    <Icon name="info" size={16} />
                                    <span>Sistemi do të llogarisë automatikisht ndryshimin</span>
                                </div>
                                <div className="info-item">
                                    <Icon name="reports" size={16} />
                                    <span>Çdo rregullim regjistrohet në historikun e stokut</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="table-card" style={{ marginTop: 16 }}>
                        <div className="table-card__header">
                            <h2 className="table-card__title">Shiko Historikun</h2>
                        </div>
                        <div className="table-card__body">
                            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                                Të gjitha rregullimet e stokut janë të regjistruara në Raporte.
                            </p>
                            <button className="btn btn--ghost" onClick={() => navigate('/reports')}>
                                Shko te Raporte →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
