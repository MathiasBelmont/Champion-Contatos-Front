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
  
  if (user?.role !== 'GESTOR_TI') return <Navigate to="/dashboard" />;
  return children;
};

const DashboardManager = () => {
  const { user, logout } = useContext(AuthContext);

  if (user?.role === 'GESTOR_TI') {
    return <Navigate to="/admin/usuarios" />;
  }

  return (
    <div data-theme="champion-theme" className="min-h-screen bg-slate-50">
      {/* Navbar estática e apresentável baseada no usuário logado no mock */}
      <div className="navbar bg-white shadow-sm border-b border-slate-200/80 px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Champion <span className="text-[#e6151a]">CRM</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-800">{user?.sub}</span>
            <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <button onClick={logout} className="btn btn-sm min-h-0 h-9 bg-red-50 hover:bg-red-100 text-[#e6151a] border border-red-200 px-4 normal-case font-bold rounded-lg transition-all">
            Sair
          </button>
        </div>
      </div>

      {/* Renderização condicional nativa */}
      {user?.role === 'GESTOR' ? <GestorDashboard /> : <AgenteDashboard />}
    </div>
  );
}

function App() {
  return (
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
          {/* Rota coringa caso caia em caminho inexistente */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;