import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Ao carregar a página, verifica se já existe um token salvo
    useEffect(() => {
        const recoverUser = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    // Checa se o token não expirou
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setUser(decoded);
                    }
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };
        recoverUser();
    }, []);

    // 2. Função de Login (Chama o Java)
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                login: email,  // Precisa ser igual ao DTO do Java
                senha: password
            });

            const { token } = response.data;
            
            localStorage.setItem('token', token); // Salva no navegador
            const decoded = jwtDecode(token);
            setUser(decoded); // Salva no estado do React
            return true; // Sucesso
        } catch (error) {
            console.error("Erro ao logar", error);
            return false; // Falha
        }
    };

    // 3. Função de Logout
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signed: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};