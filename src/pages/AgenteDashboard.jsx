import { useForm } from 'react-hook-form';
import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import ClientList from '../components/Client';
import { AuthContext } from '../context/AuthContext';

export default function AgenteDashboard() {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN';
    const { register, handleSubmit, reset } = useForm();
    const [meusClientes, setMeusClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        carregarContatos();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredClientes = meusClientes.filter(c => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const matchName = c.nome ? String(c.nome).toLowerCase().includes(term) : false;
        const matchPhone = c.telefone ? String(c.telefone).toLowerCase().includes(term) : false;
        return matchName || matchPhone;
    });

    const indexOfLastClient = currentPage * itemsPerPage;
    const indexOfFirstClient = indexOfLastClient - itemsPerPage;
    const currentClientes = filteredClientes.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

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

    const handleEdit = (cliente) => {
        alert("Editar cliente: " + cliente.nome + " (Função a ser implementada)");
    };

    const handleDelete = async (id) => {
        if (window.confirm("Deseja realmente excluir este cadastro?")) {
            try {
                await api.delete(`/clientes/${id}`);
                alert("Cliente excluído com sucesso");
                carregarContatos();
            } catch (error) {
                console.error(error);
                alert("Erro ao excluir.");
            }
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto text-base-content">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    {/* TÍTULO EM VERMELHO (SECONDARY) */}
                    <h1 className="text-3xl font-bold text-black">Painel do Agente</h1>
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
                            <h2 className="card-title text-black mb-4 flex items-center gap-2 border-b pb-2">
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
                                <button className="btn btn-primary w-full mt-4 text-black font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
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
                            {/* TÍTULO E BUSCA */}
                            <div className="flex flex-col md:flex-row justify-between items-center px-4 pt-4 md:px-0 md:pt-0 pb-4 gap-4">
                                <h2 className="card-title text-black">Minha Carteira</h2>
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou telefone..."
                                    className="input input-bordered input-sm w-full md:w-72 bg-white focus:input-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <ClientList
                                clientes={currentClientes}
                                isAdmin={isAdmin}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            {/* PAGINAÇÃO */}
                            {totalPages > 1 && filteredClientes.length > 0 && (
                                <div className="flex justify-center mt-6 mb-4 gap-2">
                                    <button
                                        className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    >
                                        « Anterior
                                    </button>
                                    <div className="flex items-center px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">
                                        Página {currentPage} de {totalPages}
                                    </div>
                                    <button
                                        className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    >
                                        Próxima »
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}