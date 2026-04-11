'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/utils/api';
import Link from 'next/link';

interface OrderItem {
  id: number;
  book_id: number;
  title: string;
  price: string;
  image: string;
  quantity: number;
}

interface Order {
  id: number;
  total_price: string;
  created_at: string;
  items: OrderItem[];
}

export default function Profile() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        const data = await fetchAPI('/orders');
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Siparişler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (isAuthLoading || (isLoading && user)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  return (
    <div className="py-12">
      <div className="flex flex-col md:flex-row gap-8">

        {/* User Card */}
        <div className="w-full md:w-1/3 xl:w-1/4">
          <div className="glass-card p-6 sticky top-24 text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white mb-1 line-clamp-1">{user.email}</h2>
            <p className="text-primary-300 text-sm mb-6">{user.is_admin ? 'Yönetici' : 'Üye'}</p>

            <button className="w-full text-left px-4 py-3 bg-slate-800/50 rounded-lg text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-colors">
              Hesap Ayarları
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="w-full md:w-2/3 xl:w-3/4">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">
            Sipariş Geçmişim
          </h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-300 mb-2">Henüz Siparişiniz Yok</h3>
              <p className="text-slate-500 mb-6">İlk siparişinizi hemen oluşturabilirsiniz.</p>
              <Link href="/" className="btn-primary py-2 px-6">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="glass-card overflow-hidden">
                  <div className="bg-slate-900/50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Sipariş Tarihi</p>
                      <p className="text-sm text-slate-300 font-bold">
                        {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Sipariş No</p>
                      <p className="text-sm text-slate-300">#{order.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Toplam</p>
                      <p className="text-sm text-primary-400 font-bold">₺{parseFloat(order.total_price).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <Link href={`/books/${item.book_id}`} className="font-medium text-white hover:text-primary-300 transition-colors line-clamp-1">
                              {item.title}
                            </Link>
                            <p className="text-sm text-slate-500">₺{item.price} x {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
