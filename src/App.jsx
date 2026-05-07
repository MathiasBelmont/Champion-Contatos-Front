import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import LoginPage from './pages/LoginPage';
import AgenteDashboard from './pages/AgenteDashboard';
import GestorDashboard from './pages/GestorDashboard';
import GerenciamentoUsuarios from './pages/GerenciamentoUsuarios';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useContext(AuthContext);
  if (loading) return <div className="loading loading-spinner"></div>;
  return signed ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const { signed, loading, user } = useContext(AuthContext);
  if (loading) return <div className="loading loading-spinner"></div>;
  if (!signed) return <Navigate to="/" />;
  
  // Agora validamos se o papel é GESTOR_TI
  if (user?.role !== 'GESTOR_TI') return <Navigate to="/dashboard" />;
  return children;
};

const DashboardManager = () => {
  const { user, logout } = useContext(AuthContext);

  // Redirecionamento automático: se for GESTOR_TI e cair aqui, vai para a página de gestão
  if (user?.role === 'GESTOR_TI') {
    return <Navigate to="/admin/usuarios" />;
  }

  return (
    <div>
      {/* Navbar com infos do usuário */}
      <div className="navbar bg-base-300 px-8">
        <div className="flex-1 font-bold text-xl">Champion CRM</div>
        <div className="flex-none gap-4">
          <span>{user?.sub} ({user?.role})</span>
          <button onClick={logout} className="btn btn-sm btn-error">Sair</button>
        </div>
      </div>

      {/* Renderização condicional entre GESTOR e AGENTE */}
      {user?.role === 'GESTOR' ? <GestorDashboard /> : <AgenteDashboard />}
    </div>
  );
}

function App() {
  return (
    <div data-theme="champion-theme" className="min-h-screen bg-base-100">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardManager />
              </PrivateRoute>
            } />
            <Route path="/admin/usuarios" element={
              <AdminRoute>
                <GerenciamentoUsuarios />
              </AdminRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;