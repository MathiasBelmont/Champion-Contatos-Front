import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function GestorDashboard() {
    const [pendentes, setPendentes] = useState([]);
    const [agentes, setAgentes] = useState([]); 
    const [agenteSelecionado, setAgenteSelecionado] = useState("");
    const [clientesDoAgente, setClientesDoAgente] = useState([]); 

    // --- ESTADOS DE FILTRO E SELEÇÃO ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('Todos');
    const [selecionados, setSelecionados] = useState([]); // Array de IDs selecionados
    const [agenteDestinoId, setAgenteDestinoId] = useState(""); // ID do agente que receberá os contatos
    const [isTransferring, setIsTransferring] = useState(false);

    // --- ESTADOS DO MODAL (As linhas que faltavam!) ---
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
            const res = await api.get(`/clientes/agente/${id}`);
            setClientesDoAgente(res.data);
        } catch (error) {
            console.error("Erro ao carregar carteira do agente", error);
        }
    }

    const handleAgenteChange = (e) => {
        const id = e.target.value;
        setAgenteSelecionado(id);
        setSearchTerm('');
        setFilterTipo('Todos');
        setSelecionados([]); // Limpa seleção ao trocar de agente
        carregarClientesPorAgente(id);
    }

    // --- LÓGICA DE SELEÇÃO E FILTRO ---
    const clientesFiltrados = clientesDoAgente.filter(c => {
        const term = searchTerm.toLowerCase();
        const matchSearch = (!searchTerm) || 
                            (c.nome && String(c.nome).toLowerCase().includes(term)) || 
                            (c.telefone && String(c.telefone).toLowerCase().includes(term));
        const matchTipo = filterTipo === 'Todos' || c.tipoContato === filterTipo;
        return matchSearch && matchTipo;
    });

    const toggleSelecionarTodos = () => {
        if (selecionados.length === clientesFiltrados.length) {
            setSelecionados([]);
        } else {
            setSelecionados(clientesFiltrados.map(c => c.id));
        }
    }

    const toggleUm = (id) => {
        if (selecionados.includes(id)) {
            setSelecionados(selecionados.filter(sid => sid !== id));
        } else {
            setSelecionados([...selecionados, id]);
        }
    }

    // --- LÓGICA DE TRANSFERÊNCIA EM LOTE ---
    const handleTransferir = async () => {
        if (!agenteDestinoId) {
            alert("Selecione um agente de destino.");
            return;
        }

        if (agenteDestinoId === agenteSelecionado) {
            alert("O agente de destino não pode ser o mesmo que o atual.");
            return;
        }

        const confirmacao = window.confirm(`Deseja transferir ${selecionados.length} contato(s) para o novo agente?`);
        if (!confirmacao) return;

        setIsTransferring(true);
        try {
            // Executa as realocações uma por uma usando o seu endpoint do Java
            for (const clienteId of selecionados) {
                await api.put(`/clientes/${clienteId}/realocar/${agenteDestinoId}`);
            }
            
            alert("Contatos transferidos com sucesso!");
            setSelecionados([]);
            setAgenteDestinoId("");
            carregarClientesPorAgente(agenteSelecionado); // Recarrega a lista atual
        } catch (error) {
            console.error("Erro na transferência", error);
            alert("Ocorreu um erro ao transferir alguns contatos.");
        } finally {
            setIsTransferring(false);
        }
    }

    const aprovar = async (id) => {
        try {
            await api.patch(`/clientes/${id}/aprovar`);
            setPendentes(pendentes.filter(c => c.id !== id));
            if (agenteSelecionado) carregarClientesPorAgente(agenteSelecionado);
            alert("Contato aprovado!");
        } catch (error) {
            alert("Erro ao aprovar contato.");
        }
    }

    const abrirModalNovo = () => { setUsuarioEdicao(null); reset(); setIsModalOpen(true); };
    const fecharModal = () => { setIsModalOpen(false); setUsuarioEdicao(null); reset(); };
    const onSubmitUsuario = async (data) => {
        try {
            if (usuarioEdicao) await api.put(`/usuarios/${usuarioEdicao.id}`, data);
            else await api.post('/usuarios', data);
            fecharModal();
            carregarAgentes();
        } catch (error) { alert("Erro ao salvar usuário."); }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-base-100 min-h-screen text-base-content">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-black border-l-4 border-[#e6151a] pl-4">Painel do Gestor</h1>
                <button onClick={abrirModalNovo} className="btn bg-[#e6151a] hover:bg-[#c41217] text-white border-none shadow-lg shadow-[#e6151a]/20">
                    + Novo Agente/Gestor
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* 1. SEÇÃO DE APROVAÇÕES */}
                <div className="card bg-white shadow-xl border-t-4 border-[#e6151a]">
                    <div className="card-body">
                        <h2 className="card-title mb-4 text-black">Aprovações Pendentes</h2>
                        {pendentes.length === 0 ? <p className="text-gray-500">Nenhum contato pendente.</p> : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead><tr><th>Cliente</th><th>Tipo</th><th>Agente</th><th>Ação</th></tr></thead>
                                    <tbody>
                                        {pendentes.map(c => (
                                            <tr key={c.id}>
                                                <td><div className="font-bold">{c.nome}</div><div className="text-sm opacity-50">{c.email}</div></td>
                                                <td><span className="badge badge-ghost">{c.tipoContato}</span></td>
                                                <td className="font-bold text-[#e6151a]">{c.agente?.nome}</td>
                                                <td><button onClick={() => aprovar(c.id)} className="btn bg-[#e6151a] btn-sm text-white border-none">Aprovar</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. SEÇÃO DE VISUALIZAÇÃO E TRANSFERÊNCIA */}
                <div className="card bg-white shadow-xl border-t-4 border-gray-800">
                    <div className="card-body p-4 md:p-6">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                            <h2 className="card-title text-black">Visualizar Carteira</h2>
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                                <select className="select select-bordered select-sm w-full sm:w-48 bg-white" value={agenteSelecionado} onChange={handleAgenteChange}>
                                    <option value="">Escolher Agente...</option>
                                    {agentes.map(ag => <option key={ag.id} value={ag.id}>{ag.nome}</option>)}
                                </select>
                                <select className="select select-bordered select-sm bg-white" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} disabled={!agenteSelecionado}>
                                    <option value="Todos">Todos os Tipos</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Cliente">Cliente</option>
                                    <option value="Parceiro">Parceiro</option>
                                </select>
                                <input type="text" placeholder="Buscar..." className="input input-bordered input-sm w-full sm:w-56 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={!agenteSelecionado} />
                            </div>
                        </div>

                        {/* BARRA DE TRANSFERÊNCIA ATIVA SE HOUVER SELECIONADOS */}
                        {selecionados.length > 0 && (
                            <div className="bg-[#e6151a]/10 p-4 rounded-lg border border-[#e6151a] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                                <span className="text-[#e6151a] font-bold">
                                    {selecionados.length} contato(s) selecionado(s)
                                </span>
                                <div className="flex gap-2 items-center w-full sm:w-auto">
                                    <select 
                                        className="select select-bordered select-sm bg-white flex-1 sm:w-48"
                                        value={agenteDestinoId}
                                        onChange={(e) => setAgenteDestinoId(e.target.value)}
                                    >
                                        <option value="">Transferir para...</option>
                                        {agentes.filter(a => a.id.toString() !== agenteSelecionado).map(ag => (
                                            <option key={ag.id} value={ag.id}>{ag.nome}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={handleTransferir}
                                        disabled={isTransferring || !agenteDestinoId}
                                        className="btn btn-sm bg-[#e6151a] text-white border-none hover:bg-[#c41217]"
                                    >
                                        {isTransferring ? "Processando..." : "Confirmar"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!agenteSelecionado ? (
                            <div className="text-center py-10 opacity-40"><p>Selecione um agente para gerenciar a carteira.</p></div>
                        ) : clientesFiltrados.length === 0 ? (
                            <p className="text-gray-500 text-center py-10">Nenhum contato encontrado.</p>
                        ) : (
                            <div className="overflow-x-auto overflow-y-auto max-h-[400px] border border-gray-100 rounded-lg relative">
                                <table className="table table-zebra w-full">
                                    <thead className="sticky top-0 bg-gray-100 z-10">
                                        <tr>
                                            <th className="w-10">
                                                <input 
                                                    type="checkbox" 
                                                    className="checkbox checkbox-sm border-[#e6151a] checked:bg-[#e6151a]" 
                                                    checked={selecionados.length === clientesFiltrados.length && clientesFiltrados.length > 0}
                                                    onChange={toggleSelecionarTodos}
                                                />
                                            </th>
                                            <th>Nome / Email</th>
                                            <th>Telefone</th>
                                            <th>Tipo</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientesFiltrados.map(cli => (
                                            <tr key={cli.id} className={selecionados.includes(cli.id) ? 'bg-[#e6151a]/5' : ''}>
                                                <td>
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox checkbox-sm border-[#e6151a] checked:bg-[#e6151a]" 
                                                        checked={selecionados.includes(cli.id)}
                                                        onChange={() => toggleUm(cli.id)}
                                                    />
                                                </td>
                                                <td><div className="font-bold">{cli.nome}</div><div className="text-sm opacity-50">{cli.email}</div></td>
                                                <td className="font-mono">{cli.telefone || "-"}</td>
                                                <td><span className={`badge border-none text-white ${cli.tipoContato === 'Cliente' ? 'bg-[#e6151a]' : 'bg-gray-400'}`}>{cli.tipoContato}</span></td>
                                                <td><span className={`badge ${cli.aprovado ? 'badge-success' : 'badge-warning'} badge-outline`}>{cli.aprovado ? "Aprovado" : "Pendente"}</span></td>
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
                        <h3 className="font-bold text-lg mb-4 text-black">{usuarioEdicao ? "Editar Usuário" : "Cadastrar Novo Usuário"}</h3>
                        <form onSubmit={handleSubmit(onSubmitUsuario)} className="space-y-4">
                            <div className="form-control"><label className="label"><span className="label-text">Nome</span></label><input type="text" className="input input-bordered bg-white" {...register("nome", { required: true })} /></div>
                            <div className="form-control"><label className="label"><span className="label-text">E-mail</span></label><input type="email" className="input input-bordered bg-white" {...register("login", { required: true })} /></div>
                            {!usuarioEdicao && <div className="form-control"><label className="label"><span className="label-text">Senha</span></label><input type="password" placeholder="******" className="input input-bordered bg-white" {...register("senha", { required: true })} /></div>}
                            <div className="form-control"><label className="label"><span className="label-text">Nível</span></label><select className="select select-bordered bg-white" {...register("role", { required: true })}><option value="AGENTE">Agente</option><option value="GESTOR">Gestor</option></select></div>
                            <div className="modal-action"><button type="button" onClick={fecharModal} className="btn btn-ghost">Cancelar</button><button type="submit" className="btn bg-[#e6151a] text-white border-none hover:bg-[#c41217]">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}