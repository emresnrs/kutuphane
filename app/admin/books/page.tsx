'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { BookOpen, Search, Plus, Pencil, Trash2, X, Check, Package } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  price: string;
  stock: number;
  category: string;
  subcategory: string;
  image: string;
  description: string;
  page_count: number | null;
  publication_year: number | null;
  language: string;
  barcode: string;
}

const EMPTY_BOOK: Partial<Book> = {
  title: '', author: '', publisher: '', price: '', stock: 0,
  category: '', subcategory: '', image: '', description: '',
  page_count: null, publication_year: null, language: 'Türkçe', barcode: '',
};

/* ─── Book Form Modal ─── */
function BookModal({
  book, onClose, onSave,
}: {
  book: Partial<Book>; onClose: () => void; onSave: (b: Partial<Book>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Book>>(book);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Book, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const fields: Array<{ key: keyof Book; label: string; type?: string; textarea?: boolean }> = [
    { key: 'title', label: 'Başlık' },
    { key: 'author', label: 'Yazar' },
    { key: 'publisher', label: 'Yayınevi' },
    { key: 'price', label: 'Fiyat (₺)', type: 'number' },
    { key: 'stock', label: 'Stok', type: 'number' },
    { key: 'category', label: 'Kategori' },
    { key: 'subcategory', label: 'Alt Kategori' },
    { key: 'language', label: 'Dil' },
    { key: 'page_count', label: 'Sayfa Sayısı', type: 'number' },
    { key: 'publication_year', label: 'Yayın Yılı', type: 'number' },
    { key: 'barcode', label: 'Barkod' },
    { key: 'image', label: 'Görsel URL' },
    { key: 'description', label: 'Açıklama', textarea: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold">{book.id ? 'Kitabı Düzenle' : 'Yeni Kitap Ekle'}</h3>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, type, textarea }) => (
              <div key={key} className={textarea ? 'sm:col-span-2' : ''}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
                {textarea ? (
                  <textarea
                    rows={4}
                    value={(form[key] as string) ?? ''}
                    onChange={e => set(key, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                ) : (
                  <input
                    type={type || 'text'}
                    value={(form[key] as string | number) ?? ''}
                    onChange={e => set(key, type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border flex gap-2 flex-shrink-0">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Kaydediliyor...' : (book.id ? 'Güncelle' : 'Ekle')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Inline Stock Edit ─── */
function StockCell({ book, onUpdate }: { book: Book; onUpdate: (id: number, stock: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(book.stock));

  const save = () => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) onUpdate(book.id, n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          className="w-16 h-7 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        />
        <button onClick={save} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded hover:bg-muted/50 transition-colors ${book.stock === 0 ? 'text-red-400' : book.stock < 5 ? 'text-yellow-400' : 'text-green-400'}`}
    >
      <Package className="w-3 h-3" />
      {book.stock}
    </button>
  );
}

/* ─── Main Page ─── */
export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Book> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const data = await fetchAPI(`/books?${params}`);
      setBooks(data.books);
      setTotal(data.total);
    } catch (err: any) { toast.error(err.message); }
    finally { setIsLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const saveBook = async (form: Partial<Book>) => {
    if (form.id) {
      const updated = await fetchAPI(`/books/${form.id}`, {
        method: 'PUT', body: JSON.stringify(form),
      });
      setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success('Kitap güncellendi');
    } else {
      const created = await fetchAPI('/books', { method: 'POST', body: JSON.stringify(form) });
      setBooks(prev => [created, ...prev]);
      toast.success('Kitap eklendi');
    }
  };

  const updateStock = async (id: number, stock: number) => {
    const book = books.find(b => b.id === id)!;
    try {
      await fetchAPI(`/books/${id}`, { method: 'PUT', body: JSON.stringify({ ...book, stock }) });
      setBooks(prev => prev.map(b => b.id === id ? { ...b, stock } : b));
      toast.success('Stok güncellendi');
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteBook = async (id: number) => {
    try {
      await fetchAPI(`/books/${id}`, { method: 'DELETE' });
      setBooks(prev => prev.filter(b => b.id !== id));
      setDeleteId(null);
      toast.success('Kitap silindi');
    } catch (err: any) { toast.error(err.message); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {modal && <BookModal book={modal} onClose={() => setModal(null)} onSave={saveBook} />}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-semibold mb-1">Kitabı Sil</h3>
            <p className="text-sm text-muted-foreground mb-6">Bu kitap kalıcı olarak silinecek.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>İptal</Button>
              <Button variant="destructive" className="flex-1" onClick={() => deleteBook(deleteId)}>Sil</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7" /> Kitaplar
            </h1>
            <p className="text-muted-foreground mt-1">{total} kitap</p>
          </div>
          <Button onClick={() => setModal(EMPTY_BOOK)} className="gap-2">
            <Plus className="w-4 h-4" /> Kitap Ekle
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Başlık, yazar veya yayınevi ara..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kitap</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Yayınevi</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fiyat</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stok</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Kitap bulunamadı</td>
                  </tr>
                ) : (
                  books.map(book => (
                    <tr key={book.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-11 rounded overflow-hidden bg-muted border border-border/50 flex-shrink-0">
                            {book.image && <img src={book.image} alt={book.title} className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{book.publisher || '—'}</td>
                      <td className="px-4 py-3">
                        {book.subcategory && (
                          <Badge variant="outline" className="text-xs">{book.subcategory}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">₺{parseFloat(book.price).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <StockCell book={book} onUpdate={updateStock} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1"
                            onClick={() => setModal(book)}
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-400" /> Düzenle
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(book.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total} kitap
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</Button>
                <span className="h-7 px-3 flex items-center text-xs text-muted-foreground">{page} / {totalPages}</span>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
