'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/utils/api';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Book {
  id: number;
  title: string;
  author: string;
  price: string;
  stock: number;
  category: string;
  image: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchAPI('/books');
        setBooks(data);
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden mt-8 rounded-2xl bg-card border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 z-0 pointer-events-none"></div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <Badge variant="secondary" className="mb-4">Yeni Koleksiyon</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Sınırsız Dünyalara <br /> Kapı Aralayın
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            En sevdiğiniz yazarların en yeni eserleri ve unutulmaz klasikler Kutuphane'de. 
            Okuma serüveninize premium bir dokunuşla başlayın.
          </p>
          <div className="pt-4 flex gap-4 justify-center flex-wrap">
            <Link href="#books" className={buttonVariants({ size: 'lg' })}>
              Keşfetmeye Başla
            </Link>
            <Link href="/register" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Kayıt Ol
            </Link>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="space-y-8 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Öne Çıkan Kitaplar</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="flex flex-col gap-4">
                <CardHeader className="p-0">
                  <Skeleton className="h-64 w-full rounded-t-xl" />
                </CardHeader>
                <CardContent className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <h3 className="text-2xl text-muted-foreground">Henüz kitap bulunmuyor.</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-64 bg-muted overflow-hidden">
                  {book.image ? (
                    <img 
                      src={book.image} 
                      alt={book.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <span className="text-muted-foreground font-medium">Görsel Yok</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/80">
                      {book.category || 'Genel'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="p-4 pb-2 flex-grow">
                  <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                    {book.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">₺{book.price}</span>
                    <Badge variant="outline" className={book.stock === 0 ? 'text-destructive' : ''}>
                      Stok: {book.stock}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-auto">
                  <Link href={`/books/${book.id}`} className={cn(buttonVariants({ variant: 'secondary' }), "w-full")}>
                    Detayları İncele
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
