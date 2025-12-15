import React, { useState } from 'react';
import { signUpUser, signInUser, sendPasswordResetEmail } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import Lumi from './Lumi';

interface AuthScreenProps {
  onLoginSuccess: () => void;
  onSkip: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onSkip }) => {
  const [viewState, setViewState] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [personality, setPersonality] = useState('Neurotípico');

  const personalities = ['Autista', 'TDAH', 'Depressivo', 'Neurotípico', 'Outro'];
  const isSupabaseConfigured = !!supabase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
        setError("O banco de dados não está conectado. Adicione as chaves no .env");
        return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (viewState === 'register') {
        await signUpUser(email, password, {
          username,
          age,
          personality: personality as any
        });
        alert("Cadastro realizado! Bem-vindo à família.");
        onLoginSuccess();
      } else if (viewState === 'login') {
        await signInUser(email, password);
        onLoginSuccess();
      } else if (viewState === 'forgot') {
        await sendPasswordResetEmail(email);
        setSuccessMsg("Email de recuperação enviado! Verifique sua caixa de entrada.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro. Verifique seus dados.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in relative">
        
        {/* Header Visual */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
             <Lumi size="sm" mood="happy" />
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800 mt-6 mb-1">
          {viewState === 'register' ? 'Bem-vindo à Família' : (viewState === 'forgot' ? 'Recuperar Senha' : 'LUME')}
        </h2>
        <p className="text-center text-slate-500 text-sm mb-6">
          {viewState === 'register' ? 'Crie seu refúgio seguro.' : (viewState === 'forgot' ? 'Enviaremos um link para você.' : 'Sua luz nos dias difíceis.')}
        </p>

        {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs mb-4 text-center">
                <strong>⚠️ Configuração Necessária</strong><br/>
                As chaves do Supabase não foram encontradas. O cadastro não funcionará até configurar o arquivo .env ou Vercel.
            </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-600 text-xs p-3 rounded-xl mb-4 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {viewState === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 ml-1 mb-1">COMO QUER SER CHAMADO?</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 outline-none text-slate-700 transition-all"
                  placeholder="Nome ou Apelido"
                />
              </div>

              <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 ml-1 mb-1">IDADE</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 outline-none text-slate-700 transition-all"
                      placeholder="Anos"
                    />
                 </div>
                 <div className="flex-[2]">
                    <label className="block text-xs font-bold text-slate-600 ml-1 mb-1">PERSONALIDADE</label>
                    <select 
                        value={personality}
                        onChange={(e) => setPersonality(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 outline-none text-slate-700 transition-all appearance-none"
                    >
                        {personalities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 ml-1 mb-1">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 outline-none text-slate-700 transition-all"
              placeholder="seu@email.com"
            />
          </div>

          {viewState !== 'forgot' && (
             <div>
                <label className="block text-xs font-bold text-slate-600 ml-1 mb-1">SENHA</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 outline-none text-slate-700 transition-all"
                  placeholder="••••••••"
                />
             </div>
          )}

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : (
                viewState === 'register' ? 'CADASTRAR E ENTRAR' : 
                viewState === 'forgot' ? 'ENVIAR EMAIL DE RECUPERAÇÃO' : 'ENTRAR'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
           {viewState === 'login' && (
               <>
                 <button 
                   onClick={() => setViewState('forgot')}
                   className="text-slate-400 text-xs hover:text-indigo-500 transition-colors block w-full"
                 >
                   Esqueci minha senha
                 </button>
                 
                 <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-2">Ainda não é da família?</p>
                    <button 
                        onClick={() => setViewState('register')}
                        className="text-indigo-600 font-bold text-sm hover:underline"
                    >
                        FAÇA PARTE DA FAMÍLIA!
                    </button>
                 </div>
               </>
           )}

           {(viewState === 'register' || viewState === 'forgot') && (
               <button 
                 onClick={() => setViewState('login')}
                 className="text-indigo-600 font-bold text-sm hover:underline"
               >
                 Voltar para o Login
               </button>
           )}
        </div>
      </div>
      
      {viewState === 'login' && (
          <button 
            onClick={onSkip}
            className="mt-8 text-slate-500 text-sm font-medium hover:text-slate-700 underline"
          >
            Entrar no Modo Livre (Sem Comunidade)
          </button>
      )}
    </div>
  );
};

export default AuthScreen;