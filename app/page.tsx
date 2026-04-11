'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/utils/api';

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
      <section className="relative px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center glass-card overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 to-primary-600/20 z-0 pointer-events-none"></div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-primary-200">
            Sınırsız Dünyalara <br /> Kapı Aralayın
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium">
            En sevdiğiniz yazarların en yeni eserleri ve unutulmaz klasikler Kutuphane'de. 
            Okuma serüveninize premium bir dokunuşla başlayın.
          </p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link href="#books" className="btn-primary text-lg px-8 py-3">
              Keşfetmeye Başla
            </Link>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="space-y-8 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold border-l-4 border-primary-500 pl-4">Öne Çıkan Kitaplar</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-4 h-80 animate-pulse flex flex-col gap-4">
                <div className="w-full h-48 bg-slate-700/50 rounded-lg"></div>
                <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <h3 className="text-2xl text-slate-400">Henüz kitap bulunmuyor.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link href={`/books/${book.id}`} key={book.id} className="group">
                <div className="glass-card p-5 h-full flex flex-col cursor-pointer">
                  <div className="w-full h-64 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                    {book.image ? (
                      <img 
                        src={book.image} 
                        alt={book.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-700 to-slate-800">
                        <span className="text-slate-500">Görsel Yok</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-primary-300">
                      {book.category || 'Genel'}
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-primary-300 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">{book.author}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-white">₺{book.price}</span>
                      <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded">Stok: {book.stock}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
