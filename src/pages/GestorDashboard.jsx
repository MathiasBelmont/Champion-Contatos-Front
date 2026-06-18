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
    const [selecionados, setSelecionados] = useState([]); 
    const [agenteDestinoId, setAgenteDestinoId] = useState(""); 
    const [isTransferring, setIsTransferring] = useState(false);

    // --- ESTADOS DO MODAL ---
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
        setSelecionados([]); 
        carregarClientesPorAgente(id);
    }

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

    const handleTransferir = async () => {
        if (!agenteDestinoId) return;
        const confirmacao = window.confirm(`Deseja transferir ${selecionados.length} contato(s)?`);
        if (!confirmacao) return;
        
        setIsTransferring(true);
        try {
            for (const clienteId of selecionados) {
                await api.put(`/clientes/${clienteId}/realocar/${agenteDestinoId}`);
            }
            alert("Contatos transferidos com sucesso!");
            setSelecionados([]);
            setAgenteDestinoId("");
            carregarClientesPorAgente(agenteSelecionado);
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
            alert("Contato aprovado com sucesso!");
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
            alert("Usuário salvo com sucesso!");
        } catch (error) { 
            alert("Erro ao salvar usuário."); 
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-800">
            
            {/* HEADER DA TELA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 px-1 pt-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 border-l-4 border-[#e6151a] pl-4 tracking-tight">
                        Painel do Gestor
                    </h1>
                    <p className="text-slate-500 text-sm ml-4 mt-1">Gerencie as aprovações e distribuições de carteiras</p>
                </div>
                <button onClick={abrirModalNovo} className="btn bg-[#e6151a] hover:bg-[#c41217] text-white border-none shadow-md px-6 normal-case font-bold gap-2 h-auto py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Novo Agente / Gestor
                </button>
            </div>

            <div className="grid grid-cols-1 gap-10">
                
                {/* 1. SEÇÃO DE APROVAÇÕES */}
                <div className="card bg-white shadow-sm border border-slate-200/80 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#e6151a]"></span>
                            Aprovações Pendentes
                        </h2>
                    </div>
                    <div className="p-0">
                        {pendentes.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-medium">Nenhum contato pendente de aprovação.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                            <th className="bg-transparent py-4 pl-6">Cliente / E-mail</th>
                                            <th className="bg-transparent py-4">Tipo</th>
                                            <th className="bg-transparent py-4">Agente Responsável</th>
                                            <th className="bg-transparent py-4 text-center pr-6">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendentes.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-4 pl-6">
                                                    <div className="font-semibold text-slate-900">{c.nome}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{c.email}</div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="badge bg-slate-100 text-slate-700 border-none font-medium px-3 py-2.5">{c.tipoContato}</span>
                                                </td>
                                                <td className="py-4 font-semibold text-slate-700">{c.agente?.nome}</td>
                                                <td className="py-4 text-center pr-6">
                                                    <button onClick={() => aprovar(c.id)} className="btn bg-[#e6151a] hover:bg-[#c41217] btn-sm text-white border-none px-4 normal-case font-bold shadow-sm rounded-md">
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

                {/* 2. SEÇÃO DE VISUALIZAÇÃO E CARTEIRA */}
                <div className="card bg-white shadow-sm border border-slate-200/80 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                                Visualizar Carteira
                            </h2>
                            
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <select 
                                    className="select select-sm h-11 bg-white border-2 border-slate-700 text-slate-900 font-semibold pl-4 focus:outline-none focus:ring-2 focus:ring-[#e6151a] focus:border-[#e6151a] w-full sm:w-52 transition-all" 
                                    value={agenteSelecionado} 
                                    onChange={handleAgenteChange}
                                >
                                    <option value="">Escolher Agente...</option>
                                    {agentes.map(ag => <option key={ag.id} value={ag.id}>{ag.nome}</option>)}
                                </select>

                                <select 
                                    className="select select-sm h-11 bg-white border-2 border-slate-700 text-slate-900 font-semibold pl-4 focus:outline-none focus:ring-2 focus:ring-[#e6151a] focus:border-[#e6151a] w-full sm:w-44 transition-all disabled:opacity-40 disabled:border-slate-300 disabled:bg-slate-50" 
                                    value={filterTipo} 
                                    onChange={(e) => setFilterTipo(e.target.value)} 
                                    disabled={!agenteSelecionado}
                                >
                                    <option value="Todos">Todos os Tipos</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Cliente">Cliente</option>
                                    <option value="Parceiro">Parceiro</option>
                                </select>

                                <div className="relative w-full sm:w-64">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nome ou tel..." 
                                        className="input input-sm h-11 w-full bg-white border-2 border-slate-700 text-slate-900 font-medium pl-10 pr-4 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e6151a] focus:border-[#e6151a] transition-all disabled:opacity-40 disabled:border-slate-300 disabled:bg-slate-50" 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        disabled={!agenteSelecionado} 
                                    />
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth={2.5} 
                                        stroke="currentColor" 
                                        className="w-5 h-5 text-slate-600 absolute left-3 top-3"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* BARRA DE TRANSFERÊNCIA ATIVA EM LOTE */}
                        {selecionados.length > 0 && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn shadow-sm">
                                <span className="text-[#e6151a] font-bold text-sm flex items-center gap-2">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e6151a]"></span>
                                    </span>
                                    {selecionados.length} contato(s) selecionado(s) para transferência
                                </span>
                                <div className="flex gap-3 items-center w-full sm:w-auto">
                                    <select className="select select-bordered select-sm h-9 bg-white border-red-300 text-slate-700 text-xs font-semibold pl-3 sm:w-52" value={agenteDestinoId} onChange={(e) => setAgenteDestinoId(e.target.value)}>
                                        <option value="">Transferir para...</option>
                                        {agentes.filter(a => a.id.toString() !== agenteSelecionado).map(ag => (
                                            <option key={ag.id} value={ag.id}>{ag.nome}</option>
                                        ))}
                                    </select>
                                    <button onClick={handleTransferir} disabled={isTransferring || !agenteDestinoId} className="btn btn-sm h-9 bg-[#e6151a] text-white border-none hover:bg-[#c41217] px-5 normal-case font-bold shadow-sm">
                                        {isTransferring ? "Processando..." : "Confirmar Realocação"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TABELA PRINCIPAL DA CARTEIRA */}
                        {!agenteSelecionado ? (
                            <div className="text-center py-16 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-semibold text-base">Selecione um agente acima para gerenciar e visualizar a carteira de contatos.</p>
                            </div>
                        ) : clientesFiltrados.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-semibold text-base">Nenhum contato encontrado para este filtro.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                <table className="table table-zebra w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                                            <th className="w-14 text-center bg-transparent py-4">
                                                <input type="checkbox" className="checkbox checkbox-sm rounded border-slate-400 checked:bg-[#e6151a] checked:border-[#e6151a]" checked={selecionados.length === clientesFiltrados.length && clientesFiltrados.length > 0} onChange={toggleSelecionarTodos} />
                                            </th>
                                            <th className="bg-transparent py-4">Nome / Email</th>
                                            <th className="bg-transparent py-4">Telefone</th>
                                            <th className="bg-transparent py-4">Tipo</th>
                                            <th className="bg-transparent py-4 pr-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {clientesFiltrados.map(cli => (
                                            <tr key={cli.id} className={`${selecionados.includes(cli.id) ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50/80'} transition-colors`}>
                                                <td className="text-center py-4">
                                                    <input type="checkbox" className="checkbox checkbox-sm rounded border-slate-400 checked:bg-[#e6151a] checked:border-[#e6151a]" checked={selecionados.includes(cli.id)} onChange={() => toggleUm(cli.id)} />
                                                </td>
                                                <td className="py-4">
                                                    <div className="font-bold text-slate-900">{cli.nome}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{cli.email}</div>
                                                </td>
                                                <td className="py-4 font-mono text-sm text-slate-600 font-medium">{cli.telefone || "-"}</td>
                                                <td className="py-4">
                                                    <span className={`badge border-none text-white font-semibold text-xs px-2.5 py-2 ${cli.tipoContato === 'Cliente' ? 'bg-[#e6151a]' : cli.tipoContato === 'Lead' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                                        {cli.tipoContato}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-6">
                                                    <span className={`badge font-bold text-xs ${cli.aprovado ? 'badge-success bg-emerald-50 text-emerald-700 border-emerald-200' : 'badge-warning bg-amber-50 text-amber-700 border-amber-200'} border px-2.5 py-2`}>
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
                <div className="modal modal-open bg-slate-900/40 backdrop-blur-sm">
                    <div className="modal-box bg-white max-w-md p-8 rounded-2xl border border-slate-100 shadow-2xl animate-scaleUp">
                        <h3 className="font-extrabold text-2xl mb-6 text-slate-900 tracking-tight">
                            {usuarioEdicao ? "Editar Usuário" : "Cadastrar Novo Usuário"}
                        </h3>
                        <form onSubmit={handleSubmit(onSubmitUsuario)} className="space-y-5">
                            <div className="form-control">
                                <label className="label-text font-bold text-slate-700 mb-2">Nome Completo</label>
                                <input type="text" className="input input-bordered h-11 bg-white border-slate-300 focus:border-slate-500 text-slate-800 font-medium" {...register("nome", { required: true })} />
                            </div>
                            <div className="form-control">
                                <label className="label-text font-bold text-slate-700 mb-2">E-mail Corporativo</label>
                                <input type="email" className="input input-bordered h-11 bg-white border-slate-300 focus:border-slate-500 text-slate-800 font-medium" {...register("login", { required: true })} />
                            </div>
                            {!usuarioEdicao && (
                                <div className="form-control">
                                    <label className="label-text font-bold text-slate-700 mb-2">Senha Provisória</label>
                                    <input type="password" placeholder="******" className="input input-bordered h-11 bg-white border-slate-300 focus:border-slate-500 text-slate-800" {...register("senha", { required: true })} />
                                </div>
                            )}
                            <div className="form-control">
                                <label className="label-text font-bold text-slate-700 mb-2">Nível de Acesso (Role)</label>
                                <select className="select select-bordered h-11 bg-white border-slate-300 text-slate-700 font-semibold pl-3" {...register("role", { required: true })}>
                                    <option value="AGENTE">Agente de Vendas</option>
                                    <option value="GESTOR">Gestor de Contas</option>
                                </select>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={fecharModal} className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 border-none px-5 font-bold normal-case rounded-md">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn bg-[#e6151a] text-white border-none hover:bg-[#c41217] px-6 font-bold normal-case shadow-md shadow-red-600/10 rounded-md">
                                    Salvar Usuário
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}