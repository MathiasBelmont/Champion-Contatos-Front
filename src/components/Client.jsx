import React from 'react';


export default function ClientList({ clientes, isAdmin, onEdit, onDelete }) {
    if (!clientes || clientes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 opacity-50 text-gray-500">
                <p>Nenhum contato encontrado.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto mt-4">
            <table className="table w-full">
                <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                        <th>Nome / Email</th>
                        <th>Contato</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        {isAdmin && <th>Ações</th>}
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
                                {c.telefone || "-"}
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
                            {isAdmin && (
                                <td className="flex gap-2">
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
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}