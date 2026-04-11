'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/utils/api';
import { useCart } from '@/context/CartContext';

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [book, setBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const loadBook = async () => {
      try {
        const data = await fetchAPI(`/books/${resolvedParams.id}`);
        setBook(data);
      } catch (error) {
        console.error('Failed to load book', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBook();
  }, [resolvedParams.id]);

  const handleAddToCart = () => {
    if (!book) return;
    
    addToCart({
      book_id: book.id,
      title: book.title,
      price: book.price,
      image: book.image,
      quantity,
    });
    
    // Optional feedback loop
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20 glass-card mt-12">
        <h2 className="text-3xl text-slate-400">Kitap bulunamadı.</h2>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      <div className="glass-card p-6 md:p-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Image */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="w-full aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden shadow-2xl">
              {book.image ? (
                <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-700 to-slate-800">
                  <span className="text-slate-500 text-lg">Görsel Yok</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="w-full md:w-2/3 flex flex-col pt-4">
            <div className="inline-block px-3 py-1 bg-primary-900/50 text-primary-300 font-bold text-sm rounded-full w-max mb-4">
              {book.category || 'Roman'}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{book.title}</h1>
            <p className="text-xl text-slate-400 mb-8">{book.author}</p>
            
            <div className="text-4xl font-extrabold text-white mb-8">
              ₺{book.price}
            </div>

            <div className="flex items-center gap-6 mb-12">
              <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex, items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}
                  className="w-10 h-10 flex, items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-slate-400">
                Stokta <strong className="text-white">{book.stock}</strong> adet mevcut
              </span>
            </div>

            <button 
              onClick={handleAddToCart}
              className="btn-primary text-lg w-full md:w-auto px-12 py-4 mt-auto rounded-xl"
              disabled={book.stock === 0}
            >
              {book.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
