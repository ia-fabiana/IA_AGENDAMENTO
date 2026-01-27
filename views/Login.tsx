
import React, { useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-dark to-brand-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            IA.AGENDAMENTOS<span className="text-brand-purple">.</span>
          </h1>
          <p className="text-slate-300 text-sm">Painel de Administração</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-brand-purple/10 rounded-xl flex items-center justify-center">
              <LogIn className="w-6 h-6 text-brand-purple" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-dark">Login Admin</h2>
              <p className="text-xs text-slate-400">Acesse o painel de controle</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-purple text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-purple/30 hover:bg-brand-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              Acesso restrito a administradores
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-300">
            © 2026 IA.AGENDAMENTOS - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
