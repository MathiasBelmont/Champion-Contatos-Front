import { useForm } from 'react-hook-form';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = async (data) => {
        setErrorMessage(""); // Limpa erros anteriores
        const success = await login(data.email, data.senha);
        
        if (success) {
            navigate('/dashboard'); // Redireciona se der certo
        } else {
            setErrorMessage("E-mail ou senha incorretos!");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title justify-center text-2xl font-bold text-primary">Champion Saúde</h2>
                    <p className="text-center text-gray-500 text-sm mb-4">Gerenciamento de Carteira</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Campo E-mail */}
                        <div className="form-control w-full">
                            <label className="label"><span className="label-text">Usuário / E-mail</span></label>
                            <input 
                                {...register("email", { required: "E-mail é obrigatório" })} 
                                type="text" 
                                placeholder="admin@champion.com"
                                className="input input-bordered w-full" 
                            />
                            {errors.email && <span className="text-error text-xs mt-1">{errors.email.message}</span>}
                        </div>

                        {/* Campo Senha */}
                        <div className="form-control w-full">
                            <label className="label"><span className="label-text">Senha</span></label>
                            <input 
                                {...register("senha", { required: "Senha é obrigatória" })} 
                                type="password" 
                                placeholder="******"
                                className="input input-bordered w-full" 
                            />
                            {errors.senha && <span className="text-error text-xs mt-1">{errors.senha.message}</span>}
                        </div>

                        {/* Mensagem de Erro do Login */}
                        {errorMessage && (
                            <div role="alert" className="alert alert-error py-2 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-primary w-full">Entrar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}