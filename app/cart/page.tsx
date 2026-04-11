'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchAPI } from '@/utils/api';

export default function Cart() {
  const { cart, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (cart.length === 0) return;

    setIsOrdering(true);
    setError('');

    try {
      await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({
          total_price: totalPrice,
          items: cart.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      clearCart();
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Sipariş oluşturulamadı.');
      setIsOrdering(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sepetiniz Boş</h2>
        <p className="text-slate-400 mb-8">Henüz sepetinize hiç kitap eklemediniz.</p>
        <Link href="/" className="btn-primary py-3 px-8">
          Kitapları Keşfet
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-8">Sepetim ({totalItems} Ürün)</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 space-y-4">
          {cart.map((item) => (
            <div key={item.book_id} className="glass-card p-4 flex gap-6 items-center">
              <div className="w-20 h-28 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-700"></div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-slate-400 font-medium">₺{item.price}</p>
                <p className="text-sm text-slate-500 mt-2">Adet: <span className="text-white font-bold">{item.quantity}</span></p>
              </div>
              <div>
                <button 
                  onClick={() => removeFromCart(item.book_id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-1/3">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Sipariş Özeti</h2>
            <div className="flex justify-between text-slate-300 mb-4">
              <span>Ara Toplam</span>
              <span>₺{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300 mb-6">
              <span>Kargo</span>
              <span className="text-green-400 font-medium">Ücretsiz</span>
            </div>
            <div className="flex justify-between text-2xl font-extrabold text-white mb-8 border-t border-white/10 pt-4">
              <span>Toplam</span>
              <span className="text-primary-400">₺{totalPrice.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isOrdering}
              className="btn-primary w-full py-4 text-lg"
            >
              {isOrdering ? 'Siparişiniz Alınıyor...' : (user ? 'Siparişi Tamamla' : 'Giriş Yap ve Satın Al')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
