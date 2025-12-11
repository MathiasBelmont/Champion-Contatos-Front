import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AgenteDashboard() {
    const { register, handleSubmit, reset } = useForm();
    const [meusClientes, setMeusClientes] = useState([]);

    // Carregar contatos ao abrir a tela
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
            reset(); // Limpa form
            carregarContatos(); // Atualiza lista
        } catch (error) {
            alert("Erro ao cadastrar.");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Painel do Agente</h1>
            
            {/* Formulário */}
            <div className="card bg-base-100 shadow-xl mb-8">
                <div className="card-body">
                    <h2 className="card-title">Novo Contato</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                        <input {...register("nome")} placeholder="Nome" className="input input-bordered" required />
                        <input {...register("email")} placeholder="Email" className="input input-bordered" required />
                        <input {...register("telefone")} placeholder="Telefone" className="input input-bordered" />
                        <select {...register("tipoContato")} className="select select-bordered">
                            <option value="Lead">Lead</option>
                            <option value="Cliente">Cliente</option>
                        </select>
                        <button className="btn btn-primary col-span-2">Salvar Contato</button>
                    </form>
                </div>
            </div>

            {/* Lista */}
            <h2 className="text-2xl font-bold mb-4">Meus Contatos</h2>
            <div className="overflow-x-auto">
                <table className="table bg-base-100 shadow-md">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meusClientes.map(c => (
                            <tr key={c.id}>
                                <td>{c.nome}</td>
                                <td>{c.email}</td>
                                <td>
                                    {c.aprovado ? 
                                        <span className="badge badge-success">Aprovado</span> : 
                                        <span className="badge badge-warning">Pendente</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}