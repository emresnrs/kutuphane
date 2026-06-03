'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/utils/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, BookOpen, ShoppingCart, TrendingUp,
  Clock, CreditCard
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalBooks: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: number;
  email: string;
  username: string | null;
  total_price: string;
  status: string;
  created_at: string;
  payment_card_last4: string | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Bekliyor',     className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  paid:      { label: 'Ödendi',       className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  shipped:   { label: 'Kargoda',      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  delivered: { label: 'Teslim',       className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  cancelled: { label: 'İptal',        className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

/* Animated counter hook */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function StatCard({
  title, value, icon: Icon, color, prefix = '', suffix = '', isLoading
}: {
  title: string; value: number; icon: any; color: string;
  prefix?: string; suffix?: string; isLoading: boolean;
}) {
  const animatedValue = useCountUp(value);
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-muted-foreground/40 group-hover:text-green-400 transition-colors" />
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <p className="text-3xl font-extrabold tracking-tight">
            {prefix}{typeof value === 'number' && !Number.isInteger(value)
              ? animatedValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
              : animatedValue.toLocaleString('tr-TR')}{suffix}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAPI('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Genel bakış ve istatistikler</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="bg-blue-500/15 text-blue-400"
          isLoading={isLoading}
        />
        <StatCard
          title="Toplam Kitap"
          value={stats?.totalBooks ?? 0}
          icon={BookOpen}
          color="bg-purple-500/15 text-purple-400"
          isLoading={isLoading}
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats?.totalOrders ?? 0}
          icon={ShoppingCart}
          color="bg-orange-500/15 text-orange-400"
          isLoading={isLoading}
        />
        <StatCard
          title="Toplam Gelir"
          value={parseFloat(String(stats?.totalRevenue ?? 0))}
          icon={TrendingUp}
          color="bg-green-500/15 text-green-400"
          prefix="₺"
          isLoading={isLoading}
        />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Son Siparişler
          </h2>
          <span className="text-xs text-muted-foreground">Son 10 sipariş</span>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))
          ) : stats?.recentOrders?.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground text-sm">
              Henüz sipariş bulunmuyor
            </div>
          ) : (
            stats?.recentOrders?.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <span className="text-sm text-muted-foreground font-mono w-12">#{order.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{order.username || order.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.email}</p>
                </div>
                {order.payment_card_last4 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CreditCard className="w-3 h-3" />
                    •••• {order.payment_card_last4}
                  </div>
                )}
                <span className="text-sm font-semibold whitespace-nowrap">
                  ₺{parseFloat(order.total_price).toFixed(2)}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs whitespace-nowrap ${statusConfig[order.status]?.className ?? ''}`}
                >
                  {statusConfig[order.status]?.label ?? order.status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden lg:block">
                  {new Date(order.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
