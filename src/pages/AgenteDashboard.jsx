import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AgenteDashboard() {
    const { register, handleSubmit, reset } = useForm();
    const [meusClientes, setMeusClientes] = useState([]);

    useEffect(() => {
        carregarContatos();
    }, []);

    const carregarContatos = async () => {
        try {
            const res = await api.get('/clientes/meus');
            setMeusClientes(res.data);
        } catch (error) {
            console.error("Erro ao buscar clientes", error);
        }
    }

    const onSubmit = async (data) => {
        try {
            await api.post('/clientes', data);
            alert("Cliente cadastrado com sucesso!");
            reset(); 
            carregarContatos(); 
        } catch (error) {
            alert("Erro ao cadastrar. Verifique os dados.");
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto text-base-content">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    {/* TÍTULO EM VERMELHO (SECONDARY) */}
                    <h1 className="text-3xl font-bold text-secondary">Painel do Agente</h1>
                    <p className="text-gray-600 mt-1">Gerencie sua carteira de clientes e leads.</p>
                </div>
                <div className="stats shadow bg-white border border-gray-200">
                    <div className="stat place-items-center">
                        <div className="stat-title text-gray-500 font-semibold">Total na Carteira</div>
                        {/* NÚMERO EM AZUL (PRIMARY) */}
                        <div className="stat-value text-primary">{meusClientes.length}</div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- SEÇÃO 1: FORMULÁRIO (Esquerda) --- */}
                <div className="lg:col-span-1">
                    {/* BORDA SUPERIOR AZUL (PRIMARY) */}
                    <div className="card bg-white shadow-xl border-t-4 border-primary">
                        <div className="card-body">
                            {/* TÍTULO DO CARD EM VERMELHO (SECONDARY) */}
                            <h2 className="card-title text-secondary mb-4 flex items-center gap-2 border-b pb-2">
                                {/* ÍCONE EM AZUL (PRIMARY) */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Novo Cadastro
                            </h2>
                            
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text font-medium text-gray-700">Nome Completo</span>
                                    </label>
                                    <input 
                                        {...register("nome")} 
                                        placeholder="Ex: João Silva" 
                                        className="input input-bordered w-full bg-white focus:input-primary" 
                                        required 
                                    />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label py-1"><span className="label-text font-medium text-gray-700">E-mail</span></label>
                                    <input 
                                        {...register("email")} 
                                        placeholder="joao@cliente.com" 
                                        type="email" 
                                        className="input input-bordered w-full bg-white focus:input-primary" 
                                        required 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-control">
                                        <label className="label py-1"><span className="label-text font-medium text-gray-700">Telefone</span></label>
                                        <input 
                                            {...register("telefone")} 
                                            placeholder="(00) 00000-0000" 
                                            className="input input-bordered w-full bg-white focus:input-primary" 
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label py-1"><span className="label-text font-medium text-gray-700">Tipo</span></label>
                                        <select {...register("tipoContato")} className="select select-bordered w-full bg-white focus:select-primary">
                                            <option value="Lead">Lead</option>
                                            <option value="Cliente">Cliente</option>
                                            <option value="Parceiro">Parceiro</option>
                                        </select>
                                    </div>
                                </div>

                                {/* BOTÃO AZUL (PRIMARY) */}
                                <button className="btn btn-primary w-full mt-4 text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                    Salvar Contato
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- SEÇÃO 2: LISTA (Direita) --- */}
                <div className="lg:col-span-2">
                    <div className="card bg-white shadow-xl h-full">
                        <div className="card-body p-0 md:p-6">
                            {/* TÍTULO EM VERMELHO (SECONDARY) */}
                            <h2 className="card-title text-secondary px-4 pt-4 md:px-0 md:pt-0">Minha Carteira</h2>

                            {meusClientes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 opacity-50 text-gray-500">
                                    <p>Nenhum contato encontrado.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto mt-4">
                                    <table className="table w-full">
                                        <thead className="bg-gray-100 text-gray-700 font-bold">
                                            <tr>
                                                <th>Nome / Email</th>
                                                <th>Contato</th>
                                                <th>Tipo</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {meusClientes.map(c => (
                                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                    <td>
                                                        <div className="font-bold text-gray-800 text-lg">{c.nome}</div>
                                                        <div className="text-sm text-gray-500">{c.email}</div>
                                                    </td>
                                                    <td className="font-mono text-sm text-gray-600">
                                                        {c.telefone || "-"}
                                                    </td>
                                                    <td>
                                                        {/* BADGE AZUL SE FOR CLIENTE */}
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}