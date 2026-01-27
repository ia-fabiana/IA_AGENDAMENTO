
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export const authService = {
  /**
   * Verifica se o usuário está autenticado
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return {
        id: user.id,
        email: user.email || '',
        role: 'admin', // Por enquanto, todos são admin
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Verifica se há uma sessão ativa
   */
  async hasActiveSession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
};
