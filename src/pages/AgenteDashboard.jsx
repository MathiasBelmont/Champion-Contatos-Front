import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from 'react';

export default function AgenteDashboard() {
    // Definido estaticamente para simulação visual sem quebrar o contexto
    const isAdmin = false; 
    const { register, handleSubmit, reset } = useForm();
    
    // --- DADOS FALSOS INJETADOS PARA DESIGN (MOCK) ---
    const [meusClientes, setMeusClientes] = useState([
        { id: 1, nome: "Agropecuária Vale do Cedro", email: "contato@valedocedro.com.br", telefone: "(62) 99122-4455", tipoContato: "Cliente", aprovado: true },
        { id: 2, nome: "Fazenda Nova Esperança", email: "suporte@novaesperanca.com", telefone: "(64) 98133-7788", tipoContato: "Lead", aprovado: false },
        { id: 3, nome: "Distribuidora PetGoiás", email: "comercial@petgoias.com", telefone: "(62) 3315-9900", tipoContato: "Parceiro", aprovado: true }
    ]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('Todos'); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

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

    const onSubmit = (data) => {
        alert("Contato cadastrado ficticiamente!");
        const novoContato = {
            id: Date.now(),
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            tipoContato: data.tipoContato,
            aprovado: false
        };
        setMeusClientes([novoContato, ...meusClientes]);
        reset();
    };

    const handleEdit = (cliente) => {
        alert("Editar cliente: " + cliente.nome);
    };

    const handleDelete = (id) => {
        if (window.confirm("Deseja realmente excluir este cadastro?")) {
            setMeusClientes(meusClientes.filter(c => c.id !== id));
            alert("Cliente excluído com sucesso!");
        }
    };

    const handleCopiarTelefone = (cliente) => {
        if (!cliente.aprovado) {
            alert("Acesso Negado: Você não pode copiar o número de um contato que ainda não foi aprovado pelo Gestor.");
            return;
        }
        navigator.clipboard.writeText(cliente.telefone)
            .then(() => alert(`Número ${cliente.telefone} copiado!`));
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = () => {
        setIsImporting(true);
        setTimeout(() => {
            alert("Simulação de importação concluída!");
            setIsImporting(false);
        }, 1000);
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto bg-slate-50 min-h-screen text-slate-800">
            
            {/* HEADER E INDICADOR DE STATUS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 px-1 pt-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 border-l-4 border-[#e6151a] pl-4 tracking-tight">
                        Painel do Agente
                    </h1>
                    <p className="text-slate-500 text-sm ml-4 mt-1">Gerencie sua carteira de clientes e leads.</p>
                </div>
                
                <div className="card bg-white border border-slate-200/80 shadow-sm flex flex-row items-center gap-4 px-6 py-4 rounded-xl w-full sm:w-auto min-w-[220px]">
                    <div className="p-3 bg-red-50 text-[#e6151a] rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.115a4.123 4.123 0 0 1-.657 2.183M6.25 19.252a7.486 7.486 0 0 1 5.855-5.855M6.25 19.252a11.95 11.95 0 0 0-4.119-.952 4.125 4.125 0 0 0-2.493 7.533 11.95 11.95 0 0 0 6.612 1.748M6.25 19.252a7.486 7.486 0 0 0 5.855 5.855M12 12.75a4.125 4.125 0 1 0 0-8.25 4.125 4.125 0 0 0 0 8.25Z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total na Carteira</div>
                        <div className="text-2xl font-black text-slate-900">{meusClientes.length}</div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO PRINCIPAL EM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* FORMULÁRIO DE CADASTRO */}
                <div className="card bg-white shadow-sm border border-slate-200/80 rounded-xl overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#e6151a]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                            </svg>
                            Novo Cadastro
                        </h2>
                        
                        <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        <button type="button" onClick={handleImportClick} disabled={isImporting} className="btn btn-sm bg-transparent border-slate-300 text-slate-600 hover:bg-slate-100 px-3 font-bold normal-case rounded-md">
                            {isImporting ? <span className="loading loading-spinner loading-xs"></span> : "Importar .CSV"}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        <div className="form-control">
                            <label className="label-text font-bold text-slate-700 mb-1.5">Nome Completo</label>
                            <input type="text" placeholder="Ex: João Silva" className="input input-bordered border-2 border-slate-300 focus:border-[#e6151a] text-slate-800 font-medium h-10 bg-white" {...register("nome")} required />
                        </div>

                        <div className="form-control">
                            <label className="label-text font-bold text-slate-700 mb-1.5">E-mail</label>
                            <input type="email" placeholder="joao@cliente.com" className="input input-bordered border-2 border-slate-300 focus:border-[#e6151a] text-slate-800 font-medium h-10 bg-white" {...register("email")} required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label-text font-bold text-slate-700 mb-1.5">Telefone</label>
                                <input type="text" placeholder="(62) 9..." className="input input-bordered border-2 border-slate-300 focus:border-[#e6151a] text-slate-800 font-medium h-10 bg-white" {...register("telefone")} />
                            </div>

                            <div className="form-control">
                                <label className="label-text font-bold text-slate-700 mb-1.5">Tipo</label>
                                <select className="select select-bordered border-2 border-slate-300 focus:border-[#e6151a] text-slate-800 font-bold h-10 min-h-0 pl-4 bg-white" {...register("tipoContato")}>
                                    <option value="Lead">Lead</option>
                                    <option value="Cliente">Cliente</option>
                                    <option value="Parceiro">Parceiro</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn bg-[#e6151a] hover:bg-[#c41217] text-white border-none w-full font-bold normal-case mt-4 shadow-md shadow-red-600/10">
                            Salvar Contato
                        </button>
                    </form>
                </div>

                {/* VISUALIZAÇÃO DA CARTEIRA INLINE */}
                <div className="card bg-white shadow-sm border border-slate-200/80 rounded-xl overflow-hidden lg:col-span-2">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-900">Minha Carteira</h2>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select className="select select-bordered border-2 border-slate-700 text-slate-900 text-xs font-bold h-9 min-h-0 pl-4 bg-white" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
                                <option value="Todos">Todos os Tipos</option>
                                <option value="Lead">Lead</option>
                                <option value="Cliente">Cliente</option>
                                <option value="Parceiro">Parceiro</option>
                            </select>
                            <input type="text" placeholder="Buscar por nome ou tel..." className="input input-bordered border-2 border-slate-700 text-slate-900 text-xs font-medium h-9 w-full sm:w-56 bg-white px-3" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="p-0">
                        {currentClientes.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 font-semibold">Nenhum contato encontrado nesta carteira.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                            <th className="bg-transparent py-4 pl-6">Nome / E-mail</th>
                                            <th className="bg-transparent py-4">Telefone</th>
                                            <th className="bg-transparent py-4">Tipo</th>
                                            <th className="bg-transparent py-4 text-center pr-6">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentClientes.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-4 pl-6">
                                                    <div className="font-semibold text-slate-900">{c.nome}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{c.email}</div>
                                                </td>
                                                <td className="py-4 font-mono text-xs text-slate-600 font-semibold">{c.telefone || "-"}</td>
                                                <td className="py-4">
                                                    <span className={`badge border-none text-white font-bold text-[10px] px-2.5 py-2 ${c.tipoContato === 'Cliente' ? 'bg-[#e6151a]' : c.tipoContato === 'Lead' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                                        {c.tipoContato}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center pr-6 space-x-1 whitespace-nowrap">
                                                    <button onClick={() => handleCopiarTelefone(c)} className="btn btn-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded font-bold" title="Copiar Telefone">
                                                        Copiar
                                                    </button>
                                                    <button onClick={() => handleEdit(c)} className="btn btn-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border-none rounded font-bold">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(c.id)} className="btn btn-xs bg-red-50 hover:bg-red-100 text-red-600 border-none rounded font-bold">
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* PAGINAÇÃO */}
                    {totalPages > 1 && (
                        <div className="flex justify-center my-6 gap-2">
                            <button className="btn btn-xs h-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                                « Anterior
                            </button>
                            <div className="flex items-center px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                                Página {currentPage} de {totalPages}
                            </div>
                            <button className="btn btn-xs h-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                                Próxima »
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}