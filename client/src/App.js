import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import POS         from './pages/POS';
import Products    from './pages/Products';
import StockView   from './pages/StockView';
import StockReceive from './pages/StockReceive';
import StockAdjust from './pages/StockAdjust';
import Users       from './pages/Users';
import Reports     from './pages/Reports';

import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Full-screen POS */}
                    <Route path="/pos" element={
                        <ProtectedRoute>
                            <POS />
                        </ProtectedRoute>
                    } />

                    {/* Sidebar layout pages */}
                    <Route element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="/products" element={
                            <ProtectedRoute roles={['admin', 'manager']}>
                                <Products />
                            </ProtectedRoute>
                        } />
                        <Route path="/stock" element={
                            <ProtectedRoute roles={['admin', 'manager']}>
                                <StockView />
                            </ProtectedRoute>
                        } />
                        <Route path="/stock/receive" element={
                            <ProtectedRoute roles={['admin', 'manager']}>
                                <StockReceive />
                            </ProtectedRoute>
                        } />
                        <Route path="/stock/adjust" element={
                            <ProtectedRoute roles={['admin', 'manager']}>
                                <StockAdjust />
                            </ProtectedRoute>
                        } />
                        <Route path="/reports" element={
                            <ProtectedRoute roles={['admin', 'manager']}>
                                <Reports />
                            </ProtectedRoute>
                        } />
                        <Route path="/users" element={
                            <ProtectedRoute roles={['admin']}>
                                <Users />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
