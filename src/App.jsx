import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import LoginPage from './pages/LoginPage';
import AgenteDashboard from './pages/AgenteDashboard';
import GestorDashboard from './pages/GestorDashboard';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useContext(AuthContext);
  if (loading) return <div className="loading loading-spinner"></div>;
  return signed ? children : <Navigate to="/" />;
};

// Componente inteligente que decide qual Dashboard mostrar
const DashboardManager = () => {
    const { user, logout } = useContext(AuthContext);
    console.log("Dados do Usuário:", user);
    return (
        <div>
            {/* Navbar Simples */}
            <div className="navbar bg-base-300 px-8">
                <div className="flex-1 font-bold text-xl">Champion CRM</div>
                <div className="flex-none gap-4">
                    <span>{user?.sub} ({user?.role})</span>
                    <button onClick={logout} className="btn btn-sm btn-error">Sair</button>
                </div>
            </div>

            {/* Decide a tela baseado na Role */}
            {user?.role === 'ADMIN' ? <GestorDashboard /> : <AgenteDashboard />}
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;