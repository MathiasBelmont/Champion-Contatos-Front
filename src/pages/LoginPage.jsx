import { useForm } from 'react-hook-form';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setErrorMessage(""); 
        setLoading(true);

        try {
            const loggedUser = await login(data.email, data.senha);

            if (loggedUser) {
                navigate('/dashboard'); 
            } else {
                setErrorMessage("Usuário ou senha inválidos.");
            }
        } catch (error) {
            setErrorMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 relative overflow-hidden px-4">
            
            {/* Elementos Vetoriais de Fundo */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-900/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Container do Card de Login */}
            <div className="card w-full max-w-md bg-white shadow-2xl rounded-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 transform hover:shadow-red-500/5">
                
                {/* Linha Temática Corporativa */}
                <div className="h-2 w-full bg-[#e6151a]"></div>

                <div className="card-body p-8 md:p-10">
                    
                    {/* Identidade Visual - Verificado removido para um design mais limpo */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Champion <span className="text-[#e6151a]">Saúde Animal</span>
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5">
                            Gerenciamento de Carteira
                        </p>
                    </div>

                    {/* Formulário com validações */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        
                        {/* Campo E-mail */}
                        <div className="form-control w-full">
                            <label className="label-text font-bold text-slate-700 mb-1.5">Usuário / E-mail</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="admin@champion.com" 
                                    className={`input input-bordered w-full h-11 bg-white pl-10 text-slate-900 border-2 font-medium focus:outline-none transition-all ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#e6151a]'}`}
                                    {...register("email", { required: "E-mail é obrigatório" })} 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 top-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.375 0 1 1-7.5 0 3.75 3.375 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            {errors.email && <span className="text-xs font-bold text-red-500 mt-1">{errors.email.message}</span>}
                        </div>

                        {/* Campo Senha */}
                        <div className="form-control w-full">
                            <label className="label-text font-bold text-slate-700 mb-1.5">Senha</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    placeholder="******" 
                                    className={`input input-bordered w-full h-11 bg-white pl-10 text-slate-900 border-2 font-medium focus:outline-none transition-all ${errors.senha ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[#e6151a]'}`}
                                    {...register("senha", { required: "Senha é obrigatória" })} 
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 absolute left-3 top-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </div>
                            {errors.senha && <span className="text-xs font-bold text-red-500 mt-1">{errors.senha.message}</span>}
                        </div>

                        {/* Mensagem de Erro Dinâmica */}
                        {errorMessage && (
                            <div role="alert" className="alert bg-red-50 border border-red-200 text-red-700 py-2.5 text-xs font-semibold flex items-center gap-2 rounded-xl animate-fadeIn">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Botão Call to Action */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn w-full h-11 min-h-0 bg-[#e6151a] hover:bg-[#c41217] text-white border-none font-bold normal-case text-base rounded-xl shadow-lg shadow-red-600/10 transition-all duration-200 active:scale-[0.98] mt-6 disabled:bg-slate-200 disabled:text-slate-400"
                        >
                            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Entrar no Sistema"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}