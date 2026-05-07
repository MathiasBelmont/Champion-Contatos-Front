import { useForm } from 'react-hook-form';
import { useEffect, useState, useContext, useRef } from 'react';
import api from '../services/api';
import ClientList from '../components/Client';
import { AuthContext } from '../context/AuthContext';

export default function AgenteDashboard() {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'GESTOR';
    const { register, handleSubmit, reset } = useForm();
    const [meusClientes, setMeusClientes] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('Todos'); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        carregarContatos();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterTipo]);

    const filteredClientes = meusClientes.filter(c => {
        const term = searchTerm.toLowerCase();
        const matchSearch = (!searchTerm) || 
                            (c.nome && String(c.nome).toLowerCase().includes(term)) || 
                            (c.telefone && String(c.telefone).toLowerCase().includes(term));
        
        const matchTipo = filterTipo === 'Todos' || c.tipoContato === filterTipo;

        return matchSearch && matchTipo;
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

    const handleCopiarTelefone = (cliente) => {
        if (!cliente.aprovado) {
            alert("Acesso Negado: Você não pode copiar o número de um contato que ainda não foi aprovado pelo Gestor.");
            return;
        }

        if (!cliente.telefone) {
            alert("Este contato não possui um telefone cadastrado.");
            return;
        }

        navigator.clipboard.writeText(cliente.telefone)
            .then(() => {
                alert(`Número ${cliente.telefone} copiado para a área de transferência!`);
            })
            .catch(err => {
                console.error("Erro ao copiar:", err);
                alert("Falha ao copiar o número.");
            });
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = e.target.result;
            const rows = text.split('\n');
            let successCount = 0;
            let errorCount = 0;

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;

                const cols = row.split(/[,;]/); 

                if (cols.length >= 2) { 
                    const contato = {
                        nome: cols[0]?.trim(),
                        email: cols[1]?.trim(),
                        telefone: cols[2]?.trim() || "",
                        tipoContato: cols[3]?.trim() || "Lead"
                    };

                    if (contato.nome && contato.email) {
                        try {
                            await api.post('/clientes', contato);
                            successCount++;
                        } catch (err) {
                            console.error(`Erro ao importar a linha ${i}:`, err);
                            errorCount++;
                        }
                    }
                }
            }
            
            alert(`Importação Concluída!\n- Sucesso: ${successCount}\n- Erros/Ignorados: ${errorCount}`);
            carregarContatos();
            setIsImporting(false);
            event.target.value = null; 
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto text-base-content">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black">Painel do Agente</h1>
                    <p className="text-gray-600 mt-1">Gerencie sua carteira de clientes e leads.</p>
                </div>
                <div className="stats shadow bg-white border border-gray-200">
                    <div className="stat place-items-center">
                        <div className="stat-title text-gray-500 font-semibold">Total na Carteira</div>
                        {/* NÚMERO EM VERMELHO */}
                        <div className="stat-value text-[#e6151a]">{meusClientes.length}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    {/* BARRA SUPERIOR DO CARD EM VERMELHO */}
                    <div className="card bg-white shadow-xl border-t-4 border-[#e6151a] h-fit">
                        <div className="card-body">
                            
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h2 className="card-title text-black flex items-center gap-2">
                                    {/* ÍCONE EM VERMELHO */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e6151a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                    Novo Cadastro
                                </h2>
                                
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileChange} 
                                />
                                {/* BOTÃO DE IMPORTAR EM VERMELHO (OUTLINE) */}
                                <button 
                                    type="button" 
                                    onClick={handleImportClick}
                                    disabled={isImporting}
                                    className="btn btn-sm bg-transparent border-[#e6151a] text-[#e6151a] hover:bg-[#e6151a] hover:text-white hover:border-[#e6151a]"
                                    title={"Padrão do arquivo CSV:\nNome, Email, Telefone, Tipo\n(A primeira linha será ignorada)"}
                                >
                                    {isImporting ? <span className="loading loading-spinner loading-xs"></span> : "Importar .CSV"}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text font-medium text-gray-700">Nome Completo</span>
                                    </label>
                                    <input
                                        {...register("nome")}
                                        placeholder="Ex: João Silva"
                                        className="input input-bordered w-full bg-white focus:outline-[#e6151a] focus:border-[#e6151a]"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label py-1"><span className="label-text font-medium text-gray-700">E-mail</span></label>
                                    <input
                                        {...register("email")}
                                        placeholder="joao@cliente.com"
                                        type="email"
                                        className="input input-bordered w-full bg-white focus:outline-[#e6151a] focus:border-[#e6151a]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-control">
                                        <label className="label py-1"><span className="label-text font-medium text-gray-700">Telefone</span></label>
                                        <input
                                            {...register("telefone")}
                                            placeholder="(00) 00000-0000"
                                            className="input input-bordered w-full bg-white focus:outline-[#e6151a] focus:border-[#e6151a]"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label py-1"><span className="label-text font-medium text-gray-700">Tipo</span></label>
                                        <select {...register("tipoContato")} className="select select-bordered w-full bg-white focus:outline-[#e6151a] focus:border-[#e6151a]">
                                            <option value="Lead">Lead</option>
                                            <option value="Cliente">Cliente</option>
                                            <option value="Parceiro">Parceiro</option>
                                        </select>
                                    </div>
                                </div>

                                {/* BOTÃO SALVAR EM VERMELHO SÓLIDO */}
                                <button className="btn w-full mt-4 text-white font-bold shadow-lg shadow-[#e6151a]/20 border-none bg-[#e6151a] hover:bg-[#e65558] hover:scale-105 transition-transform">
                                    Salvar Contato
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="card bg-white shadow-xl h-full">
                        <div className="card-body p-0 md:p-6">
                            
                            <div className="flex flex-col xl:flex-row justify-between items-center px-4 pt-4 md:px-0 md:pt-0 pb-4 gap-4">
                                <h2 className="card-title text-black whitespace-nowrap">Minha Carteira</h2>
                                
                                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                                    <select 
                                        className="select select-bordered select-sm bg-white focus:outline-[#e6151a] focus:border-[#e6151a] w-full sm:w-40"
                                        value={filterTipo}
                                        onChange={(e) => setFilterTipo(e.target.value)}
                                    >
                                        <option value="Todos">Todos os Tipos</option>
                                        <option value="Lead">Lead</option>
                                        <option value="Cliente">Cliente</option>
                                        <option value="Parceiro">Parceiro</option>
                                    </select>
                                    
                                    <input
                                        type="text"
                                        placeholder="Buscar nome ou telefone..."
                                        className="input input-bordered input-sm w-full sm:w-64 bg-white focus:outline-[#e6151a] focus:border-[#e6151a]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <ClientList
                                clientes={currentClientes}
                                isAdmin={isAdmin}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onCopiarTelefone={handleCopiarTelefone} 
                            />

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