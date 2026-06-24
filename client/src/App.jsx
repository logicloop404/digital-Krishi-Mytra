import { Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import RecommendationsPage from './pages/RecommendationsPage';
import WeatherPage from './pages/WeatherPage';
import SchemesPage from './pages/SchemesPage';
import CommunityPage from './pages/CommunityPage';
import DiseasePage from './pages/DiseasePage';
import AdminPage from './pages/AdminPage';

function Protected({ children, adminOnly = false }) { const { user, loading } = useAuth(); if (loading) return <div className="grid min-h-screen place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-600 border-t-transparent" /></div>; if (!user) return <Navigate to="/login" replace />; if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />; return children; }
function PublicOnly({ children }) { const { user } = useAuth(); return user ? <Navigate to="/" replace /> : children; }
export default function App() { return <ErrorBoundary><Routes><Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} /><Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} /><Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} /><Route path="/reset-password/:token" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} /><Route element={<Protected><Layout /></Protected>}><Route index element={<DashboardPage />} /><Route path="dashboard" element={<DashboardPage />} /><Route path="recommendations" element={<RecommendationsPage />} /><Route path="weather" element={<WeatherPage />} /><Route path="schemes" element={<SchemesPage />} /><Route path="community" element={<CommunityPage />} /><Route path="disease" element={<DiseasePage />} /><Route path="admin" element={<Protected adminOnly><AdminPage /></Protected>} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></ErrorBoundary>; }
