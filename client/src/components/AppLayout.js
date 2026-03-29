import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';

const ROLE_LABELS = { admin: 'Administrator', manager: 'Menaxher', cashier: 'Arkatare' };

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar__brand">
                    <div className="pos-header__logo" style={{ width: 32, height: 32, fontSize: 15 }}>M</div>
                    <span className="sidebar__brand-name">Marketi SHPK</span>
                </div>

                <nav className="sidebar__nav">
                    <NavLink to="/" end className={({ isActive }) => 'sidebar__nav-item' + (isActive ? ' sidebar__nav-item--active' : '')}>
                        <Icon name="dashboard" size={16} />
                        <span>Paneli</span>
                    </NavLink>

                    <NavLink to="/pos" className={({ isActive }) => 'sidebar__nav-item' + (isActive ? ' sidebar__nav-item--active' : '')}>
                        <Icon name="pos" size={16} />
                        <span>Kasa (POS)</span>
                    </NavLink>

                    {canManage && (
                        <>
                            <div className="sidebar__section-label">Inventari</div>

                            <NavLink to="/products" className={({ isActive }) => 'sidebar__nav-item' + (isActive ? ' sidebar__nav-item--active' : '')}>
                                <Icon name="products" size={16} />
                                <span>Produktet</span>
                            </NavLink>

                            <NavLink to="/stock" end className={({ isActive }) => 'sidebar__nav-item' + (isActive ? ' sidebar__nav-item--active' : '')}>
                                <Icon name="stock" size={16} />
                                <span>Pamja e Stokut</span>
                            </NavLink>

                            <NavLink to="/stock/receive" className={({ isActive }) => 'sidebar__nav-item sidebar__nav-item--sub' + (isActive ? ' sidebar__nav-item--active' : '')}>
                                <Icon name="receive" size={14} />
                                <span>Merr Stok</span>
                            </NavLink>

                            <NavLink to="/stock/adjust" className={({ isActive }) => 'sidebar__nav-item sidebar__nav-item--sub' + (isActive ? ' sidebar__nav-item--active' : '')}>
                                <Icon name="adjust" size={14} />
                                <span>Rregulllo Stok</span>
                            </NavLink>

                            <div className="sidebar__section-label">Analitikë</div>

                            <NavLink to="/reports" className={({ isActive }) => 'sidebar__nav-item' + (isActive ? ' sidebar__nav-item--active' : '')}>
                                <Icon name="reports" size={16} />
                                <span>Raporte</span>
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <div className="sidebar__section-label">Sistemi</div>
                            <NavLink to="/users" className={({ isActive }) => 'sidebar__nav-item' + (isActive ? ' sidebar__nav-item--active' : '')}>
                                <Icon name="users" size={16} />
                                <span>Përdoruesit</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="sidebar__footer">
                    <div className="sidebar__user">
                        <div className="sidebar__user-name">{user?.name}</div>
                        <div className="sidebar__user-role">{ROLE_LABELS[user?.role] || user?.role}</div>
                    </div>
                    <button className="sidebar__logout-btn" onClick={handleLogout}>
                        <Icon name="logout" size={15} />
                        <span>Dil</span>
                    </button>
                </div>
            </aside>

            <main className="app-content">
                <Outlet />
            </main>
        </div>
    );
}
