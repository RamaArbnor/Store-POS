import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import '../App.css';

export default function StockReceive() {
    const [barcode, setBarcode]   = useState('');
    const [items, setItems]       = useState([]);
    const [notes, setNotes]       = useState('');
    const [notFound, setNotFound] = useState('');
    const [success, setSuccess]   = useState(false);
    const [saving, setSaving]     = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const scanProduct = async (e) => {
        if (e.keyCode !== 13 || !barcode.trim()) return;
        e.preventDefault();
        const bc = barcode.trim();
        try {
            const res = await axios.get(`http://localhost:5000/products/${bc}`);
            if (!res.data || !res.data.barcode) {
                setNotFound(bc);
                setBarcode('');
                return;
            }
            setNotFound('');
            setItems((prev) => {
                const existing = prev.find((i) => i.barcode === res.data.barcode);
                if (existing) return prev.map((i) => i.barcode === res.data.barcode ? { ...i, quantity: i.quantity + 1 } : i);
                return [...prev, { barcode: res.data.barcode, name: res.data.name, quantity: 1, currentStock: res.data.stock }];
            });
            setBarcode('');
        } catch {
            setNotFound(bc);
            setBarcode('');
        }
    };

    const updateQty = (barcode, val) => {
        const q = parseInt(val, 10) || 1;
        setItems((prev) => prev.map((i) => i.barcode === barcode ? { ...i, quantity: q } : i));
    };

    const removeItem = (barcode) => {
        setItems((prev) => prev.filter((i) => i.barcode !== barcode));
    };

    const handleSubmit = async () => {
        if (!items.length) return;
        setSaving(true);
        try {
            await axios.post('http://localhost:5000/stock/receive', {
                items,
                notes,
                userId:   user?.id,
                userName: user?.name,
            });
            setSuccess(true);
            setItems([]);
            setNotes('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const totalQty = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Merr Stok</h1>
                    <p className="page-subtitle">Regjistro mallrat e reja të marra në magazinë</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--ghost" onClick={() => navigate('/stock')}>
                        <Icon name="arrow_left" size={15} /> Kthehu
                    </button>
                </div>
            </div>

            {success && (
                <div className="alert alert--success">
                    <Icon name="check" size={16} />
                    Stoku u pranua me sukses! Produktet janë përditësuar.
                </div>
            )}

            <div className="receive-layout">
                {/* Left: scan panel */}
                <div className="receive-scan-panel table-card">
                    <div className="table-card__header">
                        <h2 className="table-card__title">Skano Produkt</h2>
                    </div>
                    <div className="table-card__body">
                        {notFound && (
                            <div className="alert alert--warning" style={{ marginBottom: 12 }}>
                                Barkodi <strong>"{notFound}"</strong> nuk u gjet
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Barkodi</label>
                            <input
                                type="text"
                                className="scan-input"
                                placeholder="Skano ose shkruaj barkod dhe shtyp Enter..."
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyDown={scanProduct}
                                autoFocus
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">Shënime (Opsionale)</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                placeholder="P.sh. Fatura nr. 123, Furnizuesi ALFA..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: items list */}
                <div className="receive-items-panel table-card">
                    <div className="table-card__header">
                        <h2 className="table-card__title">Lista e Mallrave ({items.length} produkte — {totalQty} copë)</h2>
                    </div>
                    <div className="table-card__body" style={{ padding: 0 }}>
                        {items.length === 0 ? (
                            <div className="empty-state">
                                <Icon name="receive" size={32} />
                                <p>Skano produkte për t'i shtuar në listë</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Barkodi</th>
                                        <th>Emri</th>
                                        <th style={{ textAlign: 'center' }}>Stoku Aktual</th>
                                        <th style={{ textAlign: 'center' }}>Sasia e Re</th>
                                        <th style={{ textAlign: 'center' }}>Pas Marrjes</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.barcode}>
                                            <td className="col-muted col-mono">{item.barcode}</td>
                                            <td><strong>{item.name}</strong></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge--info">{item.currentStock}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    className="qty-input"
                                                    value={item.quantity}
                                                    min="1"
                                                    onChange={(e) => updateQty(item.barcode, e.target.value)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge--success">{item.currentStock + item.quantity}</span>
                                            </td>
                                            <td>
                                                <button className="btn-icon btn-icon--delete" onClick={() => removeItem(item.barcode)}>
                                                    <Icon name="trash" size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {items.length > 0 && (
                        <div className="table-card__footer">
                            <button className="btn btn--outline-danger" onClick={() => setItems([])}>
                                Pastro Listën
                            </button>
                            <button className="btn btn--primary btn--lg" onClick={handleSubmit} disabled={saving}>
                                {saving ? 'Duke ruajtur...' : `✓ Konfirmo Marrjen (${totalQty} copë)`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
