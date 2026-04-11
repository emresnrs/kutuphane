'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

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

    toast.success(`${quantity} adet kitapsepete eklendi.`);
    router.push('/cart');
  };

  if (isLoading) {
    return (
      <div className="py-12 md:py-20 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6 md:p-12 flex flex-col md:flex-row gap-12">
            <Skeleton className="w-full md:w-1/3 aspect-[2/3] rounded-xl" />
            <div className="w-full md:w-2/3 flex flex-col pt-4 space-y-6">
              <Skeleton className="h-6 w-24 rounded-full" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-12 w-32 mt-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-12">
            <h2 className="text-2xl text-muted-foreground">Kitap bulunamadı.</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto">
      <Card className="overflow-hidden border-none shadow-xl bg-card/50">
        <CardContent className="p-6 md:p-12">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Image */}
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="w-full aspect-[2/3] bg-muted rounded-xl overflow-hidden shadow-sm border">
                {book.image ? (
                  <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-muted-foreground text-lg">Görsel Yok</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="w-full md:w-2/3 flex flex-col pt-4">
              <Badge className="w-max mb-6" variant="default" py-1 px-3>
                {book.category || 'Roman'}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-foreground">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-8 font-medium">{book.author}</p>

              <div className="text-4xl font-extrabold text-primary mb-8">
                ₺{Math.abs(book.price).toFixed(2)}
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-12">
                <div className="flex items-center bg-secondary rounded-md p-1 border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}
                    disabled={quantity >= book.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm">
                  Stok durumu: <span className="font-bold text-foreground">{book.stock > 0 ? `${book.stock} adet mevcut` : 'Tükendi'}</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                className="w-full md:w-auto px-12 py-6 text-lg mt-auto gap-2"
                disabled={book.stock === 0}
              >
                <ShoppingCart className="h-5 w-5" />
                {book.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
