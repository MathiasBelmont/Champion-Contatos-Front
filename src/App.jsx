import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import LoginPage from './pages/LoginPage';

// --- Componente de Proteção de Rota ---
// Se não tiver logado, manda pro Login. Se tiver, mostra a página.
const PrivateRoute = ({ children }) => {
  const { signed, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return signed ? children : <Navigate to="/" />;
};

// --- Tela de Dashboard (Temporária) ---
const Dashboard = () => {
  const { logout, user } = useContext(AuthContext);
  return (
    <div className="navbar bg-base-100 shadow-md px-10">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Champion Dashboard</a>
      </div>
      <div className="flex-none gap-4">
        <span className="text-sm font-bold">Olá, {user?.sub}</span>
        <button onClick={logout} className="btn btn-error btn-sm">Sair</button>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;