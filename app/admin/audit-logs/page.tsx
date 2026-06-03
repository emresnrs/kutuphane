'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchAPI } from '@/utils/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardList, RefreshCw, Trash2, ChevronLeft,
  ChevronRight, Filter, Clock, User, AlertTriangle
} from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  target_type: string;
  target_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  admin_email: string | null;
  admin_username: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionConfig: Record<string, { label: string; className: string }> = {
  BAN_USER:            { label: 'Kullanıcı Yasaklandı',   className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  UNBAN_USER:          { label: 'Yasak Kaldırıldı',       className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  GRANT_ADMIN:         { label: 'Admin Yapıldı',          className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  REVOKE_ADMIN:        { label: 'Admin Rolü Alındı',      className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  CHANGE_PASSWORD:     { label: 'Şifre Değiştirildi',     className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  DELETE_USER:         { label: 'Kullanıcı Silindi',      className: 'bg-red-600/20 text-red-300 border-red-600/30' },
  UPDATE_ORDER_STATUS: { label: 'Sipariş Güncellendi',    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  DELETE_ORDER:        { label: 'Sipariş Silindi',        className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  CREATE_BOOK:         { label: 'Kitap Eklendi',          className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  UPDATE_BOOK:         { label: 'Kitap Düzenlendi',       className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  DELETE_BOOK:         { label: 'Kitap Silindi',          className: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
};

const targetTypeLabel: Record<string, string> = {
  user: 'Kullanıcı',
  order: 'Sipariş',
  book: 'Kitap',
  system: 'Sistem',
};

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return '—';
  const parts: string[] = [];

  // Kullanıcı işlemleri
  if (details.targetEmail)    parts.push(`E-posta: ${details.targetEmail}`);
  if (details.targetUsername) parts.push(`Kullanıcı: ${details.targetUsername}`);

  // Sipariş işlemleri
  if (details.previousStatus) parts.push(`${details.previousStatus} → ${details.newStatus}`);
  if (details.totalPrice)     parts.push(`₺${Number(details.totalPrice).toFixed(2)}`);

  // Kitap işlemleri
  if (details.title)  parts.push(`"${details.title}"`);
  if (details.author) parts.push(`/ ${details.author}`);
  if (details.previousPrice !== undefined && details.newPrice !== undefined) {
    parts.push(`Fiyat: ₺${details.previousPrice} → ₺${details.newPrice}`);
  } else if (details.price !== undefined) {
    parts.push(`₺${details.price}`);
  }
  if (details.previousStock !== undefined && details.newStock !== undefined) {
    parts.push(`Stok: ${details.previousStock} → ${details.newStock}`);
  } else if (details.stock !== undefined) {
    parts.push(`Stok: ${details.stock}`);
  }
  if (details.category) parts.push(`[${details.category}]`);

  return parts.join(' · ') || JSON.stringify(details);
}


export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [clearing, setClearing] = useState(false);
  const [clearDays, setClearDays] = useState('');

  const load = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (actionFilter) params.set('action', actionFilter);
      const data = await fetchAPI(`/admin/audit-logs?${params}`);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchAPI('/admin/audit-logs/actions')
      .then(setActionTypes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleClear = async () => {
    if (!confirm(clearDays ? `${clearDays} günden eski loglar silinsin mi?` : 'Tüm loglar silinsin mi?')) return;
    setClearing(true);
    try {
      const params = clearDays ? `?olderThanDays=${clearDays}` : '';
      await fetchAPI(`/admin/audit-logs${params}`, { method: 'DELETE' });
      load(1);
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-muted-foreground" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Admin işlemlerinin geçmişi · {pagination.total} kayıt
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Action filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select
              id="audit-action-filter"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            >
              <option value="">Tüm işlemler</option>
              {actionTypes.map(a => (
                <option key={a} value={a}>{actionConfig[a]?.label ?? a}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            id="audit-refresh-btn"
            onClick={() => load(pagination.page)}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted/70 transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Clear */}
          <div className="flex items-center gap-1">
            <input
              id="audit-clear-days-input"
              type="number"
              placeholder="Gün"
              value={clearDays}
              onChange={e => setClearDays(e.target.value)}
              className="w-16 px-2 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
              min="1"
            />
            <button
              id="audit-clear-btn"
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              title="Logları Temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearing ? 'Siliniyor…' : 'Temizle'}
            </button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[60px_1fr_180px_120px_140px_120px] gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>#</span>
          <span>İşlem &amp; Detay</span>
          <span>Admin</span>
          <span>Hedef</span>
          <span>IP Adresi</span>
          <span>Tarih</span>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32 hidden md:block" />
                <Skeleton className="h-5 w-20 rounded-full hidden md:block" />
                <Skeleton className="h-4 w-24 hidden md:block" />
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <AlertTriangle className="w-8 h-8 opacity-30" />
              <p className="text-sm">Henüz audit log kaydı yok.</p>
            </div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                className="grid md:grid-cols-[60px_1fr_180px_120px_140px_120px] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors text-sm"
              >
                {/* ID */}
                <span className="font-mono text-muted-foreground text-xs">#{log.id}</span>

                {/* Action + details */}
                <div className="min-w-0">
                  <Badge
                    variant="outline"
                    className={`text-xs mb-1 ${actionConfig[log.action]?.className ?? 'bg-muted text-muted-foreground border-border'}`}
                  >
                    {actionConfig[log.action]?.label ?? log.action}
                  </Badge>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDetails(log.details)}
                  </p>
                </div>

                {/* Admin */}
                <div className="hidden md:flex items-center gap-1.5 min-w-0">
                  <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="truncate text-xs">
                    {log.admin_username || log.admin_email || '—'}
                  </span>
                </div>

                {/* Target */}
                <div className="hidden md:block">
                  <span className="text-xs text-muted-foreground">
                    {targetTypeLabel[log.target_type] ?? log.target_type}
                    {log.target_id ? ` #${log.target_id}` : ''}
                  </span>
                </div>

                {/* IP */}
                <div className="hidden md:block font-mono text-xs text-muted-foreground">
                  {log.ip_address ?? '—'}
                </div>

                {/* Date */}
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_at).toLocaleString('tr-TR', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {pagination.page} / {pagination.totalPages} · {pagination.total} kayıt
          </p>
          <div className="flex items-center gap-2">
            <button
              id="audit-prev-btn"
              disabled={pagination.page <= 1}
              onClick={() => load(pagination.page - 1)}
              className="p-2 rounded-lg border border-border bg-card hover:bg-muted/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2">{pagination.page}</span>
            <button
              id="audit-next-btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => load(pagination.page + 1)}
              className="p-2 rounded-lg border border-border bg-card hover:bg-muted/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
