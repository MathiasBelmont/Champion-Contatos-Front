import api from './api'; // Importa a sua própria configuração de API (com o localhost)

export const discarRamal = async (telefoneCliente, agentId) => {
    // Remove parênteses e traços
    const numeroLimpo = telefoneCliente.replace(/\D/g, '');

    try {
        // Agora o React pede pro SEU Spring Boot fazer a ligação!
        // Não há problema de CORS pois o seu React já está autorizado a falar com o seu Java
        const response = await api.post('/vonix/discar', {
            numero: numeroLimpo,
            agentId: agentId
        });
        
        return response.data;
    } catch (error) {
        console.error("Erro ao solicitar ligação ao backend:", error);
        throw error; 
    }
};