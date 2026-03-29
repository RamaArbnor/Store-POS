import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import '../App.css';

function StatCard({ icon, label, value, sub, variant }) {
    return (
        <div className="stat-card">
            <div className={`stat-card__icon-wrap stat-card__icon-wrap--${variant || 'primary'}`}>
                <Icon name={icon} size={20} />
            </div>
            <div className="stat-card__content">
                <div className="stat-card__label">{label}</div>
                <div className={`stat-card__value stat-card__value--${variant || 'primary'}`}>{value}</div>
                {sub && <div className="stat-card__sub">{sub}</div>}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/dashboard/stats')
            .then((res) => { setStats(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (user?.role === 'cashier') return <Navigate to="/pos" replace />;

    const today = new Date().toLocaleDateString('sq-AL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mirë se erdhe, {user?.name}!</h1>
                    <p className="page-subtitle" style={{ textTransform: 'capitalize' }}>{today}</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn btn--primary" onClick={() => navigate('/pos')}>
                        <Icon name="pos" size={15} />
                        Hap Kasën
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Duke ngarkuar...</div>
            ) : (
                <>
                    <div className="stat-grid">
                        <StatCard
                            icon="reports"
                            label="Shitjet Sot"
                            value={`${(stats?.today_revenue || 0).toFixed(2)} €`}
                            sub={`${stats?.today_transactions || 0} transaksione`}
                            variant="primary"
                        />
                        <StatCard
                            icon="calendar"
                            label="Shitjet Këtë Muaj"
                            value={`${(stats?.month_revenue || 0).toFixed(2)} €`}
                            variant="secondary"
                        />
                        <StatCard
                            icon="products"
                            label="Gjithsej Produkte"
                            value={stats?.total_products || 0}
                            variant="info"
                        />
                        <StatCard
                            icon="alert"
                            label="Stok i Ulët"
                            value={stats?.low_stock || 0}
                            sub="produkte ≤ 10 copë"
                            variant={stats?.low_stock > 0 ? 'danger' : 'primary'}
                        />
                    </div>

                    <div className="table-card">
                        <div className="table-card__header">
                            <h2 className="table-card__title">Shitjet e Fundit</h2>
                            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/reports')}>
                                Të gjitha raporte →
                            </button>
                        </div>
                        <div className="table-card__body">
                            {!stats?.recent_sales?.length ? (
                                <div className="empty-state">
                                    <Icon name="pos" size={32} />
                                    <p>Nuk ka shitje të regjistruara</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Data &amp; Ora</th>
                                            <th>Arkatari</th>
                                            <th>Artikuj</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_sales.map((s) => (
                                            <tr key={s.id}>
                                                <td className="col-muted">#{s.id}</td>
                                                <td>{s.created_at}</td>
                                                <td>{s.user_name || '—'}</td>
                                                <td>
                                                    <span className="badge badge--info">{s.item_count} art.</span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <strong className="text-primary">{Number(s.total).toFixed(2)} €</strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h2 className="table-card__title" style={{ marginBottom: 12 }}>Veprime të Shpejta</h2>
                        <div className="quick-actions__grid">
                            <button className="quick-action-btn" onClick={() => navigate('/pos')}>
                                <Icon name="pos" size={24} />
                                <span>Kasa</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => navigate('/products')}>
                                <Icon name="products" size={24} />
                                <span>Produktet</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => navigate('/stock/receive')}>
                                <Icon name="receive" size={24} />
                                <span>Merr Stok</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => navigate('/stock/adjust')}>
                                <Icon name="adjust" size={24} />
                                <span>Rregulllo Stok</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => navigate('/reports')}>
                                <Icon name="reports" size={24} />
                                <span>Raporte</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => navigate('/stock')}>
                                <Icon name="stock" size={24} />
                                <span>Stoku</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
