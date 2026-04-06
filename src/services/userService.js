// src/services/userService.js
import api from './api';

// Rota base para os endpoints de usuário no backend
const BASE_URL = '/api/usuarios';

const userService = {
    // Listar todos os usuários (Apenas Gestor/TI)
    getAllUsuarios: async () => {
        try {
            const response = await api.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            throw error;
        }
    },

    // Buscar um usuário específico por ID
    getUsuarioById: async (id) => {
        try {
            const response = await api.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar o usuário ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo usuário (Agente, Gestor ou TI)
    createUsuario: async (usuarioData) => {
        try {
            const response = await api.post(BASE_URL, usuarioData);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            throw error;
        }
    },

    // Atualizar dados de um usuário existente
    updateUsuario: async (id, usuarioData) => {
        try {
            const response = await api.put(`${BASE_URL}/${id}`, usuarioData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar usuário ${id}:`, error);
            throw error;
        }
    },

    // Deletar um usuário
    deleteUsuario: async (id) => {
        try {
            const response = await api.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao deletar usuário ${id}:`, error);
            throw error;
        }
    }
};

export default userService;