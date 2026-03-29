import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Icon from '../components/Icon';
import '../App.css';

const today = () => new Date().toISOString().split('T')[0];
const monthStart = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

function DateFilter({ from, to, onChange }) {
    return (
        <div className="date-filter">
            <div className="form-group">
                <label className="form-label">Nga</label>
                <input type="date" className="form-input" value={from} onChange={(e) => onChange('from', e.target.value)} />
            </div>
            <div className="form-group">
                <label className="form-label">Deri</label>
                <input type="date" className="form-input" value={to} onChange={(e) => onChange('to', e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', paddingBottom: 1 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => onChange('preset', 'today')}>Sot</button>
                <button className="btn btn--ghost btn--sm" onClick={() => onChange('preset', 'week')}>Java</button>
                <button className="btn btn--ghost btn--sm" onClick={() => onChange('preset', 'month')}>Muaji</button>
            </div>
        </div>
    );
}

// ── Sales Tab ──────────────────────────────────────────────────────────────────
function SalesTab() {
    const [from, setFrom]         = useState(monthStart());
    const [to, setTo]             = useState(today());
    const [sales, setSales]       = useState([]);
    const [loading, setLoading]   = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [items, setItems]       = useState({});

    const load = useCallback(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/sales?from=${from}&to=${to}`)
            .then((res) => { setSales(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [from, to]);

    useEffect(() => { load(); }, [load]);

    const handleDate = (key, val) => {
        if (key === 'preset') {
            const d = new Date();
            if (val === 'today') { setFrom(today()); setTo(today()); }
            if (val === 'week') {
                const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1);
                setFrom(mon.toISOString().split('T')[0]); setTo(today());
            }
            if (val === 'month') { setFrom(monthStart()); setTo(today()); }
        } else {
            key === 'from' ? setFrom(val) : setTo(val);
        }
    };

    const toggleExpand = async (id) => {
        if (expanded === id) { setExpanded(null); return; }
        setExpanded(id);
        if (!items[id]) {
            const res = await axios.get(`http://localhost:5000/sales/${id}/items`);
            setItems((prev) => ({ ...prev, [id]: res.data }));
        }
    };

    const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
    const avgSale      = sales.length ? totalRevenue / sales.length : 0;

    return (
        <div>
            <DateFilter from={from} to={to} onChange={handleDate} />

            <div className="report-summary-grid">
                <div className="report-summary-card">
                    <div className="report-summary-card__label">Të Ardhura Totale</div>
                    <div className="report-summary-card__value text-primary">{totalRevenue.toFixed(2)} €</div>
                </div>
                <div className="report-summary-card">
                    <div className="report-summary-card__label">Numri i Shitjeve</div>
                    <div className="report-summary-card__value">{sales.length}</div>
                </div>
                <div className="report-summary-card">
                    <div className="report-summary-card__label">Mesatarja e Shitjes</div>
                    <div className="report-summary-card__value">{avgSale.toFixed(2)} €</div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2 className="table-card__title">Të gjitha shitjet</h2>
                    <button className="btn btn--ghost btn--sm" onClick={load}>⟳ Rifresko</button>
                </div>
                <div className="table-card__body" style={{ padding: 0 }}>
                    {loading ? (
                        <div className="loading-state">Duke ngarkuar...</div>
                    ) : sales.length === 0 ? (
                        <div className="empty-state">
                            <Icon name="reports" size={32} />
                            <p>Nuk ka shitje në periudhën e zgjedhur</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 30 }}></th>
                                    <th>#</th>
                                    <th>Data &amp; Ora</th>
                                    <th>Arkatari</th>
                                    <th style={{ textAlign: 'center' }}>Artikuj</th>
                                    <th style={{ textAlign: 'right' }}>Pagesa</th>
                                    <th style={{ textAlign: 'right' }}>Kusuri</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((s) => (
                                    <React.Fragment key={s.id}>
                                        <tr
                                            className="report-row"
                                            onClick={() => toggleExpand(s.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>
                                                <Icon name={expanded === s.id ? 'chevronDown' : 'chevronRight'} size={14} />
                                            </td>
                                            <td className="col-muted">#{s.id}</td>
                                            <td>{s.created_at}</td>
                                            <td>{s.user_name || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge--info">{s.item_count}</span>
                                            </td>
                                            <td style={{ textAlign: 'right' }} className="col-muted">{Number(s.payment).toFixed(2)} €</td>
                                            <td style={{ textAlign: 'right' }} className="col-muted">{Number(s.change_amount).toFixed(2)} €</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <strong className="text-primary">{Number(s.total).toFixed(2)} €</strong>
                                            </td>
                                        </tr>
                                        {expanded === s.id && items[s.id] && (
                                            <tr className="expand-row">
                                                <td colSpan={8} style={{ padding: 0 }}>
                                                    <div className="expand-content">
                                                        <table className="data-table data-table--inner">
                                                            <thead>
                                                                <tr>
                                                                    <th>Barkodi</th>
                                                                    <th>Produkti</th>
                                                                    <th style={{ textAlign: 'center' }}>Sasia</th>
                                                                    <th style={{ textAlign: 'right' }}>Çmimi</th>
                                                                    <th style={{ textAlign: 'right' }}>Nëntotali</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {items[s.id].map((item) => (
                                                                    <tr key={item.id}>
                                                                        <td className="col-muted col-mono">{item.product_barcode}</td>
                                                                        <td>{item.product_name}</td>
                                                                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                                        <td style={{ textAlign: 'right' }}>{Number(item.unit_price).toFixed(2)} €</td>
                                                                        <td style={{ textAlign: 'right' }} className="text-primary">
                                                                            {(item.quantity * item.unit_price).toFixed(2)} €
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Stock Income Tab ───────────────────────────────────────────────────────────
function StockIncomeTab() {
    const [from, setFrom]         = useState(monthStart());
    const [to, setTo]             = useState(today());
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [items, setItems]       = useState({});

    const load = useCallback(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/stock/receipts?from=${from}&to=${to}`)
            .then((res) => { setReceipts(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [from, to]);

    useEffect(() => { load(); }, [load]);

    const handleDate = (key, val) => {
        if (key === 'preset') {
            const d = new Date();
            if (val === 'today') { setFrom(today()); setTo(today()); }
            if (val === 'week') {
                const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1);
                setFrom(mon.toISOString().split('T')[0]); setTo(today());
            }
            if (val === 'month') { setFrom(monthStart()); setTo(today()); }
        } else { key === 'from' ? setFrom(val) : setTo(val); }
    };

    const toggleExpand = async (id) => {
        if (expanded === id) { setExpanded(null); return; }
        setExpanded(id);
        if (!items[id]) {
            const res = await axios.get(`http://localhost:5000/stock/receipts/${id}`);
            setItems((prev) => ({ ...prev, [id]: res.data }));
        }
    };

    const totalQty = receipts.reduce((s, r) => s + (r.total_qty || 0), 0);

    return (
        <div>
            <DateFilter from={from} to={to} onChange={handleDate} />

            <div className="report-summary-grid">
                <div className="report-summary-card">
                    <div className="report-summary-card__label">Pranimet Totale</div>
                    <div className="report-summary-card__value">{receipts.length}</div>
                </div>
                <div className="report-summary-card">
                    <div className="report-summary-card__label">Copë të Marra</div>
                    <div className="report-summary-card__value text-primary">{totalQty}</div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2 className="table-card__title">Historiku i Pranimeve</h2>
                    <button className="btn btn--ghost btn--sm" onClick={load}>⟳ Rifresko</button>
                </div>
                <div className="table-card__body" style={{ padding: 0 }}>
                    {loading ? (
                        <div className="loading-state">Duke ngarkuar...</div>
                    ) : receipts.length === 0 ? (
                        <div className="empty-state">
                            <Icon name="receive" size={32} />
                            <p>Nuk ka pranime në periudhën e zgjedhur</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 30 }}></th>
                                    <th>#</th>
                                    <th>Data &amp; Ora</th>
                                    <th>Regjistrata nga</th>
                                    <th style={{ textAlign: 'center' }}>Produkte</th>
                                    <th style={{ textAlign: 'center' }}>Copë Totale</th>
                                    <th>Shënime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipts.map((r) => (
                                    <React.Fragment key={r.id}>
                                        <tr className="report-row" onClick={() => toggleExpand(r.id)} style={{ cursor: 'pointer' }}>
                                            <td><Icon name={expanded === r.id ? 'chevronDown' : 'chevronRight'} size={14} /></td>
                                            <td className="col-muted">#{r.id}</td>
                                            <td>{r.created_at}</td>
                                            <td>{r.user_name || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge--info">{r.item_count}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge--success">{r.total_qty}</span>
                                            </td>
                                            <td className="col-muted">{r.notes || '—'}</td>
                                        </tr>
                                        {expanded === r.id && items[r.id] && (
                                            <tr className="expand-row">
                                                <td colSpan={7} style={{ padding: 0 }}>
                                                    <div className="expand-content">
                                                        <table className="data-table data-table--inner">
                                                            <thead>
                                                                <tr>
                                                                    <th>Barkodi</th>
                                                                    <th>Produkti</th>
                                                                    <th style={{ textAlign: 'center' }}>Sasia e Marrë</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {items[r.id].map((item) => (
                                                                    <tr key={item.id}>
                                                                        <td className="col-muted col-mono">{item.product_barcode}</td>
                                                                        <td>{item.product_name}</td>
                                                                        <td style={{ textAlign: 'center' }}>
                                                                            <span className="badge badge--success">+{item.quantity}</span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Adjustments Tab ────────────────────────────────────────────────────────────
function AdjustmentsTab() {
    const [from, setFrom]             = useState(monthStart());
    const [to, setTo]                 = useState(today());
    const [adjustments, setAdj]       = useState([]);
    const [loading, setLoading]       = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/stock/adjustments?from=${from}&to=${to}`)
            .then((res) => { setAdj(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [from, to]);

    useEffect(() => { load(); }, [load]);

    const handleDate = (key, val) => {
        if (key === 'preset') {
            if (val === 'today') { setFrom(today()); setTo(today()); }
            if (val === 'week') {
                const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1);
                setFrom(mon.toISOString().split('T')[0]); setTo(today());
            }
            if (val === 'month') { setFrom(monthStart()); setTo(today()); }
        } else { key === 'from' ? setFrom(val) : setTo(val); }
    };

    return (
        <div>
            <DateFilter from={from} to={to} onChange={handleDate} />

            <div className="table-card">
                <div className="table-card__header">
                    <h2 className="table-card__title">{adjustments.length} rregullime</h2>
                    <button className="btn btn--ghost btn--sm" onClick={load}>⟳ Rifresko</button>
                </div>
                <div className="table-card__body" style={{ padding: 0 }}>
                    {loading ? (
                        <div className="loading-state">Duke ngarkuar...</div>
                    ) : adjustments.length === 0 ? (
                        <div className="empty-state">
                            <Icon name="adjust" size={32} />
                            <p>Nuk ka rregullime në periudhën e zgjedhur</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Data &amp; Ora</th>
                                    <th>Produkti</th>
                                    <th>Barkodi</th>
                                    <th style={{ textAlign: 'center' }}>Para</th>
                                    <th style={{ textAlign: 'center' }}>Pas</th>
                                    <th style={{ textAlign: 'center' }}>Ndryshim</th>
                                    <th>Arsyeja</th>
                                    <th>Perdoruesi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adjustments.map((a) => (
                                    <tr key={a.id}>
                                        <td className="col-muted">{a.created_at}</td>
                                        <td><strong>{a.product_name}</strong></td>
                                        <td className="col-muted col-mono">{a.product_barcode}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge--info">{a.quantity_before}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge--info">{a.quantity_after}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`badge ${a.quantity_change > 0 ? 'badge--success' : a.quantity_change < 0 ? 'badge--danger' : 'badge--info'}`}>
                                                {a.quantity_change > 0 ? `+${a.quantity_change}` : a.quantity_change}
                                            </span>
                                        </td>
                                        <td className="col-muted">{a.reason || '—'}</td>
                                        <td className="col-muted">{a.user_name || '—'}</td>
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

// ── Reports Page ───────────────────────────────────────────────────────────────
const TABS = [
    { id: 'sales',       label: 'Shitjet',          icon: 'reports'  },
    { id: 'stock',       label: 'Pranime Stoku',     icon: 'receive'  },
    { id: 'adjustments', label: 'Rregullime Stoku',  icon: 'adjust'   },
];

export default function Reports() {
    const [tab, setTab] = useState('sales');

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Raporte</h1>
                    <p className="page-subtitle">Historiku i shitjeve, stokut dhe veprimeve</p>
                </div>
            </div>

            <div className="report-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        className={`report-tab ${tab === t.id ? 'report-tab--active' : ''}`}
                        onClick={() => setTab(t.id)}
                    >
                        <Icon name={t.icon} size={15} />
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="report-content">
                {tab === 'sales'       && <SalesTab />}
                {tab === 'stock'       && <StockIncomeTab />}
                {tab === 'adjustments' && <AdjustmentsTab />}
            </div>
        </div>
    );
}
