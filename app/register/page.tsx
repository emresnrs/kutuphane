'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/utils/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Register User
      await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // 2. Auto-login after register
      const loginData = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(loginData.user, loginData.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200 text-center mb-2">
            Aramıza Katılın
          </h1>
          <p className="text-slate-400 text-center mb-8">Kutuphane dünyasına ilk adımı atın</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">E-posta Adresi</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass"
                placeholder="ornek@mail.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass"
                placeholder="En az 6 karakter"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Şifre (Tekrar)</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-glass"
                placeholder="Şifrenizi tekrar girin"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-3 mt-6 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
