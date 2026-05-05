import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function GestorDashboard() {
    const [pendentes, setPendentes] = useState([]);

    // Estados do Modal de Usuários
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioEdicao, setUsuarioEdicao] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

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

    // Ações do Modal
    const abrirModalNovo = () => {
        setUsuarioEdicao(null);
        reset();
        setIsModalOpen(true);
    };

    const abrirModalEdicao = (usuario) => {
        setUsuarioEdicao(usuario);
        setValue("nome", usuario.nome);
        setValue("email", usuario.email);
        setValue("role", usuario.role);
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
                // Atualização
                await api.put(`/usuarios/${usuarioEdicao.id}`, data);
                alert("Usuário atualizado com sucesso!");
            } else {
                // Cadastro (pode ser /usuarios ou /auth/register dependendo do back-end)
                await api.post('/usuarios', data);
                alert("Usuário cadastrado com sucesso!");
            }
            fecharModal();
        } catch (error) {
            console.error("Erro ao salvar usuário", error);
            alert("Erro ao salvar usuário. Verifique os dados.");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Cabeçalho do Gestor com Botão para Cadastrar Usuário */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Painel do Gestor</h1>
                <button onClick={abrirModalNovo} className="btn btn-primary text-black">
                    + Novo Agente/Gestor
                </button>
            </div>

            <div className="card bg-base-100 shadow-xl mb-8">
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

                                            <td className="font-medium text-secondary">
                                                {c.agente ? c.agente.nome : "Sem Agente"}
                                            </td>

                                            <td>
                                                <button
                                                    onClick={() => aprovar(c.id)}
                                                    className="btn btn-success btn-sm text-black">
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

            {/* MODAL DE CADASTRO/EDIÇÃO DE USUÁRIOS */}
            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4 text-black">
                            {usuarioEdicao ? "Editar Usuário" : "Cadastrar Novo Usuário"}
                        </h3>

                        <form onSubmit={handleSubmit(onSubmitUsuario)} className="space-y-4">
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">Nome Completo</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    placeholder="João Silva"
                                    {...register("nome", { required: "Nome é obrigatório" })}
                                />
                                {errors.nome && <span className="text-error text-xs mt-1">{errors.nome.message}</span>}
                            </div>

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">E-mail</span></label>
                                <input
                                    type="email"
                                    className="input input-bordered w-full"
                                    placeholder="joao@champion.com"
                                    {...register("email", { required: "E-mail é obrigatório" })}
                                />
                                {errors.email && <span className="text-error text-xs mt-1">{errors.email.message}</span>}
                            </div>

                            {/* Campo de Senha - Opcional se for edição */}
                            {!usuarioEdicao && (
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text">Senha de Acesso</span></label>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full"
                                        placeholder="******"
                                        {...register("senha", { required: "Senha é obrigatória para novos cadastros" })}
                                    />
                                    {errors.senha && <span className="text-error text-xs mt-1">{errors.senha.message}</span>}
                                </div>
                            )}

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text">Nível de Acesso (Role)</span></label>
                                <select
                                    className="select select-bordered w-full"
                                    {...register("role", { required: "Role é obrigatória" })}
                                >
                                    <option value="AGENTE">Agente de Vendas</option>
                                    <option value="ADMIN">Gestor (Admin)</option>
                                </select>
                            </div>

                            <div className="modal-action gap-4">
                                <button type="button" onClick={fecharModal} className="btn btn-primary w-20">Cancelar</button>
                                <button type="submit" className="btn btn-primary text-black w-20 ">
                                    {usuarioEdicao ? "Atualizar" : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}