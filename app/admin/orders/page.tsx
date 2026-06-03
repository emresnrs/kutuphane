'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { fetchAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ShoppingCart, ChevronDown, ChevronRight, CreditCard,
  Trash2, Search
} from 'lucide-react';

interface OrderItem {
  title: string;
  author: string;
  price: string;
  image: string;
  quantity: number;
}

interface Order {
  id: number;
  email: string;
  username: string | null;
  user_id: number;
  total_price: string;
  status: string;
  payment_card_last4: string | null;
  created_at: string;
  items: OrderItem[];
}

const STATUSES = [
  { value: 'pending',   label: 'Bekliyor',  color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'paid',      label: 'Ödendi',    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'shipped',   label: 'Kargoda',   color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'delivered', label: 'Teslim',    color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'cancelled', label: 'İptal',     color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const statusMap = Object.fromEntries(STATUSES.map(s => [s.value, s]));

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchAPI('/admin/orders');
      setOrders(data);
    } catch (err: any) { toast.error(err.message); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(`/admin/orders/${id}/status`, {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Sipariş durumu güncellendi');
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteOrder = async (id: number) => {
    try {
      await fetchAPI(`/admin/orders/${id}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.id !== id));
      setDeleteId(null);
      toast.success('Sipariş silindi');
    } catch (err: any) { toast.error(err.message); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      (o.username?.toLowerCase().includes(search.toLowerCase())) ||
      String(o.id).includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-semibold mb-1">Siparişi Sil</h3>
            <p className="text-sm text-muted-foreground mb-6">Sipariş #{deleteId} kalıcı olarak silinecek.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>İptal</Button>
              <Button variant="destructive" className="flex-1" onClick={() => deleteOrder(deleteId)}>Sil</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-7 h-7" /> Siparişler
          </h1>
          <p className="text-muted-foreground mt-1">{orders.length} sipariş</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Sipariş no, e-posta veya kullanıcı ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="">Tüm Durumlar</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-8 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Müşteri</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ödeme</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tarih</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tutar</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Sipariş bulunamadı</td>
                  </tr>
                ) : (
                  filtered.map(order => {
                    const statusCfg = statusMap[order.status] ?? { label: order.status, color: '' };
                    const expanded = expandedId === order.id;
                    return (
                      <Fragment key={order.id}>
                        <tr
                          className={`hover:bg-muted/20 transition-colors cursor-pointer ${expanded ? 'bg-muted/10' : ''}`}
                          onClick={() => setExpandedId(expanded ? null : order.id)}
                        >
                          <td className="px-4 py-3 text-muted-foreground">
                            {expanded
                              ? <ChevronDown className="w-3.5 h-3.5" />
                              : <ChevronRight className="w-3.5 h-3.5" />
                            }
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">#{order.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{order.username || order.email}</p>
                            <p className="text-xs text-muted-foreground">{order.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            {order.payment_card_last4 ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CreditCard className="w-3 h-3" /> •••• {order.payment_card_last4}
                              </span>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3 font-semibold whitespace-nowrap">
                            ₺{parseFloat(order.total_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              className={`text-xs rounded-full px-2.5 py-1 border font-medium focus:outline-none cursor-pointer ${statusCfg.color}`}
                            >
                              {STATUSES.map(s => (
                                <option key={s.value} value={s.value} className="text-foreground bg-card">{s.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs gap-1 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteId(order.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Sil
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {expanded && (
                          <tr className="bg-muted/5">
                            <td colSpan={8} className="px-8 py-4">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Sipariş İçeriği ({order.items.length} ürün)
                              </p>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <div className="w-8 h-11 rounded overflow-hidden bg-muted border border-border/50 flex-shrink-0">
                                      {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                                      <p className="text-xs text-muted-foreground">{item.author}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                                    <p className="text-sm font-semibold whitespace-nowrap">
                                      ₺{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
