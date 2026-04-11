'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="glass sticky top-4 mx-4 md:mx-auto max-w-7xl z-50 mb-12 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-200">
        Kutuphane
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/" className="hover:text-primary-300 transition-colors">Ana Sayfa</Link>
        <Link href="/cart" className="hover:text-primary-300 transition-colors flex items-center gap-2">
          Sepet
          {totalItems > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          )}
        </Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="hover:text-primary-300 transition-colors">Siparişlerim</Link>
            <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors">
              Çıkış
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-primary-300 transition-colors">Giriş Yap</Link>
            <Link href="/register" className="btn-primary py-2 px-4 rounded-lg">Kayıt Ol</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
