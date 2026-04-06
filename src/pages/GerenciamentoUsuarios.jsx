import { useEffect, useState } from 'react';
import api from '../services/api';

export default function GerenciamentoUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {
        try {
            setLoading(true);
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            // Em caso de erro, definimos array vazio para evitar problemas na renderização
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto text-base-content">
            {/* Cabeçalho superior com título e estatísticas */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black">Gerenciamento de Usuários</h1>
                    <p className="text-gray-600 mt-1">Visualize e gerencie os agentes e gestores do sistema.</p>
                </div>
                <div className="stats shadow bg-white border border-gray-200">
                    <div className="stat place-items-center">
                        <div className="stat-title text-gray-500 font-semibold">Total de Usuários</div>
                        <div className="stat-value text-primary">{usuarios.length}</div>
                    </div>
                </div>
            </div>

            {/* Container principal da Tabela */}
            <div className="card bg-white shadow-xl border-t-4 border-primary">
                <div className="card-body">
                    {/* Cabeçalho da tabela com botão de ação */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="card-title text-black flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Lista de Usuários Cadastrados
                        </h2>
                        <button className="btn btn-primary btn-sm text-black w-32 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            + Novo Usuário
                        </button>
                    </div>

                    {/* Exibição condicional de carregamento, lista vazia ou tabela */}
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 opacity-50 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-lg">Nenhum usuário encontrado no sistema.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-gray-100 text-gray-700 font-bold">
                                    <tr>
                                        <th>Identificação</th>
                                        <th>Permissão / Cargo</th>
                                        <th>Status</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {usuarios.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Coluna de Identidade */}
                                            <td>
                                                <div className="font-bold text-gray-800 text-lg">{u.nome || "Usuário " + u.id}</div>
                                                <div className="text-sm text-gray-500">{u.email || u.login}</div>
                                            </td>
                                            {/* Coluna de Cargo/Role */}
                                            <td>
                                                <span className={`badge border-0 font-bold text-white ${(u.role === 'ADMIN' || u.role === 'GESTOR') ? 'badge-primary' : 'bg-gray-400'
                                                    }`}>
                                                    {u.role || u.cargo || 'AGENTE'}
                                                </span>
                                            </td>
                                            {/* Coluna de Status */}
                                            <td>
                                                {(u.ativo !== false) ? (
                                                    <div className="flex items-center gap-2 text-success font-bold bg-success/10 px-3 py-1 rounded-lg w-fit">
                                                        <div className="w-2 h-2 rounded-full bg-success"></div> Ativo
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-error font-bold bg-error/10 px-3 py-1 rounded-lg w-fit">
                                                        <div className="w-2 h-2 rounded-full bg-error"></div> Inativo
                                                    </div>
                                                )}
                                            </td>
                                            {/* Coluna de Ações */}
                                            <td className="text-right">
                                                <button className="btn btn-ghost btn-sm text-primary hover:bg-primary/10">
                                                    Editar
                                                </button>
                                                <button className="btn btn-ghost btn-sm text-error hover:bg-error/10">
                                                    Remover
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
