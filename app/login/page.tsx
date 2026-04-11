'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      login(data.user, data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary-500/20 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200 text-center mb-2">
            Tekrar Hoş Geldiniz
          </h1>
          <p className="text-slate-400 text-center mb-8">Kutuphane hesabınıza giriş yapın</p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-3 mt-4 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Hemen Kayıt Olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
