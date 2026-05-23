'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAPI } from '@/utils/api';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

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
  page_count: number | null;
  publication_year: number | null;
  description: string | null;
}

const LIMIT = 24;

function BooksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const currentPage = Number(searchParams.get('page') ?? 1);
  const currentSearch = searchParams.get('search') ?? '';
  const currentCategory = searchParams.get('category') ?? '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  const totalPages = Math.ceil(total / LIMIT);

  const buildQuery = useCallback(
    (page: number, search: string, category: string) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      if (search) params.set('search', search);
      if (category) params.set('subcategory', category);
      return params.toString();
    },
    []
  );

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const query = buildQuery(currentPage, currentSearch, currentCategory);
        const data = await fetchAPI(`/books?${query}`);
        setBooks(data.books ?? data);
        setTotal(data.total ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentPage, currentSearch, currentCategory, buildQuery]);

  useEffect(() => {
    fetchAPI('/books/categories/list')
      .then((cats: string[]) => setCategories(cats))
      .catch(() => {});
  }, []);

  const navigate = (page: number, search: string, category: string) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    router.push(`/books?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(1, searchInput, currentCategory);
  };

  const handleCategory = (cat: string) => {
    navigate(1, currentSearch, cat === currentCategory ? '' : cat);
  };

  const handlePage = (p: number) => {
    navigate(p, currentSearch, currentCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryLabels: Record<string, string> = {
    'Dunya Roman': 'Dünya Roman',
    'Turk Romani': 'Türk Romanı',
    'Turkiye Roman': 'Türkiye Roman',
    'Dunya Klasik': 'Dünya Klasik',
    'Fantastik': 'Fantastik',
    'Polisiye': 'Polisiye',
    'Bilim Kurgu': 'Bilim Kurgu',
    'Romantik': 'Romantik',
    'Macera': 'Macera',
    'Korku Gerilim': 'Korku/Gerilim',
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Page Header */}
      <div className="space-y-2 pt-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Tüm Kitaplar</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `${total} kitap listeleniyor` : 'Kitaplar yükleniyor...'}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="book-search"
            placeholder="Kitap adı, yazar veya yayınevi ara..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <button type="submit" className={buttonVariants()}>
          Ara
        </button>
        {(currentSearch || currentCategory) && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              navigate(1, '', '');
            }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Temizle
          </button>
        )}
      </form>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat}`}
              onClick={() => handleCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200',
                currentCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                  : 'bg-background border-border hover:border-primary/60 hover:bg-accent'
              )}
            >
              {categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>
      )}

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(LIMIT)].map((_, i) => (
            <Card key={i} className="flex flex-col gap-4 p-0">
              <Skeleton className="aspect-[2/3] w-full rounded-t-xl" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full mt-2" />
              </div>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <Card className="text-center py-24">
          <CardContent className="space-y-3">
            <p className="text-5xl">📚</p>
            <h3 className="text-xl font-semibold">Sonuç bulunamadı</h3>
            <p className="text-muted-foreground">
              Arama kriterlerinizi değiştirmeyi deneyin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {books.map((book) => (
            <Card
              key={book.id}
              className="group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-0"
            >
              <Link href={`/books/${book.id}`} className="relative aspect-[2/3] bg-muted overflow-hidden block">
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-4xl">📖</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-xs shadow-sm">
                    {categoryLabels[book.subcategory] ?? book.subcategory ?? 'Genel'}
                  </Badge>
                </div>
              </Link>

              <CardHeader className="p-4 pb-2 flex-grow">
                <Link href={`/books/${book.id}`}>
                  <CardTitle className="text-base line-clamp-2 hover:text-primary transition-colors leading-snug">
                    {book.title}
                  </CardTitle>
                </Link>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                {book.publisher && (
                  <p className="text-xs text-muted-foreground/60">{book.publisher}</p>
                )}
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">₺{Number(book.price).toFixed(2)}</span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', book.stock === 0 && 'text-destructive border-destructive')}
                  >
                    {book.stock > 0 ? `Stok: ${book.stock}` : 'Tükendi'}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 mt-auto">
                <Link
                  href={`/books/${book.id}`}
                  className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'w-full')}
                >
                  Detayları İncele
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            id="prev-page"
            onClick={() => handlePage(currentPage - 1)}
            disabled={currentPage <= 1}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon' }),
              'disabled:opacity-40'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let page: number;
            if (totalPages <= 7) {
              page = i + 1;
            } else if (currentPage <= 4) {
              page = i + 1;
            } else if (currentPage >= totalPages - 3) {
              page = totalPages - 6 + i;
            } else {
              page = currentPage - 3 + i;
            }
            return (
              <button
                key={page}
                id={`page-${page}`}
                onClick={() => handlePage(page)}
                className={cn(
                  buttonVariants({ variant: currentPage === page ? 'default' : 'outline', size: 'sm' }),
                  'min-w-[2.25rem]'
                )}
              >
                {page}
              </button>
            );
          })}

          <button
            id="next-page"
            onClick={() => handlePage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon' }),
              'disabled:opacity-40'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8 pb-20 pt-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="flex flex-col gap-4 p-0">
                <Skeleton className="aspect-[2/3] w-full rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <BooksContent />
    </Suspense>
  );
}
