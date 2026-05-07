import React from 'react';

export default function ClientList({ clientes, isAdmin, onEdit, onDelete, onCopiarTelefone }) {
    if (!clientes || clientes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 opacity-50 text-gray-500">
                <p>Nenhum contato encontrado.</p>
            </div>
        );
    }

    // Função auxiliar para mascarar/censurar o telefone
    const renderizarTelefone = (cliente) => {
        if (!cliente.telefone) return "-";
        if (cliente.aprovado) return cliente.telefone;
        
        // Retorna um texto censurado para contatos pendentes
        return <span className="text-gray-400 italic">(XX) XXXXX-XXXX</span>;
    };

    return (
        <div className="overflow-x-auto mt-4">
            <table className="table w-full">
                <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                        <th>Nome / Email</th>
                        <th>Contato</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {clientes.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td>
                                <div className="font-bold text-gray-800 text-lg">{c.nome}</div>
                                <div className="text-sm text-gray-500">{c.email}</div>
                            </td>
                            <td className="font-mono text-sm text-gray-600">
                                {/* Aplica a regra visual de censura */}
                                {renderizarTelefone(c)}
                            </td>
                            <td>
                                <span className={`badge border-0 font-bold text-white ${c.tipoContato === 'Cliente' ? 'badge-primary' : 'bg-gray-400'}`}>
                                    {c.tipoContato}
                                </span>
                            </td>
                            <td>
                                {c.aprovado ?
                                    <div className="flex items-center gap-2 text-success font-bold bg-success/10 px-3 py-1 rounded-lg w-fit">
                                        <div className="w-2 h-2 rounded-full bg-success"></div> Aprovado
                                    </div> :
                                    <div className="flex items-center gap-2 text-warning font-bold bg-warning/10 px-3 py-1 rounded-lg w-fit">
                                        <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div> Pendente
                                    </div>
                                }
                            </td>
                            <td className="flex gap-2">
                                
                                {/* BOTÃO DE COPIAR */}
                                <button 
                                    onClick={() => onCopiarTelefone && onCopiarTelefone(c)}
                                    disabled={!c.aprovado} // Desabilita o botão se não estiver aprovado
                                    className="btn btn-neutral btn-sm text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    title={c.aprovado ? "Copiar Número" : "Aguardando Aprovação"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copiar
                                </button>

                                {/* BOTÕES DE EDITAR E EXCLUIR (Apenas Admin/Gestor) */}
                                {isAdmin && (
                                    <>
                                        <button 
                                            onClick={() => onEdit && onEdit(c)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => onDelete && onDelete(c.id)}
                                            className="btn btn-sm btn-error"
                                        >
                                            Excluir
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}