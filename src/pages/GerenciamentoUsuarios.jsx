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

    // ADICIONADO: 'watch' para observar o valor do toggle em tempo real
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    
    // Observa o campo "ativo" do formulário. Se for undefined (inicio), assume true.
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
        // Garantindo que o React Hook Form pegue o valor booleano correto
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
            // Garantir que a senha vazia não seja enviada na edição
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
        <div className="min-h-screen bg-base-100">
            <div className="navbar bg-base-300 px-8 shadow-sm">
                <div className="flex-1 font-bold text-xl">Champion CRM - Painel TI</div>
                <div className="flex-none gap-4">
                    <span>{user?.sub} ({user?.role})</span>
                    <button onClick={handleSair} className="btn btn-sm btn-error">Sair</button>
                </div>
            </div>

            <div className="p-8 max-w-6xl mx-auto text-base-content mt-4">
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

                <div className="card bg-white shadow-xl border-t-4 border-primary">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title text-black flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Lista de Usuários Cadastrados
                            </h2>
                            <button 
                                onClick={abrirModalNovo}
                                className="btn btn-primary btn-sm text-black w-32 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                + Novo Usuário
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-48">
                                <span className="loading loading-spinner loading-lg text-primary"></span>
                            </div>
                        ) : usuarios.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 opacity-50 text-gray-500">
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
                                            <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.ativo === false ? 'opacity-60' : ''}`}>
                                                <td>
                                                    <div className="font-bold text-gray-800 text-lg">{u.nome || "Usuário " + u.id}</div>
                                                    <div className="text-sm text-gray-500">{u.email || u.login}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge border-0 font-bold text-white ${(u.role === 'GESTOR_TI' || u.role === 'GESTOR') ? 'badge-primary' : 'bg-gray-400'}`}>
                                                        {u.role || 'AGENTE'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {u.ativo !== false ? (
                                                        <div className="flex items-center gap-2 text-success font-bold bg-success/10 px-3 py-1 rounded-lg w-fit">
                                                            <div className="w-2 h-2 rounded-full bg-success"></div> Ativo
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-error font-bold bg-error/10 px-3 py-1 rounded-lg w-fit">
                                                            <div className="w-2 h-2 rounded-full bg-error"></div> Inativo
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    <button 
                                                        onClick={() => abrirModalEdicao(u)}
                                                        className="btn btn-ghost btn-sm text-primary hover:bg-primary/10">
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

                {isModalOpen && (
                    <div className="modal modal-open">
                        <div className="modal-box bg-white">
                            <h3 className="font-bold text-lg mb-4 text-black">
                                {usuarioEdicao ? "Editar Usuário" : "Cadastrar Novo Usuário"}
                            </h3>

                            <form onSubmit={handleSubmit(onSubmitUsuario)} className="space-y-4">
                                
                                {/* TOGGLE DINÂMICO (Verde quando Ativo, Vermelho quando Inativo) */}
                                <div className="form-control w-full border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    <label className="cursor-pointer flex items-center justify-between">
                                        <div>
                                            <span className="label-text font-bold text-gray-800 block">Status da Conta</span>
                                            <span className={`text-xs font-bold ${isAtivo ? 'text-success' : 'text-error'}`}>
                                                {isAtivo ? 'Usuário pode acessar o sistema' : 'Acesso bloqueado temporariamente'}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            // Se isAtivo for true, usa toggle-success (Verde). Se for false, usa toggle-error (Vermelho).
                                            className={`toggle ${isAtivo ? 'toggle-success' : 'toggle-error'}`}
                                            {...register("ativo")}
                                        />
                                    </label>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text">Nome Completo</span></label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-white text-black"
                                        placeholder="Ex: Ana Souza"
                                        {...register("nome", { required: "Nome é obrigatório" })}
                                    />
                                    {errors.nome && <span className="text-error text-xs mt-1">{errors.nome.message}</span>}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text">Login / E-mail</span></label>
                                    <input
                                        type="email"
                                        className="input input-bordered w-full bg-white text-black"
                                        placeholder="email@champion.com"
                                        {...register("login", { required: "E-mail é obrigatório" })}
                                    />
                                    {errors.login && <span className="text-error text-xs mt-1">{errors.login.message}</span>}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text">Senha {usuarioEdicao && "(Deixe em branco para manter a atual)"}</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full bg-white text-black"
                                        placeholder="******"
                                        {...register("senha", { 
                                            required: usuarioEdicao ? false : "Senha é obrigatória para novos cadastros" 
                                        })}
                                    />
                                    {errors.senha && <span className="text-error text-xs mt-1">{errors.senha.message}</span>}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text">Nível de Acesso (Role)</span></label>
                                    <select
                                        className="select select-bordered w-full bg-white text-black"
                                        {...register("role", { required: "Role é obrigatória" })}
                                    >
                                        <option value="AGENTE">Agente</option>
                                        <option value="GESTOR">Gestor</option>
                                        <option value="GESTOR_TI">Gestor de TI</option>
                                    </select>
                                </div>

                                <div className="modal-action gap-2 pt-4">
                                    <button type="button" onClick={fecharModal} className="btn btn-ghost border border-gray-300 w-24">Cancelar</button>
                                    <button type="submit" className="btn btn-primary text-black w-24">
                                        {usuarioEdicao ? "Atualizar" : "Salvar"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}