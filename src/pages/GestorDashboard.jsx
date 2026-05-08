import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function GestorDashboard() {
    const [pendentes, setPendentes] = useState([]);
    const [agentes, setAgentes] = useState([]); // Lista de agentes
    const [agenteSelecionado, setAgenteSelecionado] = useState("");
    const [clientesDoAgente, setClientesDoAgente] = useState([]); // Clientes do agente escolhido

    // Estados do Modal de Usuários
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioEdicao, setUsuarioEdicao] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        carregarPendentes();
        carregarAgentes();
    }, []);

    const carregarPendentes = async () => {
        try {
            const res = await api.get('/clientes/pendentes');
            setPendentes(res.data);
        } catch (error) {
            console.error("Erro ao carregar pendentes", error);
        }
    }

    const carregarAgentes = async () => {
        try {
            const res = await api.get('/usuarios');
            // Filtra apenas quem é agente para o dropdown
            const listaAgentes = res.data.filter(u => u.role === 'AGENTE');
            setAgentes(listaAgentes);
        } catch (error) {
            console.error("Erro ao carregar agentes", error);
        }
    }

    const carregarClientesPorAgente = async (id) => {
        if (!id) {
            setClientesDoAgente([]);
            return;
        }
        try {
            // Endpoint que busca clientes vinculados a um ID de usuário específico
            const res = await api.get(`/clientes/agente/${id}`);
            setClientesDoAgente(res.data);
        } catch (error) {
            console.error("Erro ao carregar carteira do agente", error);
        }
    }

    const handleAgenteChange = (e) => {
        const id = e.target.value;
        setAgenteSelecionado(id);
        carregarClientesPorAgente(id);
    }

    const aprovar = async (id) => {
        try {
            await api.patch(`/clientes/${id}/aprovar`);
            setPendentes(pendentes.filter(c => c.id !== id));
            alert("Contato aprovado!");
        } catch (error) {
            console.error("Erro ao aprovar", error);
            alert("Erro ao aprovar contato.");
        }
    }

    // Ações do Modal
    const abrirModalNovo = () => {
        setUsuarioEdicao(null);
        reset();
        setIsModalOpen(true);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setUsuarioEdicao(null);
        reset();
    };

    const onSubmitUsuario = async (data) => {
        try {
            if (usuarioEdicao) {
                await api.put(`/usuarios/${usuarioEdicao.id}`, data);
                alert("Usuário atualizado com sucesso!");
            } else {
                await api.post('/usuarios', data);
                alert("Usuário cadastrado com sucesso!");
            }
            fecharModal();
        } catch (error) {
            console.error("Erro ao salvar usuário", error);
            alert("Erro ao salvar usuário.");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-base-100 min-h-screen">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-black border-l-4 border-[#e6151a] pl-4">Painel do Gestor</h1>
                <button 
                    onClick={abrirModalNovo} 
                    className="btn bg-[#e6151a] hover:bg-[#c41217] text-white border-none shadow-lg shadow-[#e6151a]/20"
                >
                    + Novo Agente/Gestor
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                
                {/* 1. SEÇÃO DE APROVAÇÕES */}
                <div className="card bg-white shadow-xl border-t-4 border-[#e6151a]">
                    <div className="card-body">
                        <h2 className="card-title mb-4 text-black">Aprovações Pendentes</h2>
                        {pendentes.length === 0 ? (
                            <p className="text-gray-500">Nenhum contato pendente de aprovação.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Cliente / Email</th>
                                            <th>Tipo</th>
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
                                                <td><span className="badge badge-ghost">{c.tipoContato}</span></td>
                                                <td className="font-medium text-[#e6151a]">{c.agente?.nome || "Sem Agente"}</td>
                                                <td>
                                                    <button onClick={() => aprovar(c.id)} className="btn bg-[#e6151a] btn-sm text-white border-none hover:bg-[#c41217]">
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

                {/* 2. SEÇÃO DE VISUALIZAÇÃO POR AGENTE (ESPELHO) */}
                <div className="card bg-white shadow-xl border-t-4 border-gray-800">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <h2 className="card-title text-black">Visualizar Carteira por Agente</h2>
                            <select 
                                className="select select-bordered w-full md:w-64 bg-white focus:border-[#e6151a] focus:outline-[#e6151a]"
                                value={agenteSelecionado}
                                onChange={handleAgenteChange}
                            >
                                <option value="">Selecione um Agente...</option>
                                {agentes.map(ag => (
                                    <option key={ag.id} value={ag.id}>{ag.nome}</option>
                                ))}
                            </select>
                        </div>

                        {!agenteSelecionado ? (
                            <div className="text-center py-10 opacity-40">
                                <p>Selecione um agente acima para ver seus clientes.</p>
                            </div>
                        ) : clientesDoAgente.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">Este agente ainda não possui clientes cadastrados.</p>
                        ) : (
                            <div className="overflow-x-auto max-h-[400px]">
                                <table className="table table-zebra w-full">
                                    <thead className="sticky top-0 bg-gray-100 z-10">
                                        <tr>
                                            <th>Nome</th>
                                            <th>Email</th>
                                            <th>Telefone</th>
                                            <th>Tipo</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientesDoAgente.map(cli => (
                                            <tr key={cli.id}>
                                                <td className="font-bold">{cli.nome}</td>
                                                <td>{cli.email}</td>
                                                <td>{cli.telefone}</td>
                                                <td><span className={`badge border-none text-white ${cli.tipoContato === 'Cliente' ? 'bg-[#e6151a]' : 'bg-gray-400'}`}>{cli.tipoContato}</span></td>
                                                <td>
                                                    <span className={`badge ${cli.aprovado ? 'badge-success' : 'badge-warning'} badge-outline font-bold`}>
                                                        {cli.aprovado ? "Aprovado" : "Pendente"}
                                                    </span>
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

            {/* MODAL DE CADASTRO/EDIÇÃO */}
            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box bg-white">
                        <h3 className="font-bold text-lg mb-4 text-black">
                            {usuarioEdicao ? "Editar Usuário" : "Cadastrar Novo Usuário"}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmitUsuario)} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Nome Completo</span></label>
                                <input type="text" className="input input-bordered w-full bg-white focus:border-[#e6151a] focus:outline-[#e6151a]" {...register("nome", { required: true })} />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">E-mail</span></label>
                                <input type="email" className="input input-bordered w-full bg-white focus:border-[#e6151a] focus:outline-[#e6151a]" {...register("login", { required: true })} />
                            </div>
                            {!usuarioEdicao && (
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Senha</span></label>
                                    <input type="password" placeholder="******" className="input input-bordered w-full bg-white focus:border-[#e6151a] focus:outline-[#e6151a]" {...register("senha", { required: true })} />
                                </div>
                            )}
                            <div className="form-control">
                                <label className="label"><span className="label-text">Nível de Acesso</span></label>
                                <select className="select select-bordered bg-white focus:border-[#e6151a] focus:outline-[#e6151a]" {...register("role", { required: true })}>
                                    <option value="AGENTE">Agente de Vendas</option>
                                    <option value="GESTOR">Gestor</option>
                                </select>
                            </div>
                            <div className="modal-action">
                                <button type="button" onClick={fecharModal} className="btn btn-ghost">Cancelar</button>
                                <button type="submit" className="btn bg-[#e6151a] text-white border-none hover:bg-[#c41217]">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}