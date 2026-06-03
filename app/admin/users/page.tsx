'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Users, Search, Shield, ShieldOff, Ban, CheckCircle2,
  Trash2, KeyRound, ChevronDown, ChevronUp, UserCog
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  username: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

/* ─── Password Change Modal ─── */
function PasswordModal({ user, onClose, onSave }: {
  user: User; onClose: () => void; onSave: (id: number, pw: string) => void;
}) {
  const [pw, setPw] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
        <h3 className="font-semibold text-base mb-1">Şifre Değiştir</h3>
        <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
        <input
          type="password"
          placeholder="Yeni şifre (min. 6 karakter)"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
          <Button
            className="flex-1"
            disabled={pw.length < 6}
            onClick={() => { onSave(user.id, pw); onClose(); }}
          >
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */
function DeleteModal({ user, onClose, onConfirm }: {
  user: User; onClose: () => void; onConfirm: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
        <h3 className="font-semibold text-base mb-1">Kullanıcıyı Sil</h3>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="font-medium text-foreground">{user.email}</span> kullanıcısı kalıcı olarak silinecek. Bu işlem geri alınamaz.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => { onConfirm(user.id); onClose(); }}
          >
            Sil
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [passwordModal, setPasswordModal] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const load = useCallback(async () => {
    try {
      const data = await fetchAPI(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const toggleBan = async (user: User) => {
    try {
      const data = await fetchAPI(`/admin/users/${user.id}/ban`, { method: 'PUT' });
      toast.success(data.message);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: data.is_banned } : u));
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleAdmin = async (user: User) => {
    try {
      const data = await fetchAPI(`/admin/users/${user.id}/role`, { method: 'PUT' });
      toast.success(data.message);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_admin: data.is_admin } : u));
    } catch (err: any) { toast.error(err.message); }
  };

  const changePassword = async (id: number, newPassword: string) => {
    try {
      const data = await fetchAPI(`/admin/users/${id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });
      toast.success(data.message);
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteUser = async (id: number) => {
    try {
      await fetchAPI(`/admin/users/${id}`, { method: 'DELETE' });
      toast.success('Kullanıcı silindi');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) { toast.error(err.message); }
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...users].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: keyof User }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <>
      {passwordModal && (
        <PasswordModal user={passwordModal} onClose={() => setPasswordModal(null)} onSave={changePassword} />
      )}
      {deleteModal && (
        <DeleteModal user={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={deleteUser} />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7" /> Kullanıcılar
            </h1>
            <p className="text-muted-foreground mt-1">{users.length} kullanıcı</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="E-posta veya kullanıcı adı ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    { key: 'id', label: '#' },
                    { key: 'email', label: 'E-posta' },
                    { key: 'username', label: 'Kullanıcı Adı' },
                    { key: 'created_at', label: 'Kayıt Tarihi' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key as keyof User)}
                      className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                    >
                      <span className="flex items-center gap-1">
                        {col.label} <SortIcon field={col.key as keyof User} />
                      </span>
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                ) : (
                  sorted.map(user => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-muted-foreground">{user.id}</td>
                      <td className="px-4 py-3 font-medium">{user.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.username || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {user.is_admin && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Admin</Badge>
                          )}
                          {user.is_banned && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Yasaklı</Badge>
                          )}
                          {!user.is_admin && !user.is_banned && (
                            <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">Aktif</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1"
                            onClick={() => toggleBan(user)}
                            title={user.is_banned ? 'Aktif Et' : 'Yasakla'}
                          >
                            {user.is_banned
                              ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Aktif Et</>
                              : <><Ban className="w-3.5 h-3.5 text-yellow-400" /> Yasakla</>
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1"
                            onClick={() => toggleAdmin(user)}
                            title={user.is_admin ? 'Admin Kaldır' : 'Admin Yap'}
                          >
                            {user.is_admin
                              ? <><ShieldOff className="w-3.5 h-3.5 text-orange-400" /> Admin Kaldır</>
                              : <><Shield className="w-3.5 h-3.5 text-blue-400" /> Admin Yap</>
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1"
                            onClick={() => setPasswordModal(user)}
                          >
                            <KeyRound className="w-3.5 h-3.5 text-purple-400" /> Şifre
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteModal(user)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
