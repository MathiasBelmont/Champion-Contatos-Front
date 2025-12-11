import { useEffect, useState } from 'react';
import api from '../services/api';

export default function GestorDashboard() {
    const [pendentes, setPendentes] = useState([]);

    useEffect(() => {
        carregarPendentes();
    }, []);

    const carregarPendentes = async () => {
        try {
            const res = await api.get('/clientes/pendentes');
            setPendentes(res.data);
        } catch (error) {
            console.error("Erro ao carregar pendentes", error);
        }
    }

    const aprovar = async (id) => {
        try {
            // Agora o PATCH vai funcionar porque liberamos no Java
            await api.patch(`/clientes/${id}/aprovar`);
            // Remove o item da lista visualmente sem precisar recarregar tudo
            setPendentes(pendentes.filter(c => c.id !== id));
            alert("Contato aprovado!");
        } catch (error) {
            console.error("Erro ao aprovar", error);
            alert("Erro ao aprovar contato.");
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Painel do Gestor</h1>
            
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title mb-4">Aprovações Pendentes</h2>
                    
                    {pendentes.length === 0 ? (
                        <p className="text-gray-500">Nenhum contato pendente de aprovação.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Cliente / Email</th>
                                        <th>Tipo</th>
                                        {/* Nova Coluna */}
                                        <th>Agente Solicitante</th> 
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendentes.map(c => (
                                        <tr key={c.id}>
                                            <td>
                                                <div className="font-bold">{c.nome}</div>
                                                <div className="text-sm opacity-50">{c.email}</div>
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost badge-sm">{c.tipoContato}</span>
                                            </td>
                                            
                                            {/* Exibe o nome do Agente */}
                                            {/* O '?' serve para não dar erro se o agente for nulo */}
                                            <td className="font-medium text-secondary">
                                                {c.agente ? c.agente.nome : "Sem Agente"}
                                            </td>
                                            
                                            <td>
                                                <button 
                                                    onClick={() => aprovar(c.id)} 
                                                    className="btn btn-success btn-sm text-white">
                                                    Aprovar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}