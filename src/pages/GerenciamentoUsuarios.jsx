import { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GerenciamentoUsuarios() {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioEdicao, setUsuarioEdicao] = useState(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    
    // Observa o campo "ativo" do formulário para reações visuais dinâmicas no Modal
    const isAtivo = watch("ativo", true);

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
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    const abrirModalNovo = () => {
        setUsuarioEdicao(null);
        reset({ ativo: true, role: 'AGENTE' }); 
        setIsModalOpen(true);
    };

    const abrirModalEdicao = (usuario) => {
        setUsuarioEdicao(usuario);
        setValue("nome", usuario.nome);
        setValue("login", usuario.login); 
        setValue("role", usuario.role);
        setValue("ativo", usuario.ativo !== false); 
        setIsModalOpen(true);
    };

    const fecharModal = () => {
        setIsModalOpen(false);
        setUsuarioEdicao(null);
        reset();
    };

    const onSubmitUsuario = async (data) => {
        try {
            if (usuarioEdicao && !data.senha) {
                delete data.senha;
            }

            if (usuarioEdicao) {
                await api.put(`/usuarios/${usuarioEdicao.id}`, data);
                alert("Usuário atualizado com sucesso!");
            } else {
                await api.post('/usuarios', data);
                alert("Usuário cadastrado com sucesso!");
            }
            fecharModal();
            carregarUsuarios(); 
        } catch (error) {
            console.error("Erro ao salvar usuário", error);
            alert("Erro ao salvar usuário. Verifique os dados no console.");
        }
    };

    const handleSair = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-medium">
            
            {/* NAVBAR CORPORATIVA TI (Tema Roxo/Índigo - Heurística #4) */}
            <header className="navbar bg-white border-b border-slate-200/80 px-6 justify-between h-16 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Champion <span className="text-purple-600">CRM</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-600 text-white px-2 py-0.5 rounded-md">
                            Painel TI
                        </span>
                    </h2>
                </div>
                
                <div className="flex items-center gap-5">
                    {user?.sub && (
                        <div className="flex flex-col items-end text-right hidden sm:flex">
                            <span className="text-xs font-bold text-slate-900">{user.sub}</span>
                            <span className="text-[10px] font-extrabold text-purple-500 uppercase tracking-wider">{user?.role || 'TI'}</span>
                        </div>
                    )}
                    <button 
                        onClick={handleSair} 
                        className="text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors flex items-center gap-1.5 focus:outline-none"
                    >
                        <span>Sair</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="p-6 max-w-6xl mx-auto mt-4">
                
                {/* CABEÇALHO DA PÁGINA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciamento de Usuários</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Visualize e gerencie as credenciais e acessos administrativos.</p>
                    </div>

                    {/* CARD DE INFORMAÇÃO ESTATÍSTICA TI */}
                    <div className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm min-w-[220px]">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Usuários</p>
                            <h3 className="text-2xl font-black text-purple-600 tracking-tight">{usuarios.length}</h3>
                        </div>
                    </div>
                </div>

                {/* PAINEL CENTRAL DA TABELA */}
                <div className="card bg-white shadow-xl border border-slate-200/60 rounded-2xl overflow-hidden">
                    <div className="h-1.5 w-full bg-purple-600"></div>
                    
                    <div className="card-body p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-slate-100 gap-4 mb-4">
                            <h2 className="card-title text-base font-black text-slate-900 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Lista de Usuários Cadastrados
                            </h2>
                            <button 
                                onClick={abrirModalNovo}
                                className="btn bg-purple-600 hover:bg-purple-700 text-white border-none btn-sm h-10 px-4 font-bold normal-case text-xs rounded-xl shadow-lg shadow-purple-600/10 hover:scale-105 transition-transform w-full sm:w-auto"
                            >
                                + Novo Usuário
                            </button>
                        </div>

                        {/* RENDERIZAÇÃO DE ESTADOS DA TABELA */}
                        {loading ? (
                            <div className="flex justify-center items-center h-56">
                                <span className="loading loading-spinner loading-lg text-purple-600"></span>
                            </div>
                        ) : usuarios.length === 0 ? (
                            
                            /* DESIGN DE ESTADO VAZIO (Empty State) */
                            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 m-2">
                                <div className="p-4 bg-purple-50 text-purple-400 rounded-full mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                    </svg>
                                </div>
                                <h4 className="text-sm font-bold text-slate-700">Nenhum usuário no banco de dados</h4>
                                <p className="text-xs text-slate-400 max-w-sm mt-1">
                                    Parece que o ambiente de autenticação está limpo. Clique no botão de criação acima para adicionar o primeiro acesso técnico ou operacional.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-100">
                                            <th className="rounded-l-xl">Identificação</th>
                                            <th>Permissão / Cargo</th>
                                            <th>Status</th>
                                            <th className="text-right rounded-r-xl">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {usuarios.map((u) => (
                                            <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${u.ativo === false ? 'bg-slate-50/40 opacity-60' : ''}`}>
                                                <td className="py-3.5">
                                                    <div className="font-bold text-slate-900 text-sm">{u.nome || "Usuário " + u.id}</div>
                                                    <div className="text-xs font-medium text-slate-400 mt-0.5">{u.email || u.login}</div>
                                                </td>
                                                <td className="py-3.5">
                                                    <span className={`badge border-none text-[10px] font-extrabold tracking-wider rounded-md px-2.5 py-1 ${
                                                        (u.role === 'GESTOR_TI' || u.role === 'GESTOR') 
                                                            ? 'bg-purple-600 text-white' 
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {u.role || 'AGENTE'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5">
                                                    {u.ativo !== false ? (
                                                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/60 text-xs px-2.5 py-1 rounded-xl w-fit">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ativo
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 border border-rose-200/60 text-xs px-2.5 py-1 rounded-xl w-fit">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Inativo
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-right py-3.5">
                                                    <button 
                                                        onClick={() => abrirModalEdicao(u)}
                                                        className="text-xs font-bold text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200 px-3 py-1.5 rounded-xl transition-all"
                                                    >
                                                        Editar
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
            </main>

            {/* MODAL DE CADASTRO/EDIÇÃO */}
            {isModalOpen && (
                <div className="modal modal-open backdrop-blur-sm bg-slate-900/40">
                    <div className="modal-box bg-white border border-slate-200 max-w-md rounded-2xl shadow-2xl p-6 relative">
                        
                        <h3 className="font-black text-lg text-slate-900 tracking-tight mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <span className={`w-2 h-2 rounded-full ${usuarioEdicao ? 'bg-amber-500' : 'bg-purple-600'}`}></span>
                            {usuarioEdicao ? "Editar Informações" : "Cadastrar Novo Usuário"}
                        </h3>

                        <form onSubmit={handleSubmit(onSubmitUsuario)} className="space-y-4">
                            
                            {/* CONFIGURADOR DE STATUS DENTRO DO MODAL */}
                            <div className={`form-control w-full border rounded-xl p-3.5 transition-all ${isAtivo ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
                                <label className="cursor-pointer flex items-center justify-between">
                                    <div>
                                        <span className="label-text font-bold text-slate-800 block text-xs uppercase tracking-wide">Status da Conta</span>
                                        <span className={`text-[11px] font-bold ${isAtivo ? 'text-emerald-600' : 'text-rose-600'} mt-0.5 block`}>
                                            {isAtivo ? 'Permitir autenticação na ferramenta' : 'Bloquear credenciais temporariamente'}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className={`toggle toggle-md ${isAtivo ? 'bg-emerald-500 border-emerald-500' : 'bg-rose-500 border-rose-500'}`}
                                        {...register("ativo")}
                                    />
                                </label>
                            </div>

                            <div className="form-control w-full">
                                <label className="label-text font-bold text-slate-700 mb-1.5 block">Nome Completo</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full h-11 bg-white text-slate-900 border-2 font-medium focus:outline-none border-slate-200 focus:border-purple-600 rounded-xl text-sm transition-all"
                                    placeholder="Ex: Ana Souza"
                                    {...register("nome", { required: "Nome completo é um campo obrigatório" })}
                                />
                                {errors.nome && <span className="text-rose-500 text-xs font-bold mt-1 block">{errors.nome.message}</span>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label-text font-bold text-slate-700 mb-1.5 block">Login / E-mail Corporativo</label>
                                <input
                                    type="email"
                                    className="input input-bordered w-full h-11 bg-white text-slate-900 border-2 font-medium focus:outline-none border-slate-200 focus:border-purple-600 rounded-xl text-sm transition-all"
                                    placeholder="email@champion.com"
                                    {...register("login", { required: "E-mail de autenticação obrigatório" })}
                                />
                                {errors.login && <span className="text-rose-500 text-xs font-bold mt-1 block">{errors.login.message}</span>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label-text font-bold text-slate-700 mb-1.5 block">
                                    Senha {usuarioEdicao && <span className="text-slate-400 font-medium text-xs">(Deixe vazio para não alterar)</span>}
                                </label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full h-11 bg-white text-slate-900 border-2 font-medium focus:outline-none border-slate-200 focus:border-purple-600 rounded-xl text-sm transition-all"
                                    placeholder="******"
                                    {...register("senha", { 
                                        required: usuarioEdicao ? false : "Senha inicial de acesso é obrigatória" 
                                    })}
                                />
                                {errors.senha && <span className="text-rose-500 text-xs font-bold mt-1 block">{errors.senha.message}</span>}
                            </div>

                            {/* SELETOR DE NÍVEL COM PADRONIZAÇÃO DE AFISTAMENTO ESQUERDO PL-4 */}
                            <div className="form-control w-full">
                                <label className="label-text font-bold text-slate-700 mb-1.5 block">Nível de Acesso (Perfil)</label>
                                <select
                                    className="select select-bordered w-full h-11 min-h-0 bg-white text-slate-900 border-2 font-bold focus:outline-none border-slate-200 focus:border-purple-600 rounded-xl text-sm pl-4 transition-all"
                                    {...register("role", { required: "Definição de perfil obrigatória" })}
                                >
                                    <option value="AGENTE">Agente Operacional</option>
                                    <option value="GESTOR">Gestor de Carteira</option>
                                    <option value="GESTOR_TI">Administrador TI</option>
                                </select>
                            </div>

                            {/* ACÇÕES DO MODAL */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                                <button 
                                    type="button" 
                                    onClick={fecharModal} 
                                    className="btn bg-transparent border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300 font-bold text-sm px-5 h-11 rounded-xl min-h-0 normal-case"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 h-11 rounded-xl min-h-0 border-none normal-case shadow-lg shadow-purple-600/10 active:scale-[0.98] transition-all"
                                >
                                    {usuarioEdicao ? "Atualizar Usuário" : "Salvar Cadastro"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}