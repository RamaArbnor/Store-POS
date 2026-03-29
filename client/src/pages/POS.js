import '../App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function POS() {
    const [items, setItems]           = useState([]);
    const [total, setTotal]           = useState(0);
    const [rowIdx, setRowIdx]         = useState(1);
    const [showPay, setShowPay]       = useState(false);
    const [payAmount, setPayAmount]   = useState('');
    const [change, setChange]         = useState(null);
    const [canPay, setCanPay]         = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [newProduct, setNewProduct] = useState({ barcode: '', name: '', stock: '', price: '', brand: '', category: '', description: '' });
    const [toUpdate, setToUpdate]     = useState({});
    const [notFound, setNotFound]     = useState('');
    const [saleSuccess, setSaleSuccess] = useState(false);

    const navigate    = useNavigate();
    const { user, logout } = useAuth();
    const canManage   = user?.role === 'admin' || user?.role === 'manager';

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        setTotal(items.reduce((s, p) => s + p.quantity * p.price, 0));
    }, [items]);

    const scanBarcode = (e) => {
        if (e.keyCode !== 13 || e.shiftKey || !e.target.value) return;
        e.preventDefault();
        const barcode = e.target.value.trim();
        axios.get(`http://localhost:5000/products/${barcode}`)
            .then((res) => {
                if (!res.data) { setNotFound(barcode); return; }
                setNotFound('');
                setItems((prev) => {
                    const existing = prev.find((p) => p.barcode === res.data.barcode);
                    if (existing) {
                        return prev.map((p) => p.barcode === existing.barcode ? { ...p, quantity: p.quantity + 1 } : p);
                    }
                    return [...prev, {
                        id: rowIdx,
                        barcode: res.data.barcode,
                        name: res.data.name,
                        quantity: 1,
                        stock: res.data.stock,
                        price: res.data.price,
                        description: res.data.description,
                        category: res.data.category,
                    }];
                });
                setRowIdx((r) => r + 1);
                e.target.value = '';
            })
            .catch(() => { setNotFound(barcode); e.target.value = ''; });
    };

    const scanForUpdate = (e) => {
        if (e.keyCode !== 13 || e.shiftKey || !e.target.value) return;
        e.preventDefault();
        const barcode = e.target.value.trim();
        axios.get(`http://localhost:5000/products/${barcode}`)
            .then((res) => {
                if (res.data) setToUpdate({ ...res.data });
            });
    };

    const changeQty = (id, val) => {
        const q = parseFloat(val) || 1;
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: q } : p)));
    };

    const calcChange = (val) => {
        const pay = parseFloat(val) || 0;
        setPayAmount(val);
        const c = pay - total;
        setChange(c);
        setCanPay(c >= 0);
    };

    const openPay = () => {
        setPayAmount('');
        setChange(null);
        setCanPay(false);
        setShowPay(true);
    };

    const completeSale = () => {
        axios.put('http://localhost:5000/sell', {
            products: items,
            total,
            payment: parseFloat(payAmount) || total,
            change: change || 0,
            userId: user?.id,
            userName: user?.name,
        }).then(() => {
            setItems([]);
            setRowIdx(1);
            setShowPay(false);
            setChange(null);
            setCanPay(false);
            setPayAmount('');
            setSaleSuccess(true);
            setTimeout(() => setSaleSuccess(false), 2500);
        });
    };

    const registerProduct = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/products', newProduct).then(() => {
            setShowRegister(false);
            setNewProduct({ barcode: '', name: '', stock: '', price: '', brand: '', category: '', description: '' });
        });
    };

    const updateProduct = (e) => {
        e.preventDefault();
        axios.put(`http://localhost:5000/products/${toUpdate.barcode}`, toUpdate).then(() => {
            setToUpdate({});
            setShowUpdate(false);
        });
    };

    return (
        <div className="pos-layout">

            {/* ── Success Toast ── */}
            {saleSuccess && (
                <div className="toast toast--success">✓ &nbsp;Shitja u regjistrua me sukses!</div>
            )}

            {/* ── Payment Modal ── */}
            {showPay && (
                <div className="modal-overlay" onClick={() => setShowPay(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Pagesa</h2>
                            <button className="modal__close" onClick={() => setShowPay(false)}>✕</button>
                        </div>
                        <div className="modal__body">
                            <div className="payment-summary">
                                <div className="payment-row">
                                    <span>Total</span>
                                    <strong className="payment-amount">{total.toFixed(2)} €</strong>
                                </div>
                                <div className="payment-row" style={{ marginTop: 6 }}>
                                    <span style={{ fontSize: 12 }}>Artikuj</span>
                                    <span style={{ fontSize: 12, color: '#718096' }}>{items.length} produkte</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Shuma e Paguar</label>
                                <input
                                    type="number"
                                    className="form-input form-input--xl"
                                    placeholder="0.00"
                                    value={payAmount}
                                    onChange={(e) => calcChange(e.target.value)}
                                    autoFocus
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            {change !== null && (
                                <div className={`payment-change ${change >= 0 ? 'payment-change--positive' : 'payment-change--negative'}`}>
                                    <span>Kusuri</span>
                                    <strong>{change.toFixed(2)} €</strong>
                                </div>
                            )}
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--ghost" onClick={() => setShowPay(false)}>Anulo</button>
                            <button className="btn btn--primary btn--lg" onClick={completeSale} disabled={!canPay}>
                                ✓ &nbsp;Paguaj
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Register Product Modal ── */}
            {canManage && showRegister && (
                <div className="modal-overlay" onClick={() => setShowRegister(false)}>
                    <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Shto Produkt të Ri</h2>
                            <button className="modal__close" onClick={() => setShowRegister(false)}>✕</button>
                        </div>
                        <div className="modal__body">
                            <div className="form-grid">
                                {[
                                    { label: 'Barkodi', key: 'barcode', type: 'text' },
                                    { label: 'Emri', key: 'name', type: 'text' },
                                    { label: 'Sasia Fillestare', key: 'stock', type: 'number' },
                                    { label: 'Çmimi (€)', key: 'price', type: 'number' },
                                    { label: 'Brendi', key: 'brand', type: 'text' },
                                    { label: 'Kategoria', key: 'category', type: 'text' },
                                ].map(({ label, key, type }) => (
                                    <div className="form-group" key={key}>
                                        <label className="form-label">{label}</label>
                                        <input
                                            type={type}
                                            className="form-input"
                                            value={newProduct[key]}
                                            onChange={(e) => setNewProduct({ ...newProduct, [key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div className="form-group form-group--full">
                                    <label className="form-label">Përshkrimi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--ghost" onClick={() => setShowRegister(false)}>Anulo</button>
                            <button className="btn btn--primary" onClick={registerProduct}>Regjistro</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Update Product Modal ── */}
            {canManage && showUpdate && (
                <div className="modal-overlay" onClick={() => { setToUpdate({}); setShowUpdate(false); }}>
                    <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Ndrysho Produkt</h2>
                            <button className="modal__close" onClick={() => { setToUpdate({}); setShowUpdate(false); }}>✕</button>
                        </div>
                        <div className="modal__body">
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label">Barkodi — skano ose shkruaj dhe shtyp Enter</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={toUpdate.barcode || ''}
                                    onKeyDown={scanForUpdate}
                                    onChange={(e) => setToUpdate({ ...toUpdate, barcode: e.target.value })}
                                    placeholder="Skano barkod..."
                                    autoFocus
                                />
                            </div>
                            <div className="form-grid">
                                {[
                                    { label: 'Emri', key: 'name', type: 'text' },
                                    { label: 'Çmimi (€)', key: 'price', type: 'number' },
                                    { label: 'Stoku', key: 'stock', type: 'number' },
                                    { label: 'Brendi', key: 'brand', type: 'text' },
                                    { label: 'Kategoria', key: 'category', type: 'text' },
                                ].map(({ label, key, type }) => (
                                    <div className="form-group" key={key}>
                                        <label className="form-label">{label}</label>
                                        <input
                                            type={type}
                                            className="form-input"
                                            value={toUpdate[key] || ''}
                                            onChange={(e) => setToUpdate({ ...toUpdate, [key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div className="form-group form-group--full">
                                    <label className="form-label">Përshkrimi</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={toUpdate.description || ''}
                                        onChange={(e) => setToUpdate({ ...toUpdate, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--ghost" onClick={() => { setToUpdate({}); setShowUpdate(false); }}>Anulo</button>
                            <button className="btn btn--primary" onClick={updateProduct}>Ruaj</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <header className="pos-header">
                <div className="pos-header__brand">
                    <div className="pos-header__logo">M</div>
                    <h1 className="pos-header__title">Marketi SHPK</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div className="pos-header__total">
                        <span className="pos-header__total-label">Totali</span>
                        <span className="pos-header__total-amount">{total.toFixed(2)} €</span>
                    </div>
                    <div style={{ borderLeft: '1px solid #252c45', paddingLeft: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 12, color: '#718096' }}>{user?.name}</div>
                            <div style={{ fontSize: 11, color: '#4a5568', textTransform: 'capitalize' }}>{user?.role}</div>
                        </div>
                        <button className="pos-logout-btn" onClick={handleLogout} title="Dil">
                            Dil
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Product Table ── */}
            <main className="pos-main">
                {notFound && (
                    <div className="pos-not-found">
                        ⚠ Barkodi <strong>"{notFound}"</strong> nuk u gjet në sistem
                    </div>
                )}
                <div className="pos-table-wrap">
                    <table className="pos-table">
                        <thead>
                            <tr>
                                <th className="col-id">#</th>
                                <th>Barkodi</th>
                                <th>Emri</th>
                                <th className="col-qty">Sasia</th>
                                <th className="col-price">Çmimi</th>
                                <th className="col-price">Nënttotali</th>
                                <th>Kategoria</th>
                                <th className="col-action"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="pos-table__scan-row">
                                <td className="col-id">
                                    <span className="scan-icon">⊕</span>
                                </td>
                                <td colSpan="6">
                                    <input
                                        type="text"
                                        className="scan-input"
                                        placeholder="Skano barkod ose shkruaj dhe shtyp Enter..."
                                        onKeyDown={scanBarcode}
                                    />
                                </td>
                                <td></td>
                            </tr>
                            {items.map((p) => (
                                <tr key={p.id} className="pos-table__row">
                                    <td className="col-id col-id-cell">{p.id}</td>
                                    <td>{p.barcode}</td>
                                    <td className="col-name">{p.name}</td>
                                    <td className="col-qty">
                                        <input
                                            type="number"
                                            className="qty-input"
                                            defaultValue={p.quantity}
                                            min="1"
                                            onChange={(e) => changeQty(p.id, e.target.value)}
                                        />
                                    </td>
                                    <td className="col-price col-price-cell">{Number(p.price).toFixed(2)} €</td>
                                    <td className="col-price" style={{ fontWeight: 600 }}>
                                        {(p.quantity * p.price).toFixed(2)} €
                                    </td>
                                    <td className="col-desc">{p.category}</td>
                                    <td className="col-action">
                                        <button className="btn-delete" onClick={() => setItems((prev) => prev.filter((x) => x.id !== p.id))}>✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* ── Action Footer ── */}
            <footer className="pos-footer">
                <div className="pos-footer__left">
                    {canManage && (
                        <>
                            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')}>← Panel</button>
                            <button className="btn btn--secondary" onClick={() => setShowRegister(true)}>+ Shto</button>
                            <button className="btn btn--secondary" onClick={() => setShowUpdate(true)}>✎ Ndrysho</button>
                            <button className="btn btn--secondary" onClick={() => navigate('/stock')}>▤ Stoku</button>
                            <button className="btn btn--secondary" onClick={() => navigate('/stock/receive')}>⬇ Merr Stok</button>
                        </>
                    )}
                </div>
                <div className="pos-footer__right">
                    <button
                        className="btn btn--outline-danger"
                        onClick={() => { setItems([]); setRowIdx(1); setNotFound(''); }}
                        disabled={items.length === 0}
                    >
                        Anulo
                    </button>
                    <button
                        className="btn btn--primary btn--lg"
                        onClick={openPay}
                        disabled={items.length === 0}
                    >
                        Paguaj &nbsp;{total.toFixed(2)} €
                    </button>
                </div>
            </footer>
        </div>
    );
}
