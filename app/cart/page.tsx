'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchAPI } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Devam etmek için giriş yapmalısınız.');
      router.push('/login');
      return;
    }

    if (cart.length === 0) return;

    setIsOrdering(true);

    try {
      await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({
          total_price: totalPrice,
          items: cart.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      clearCart();
      toast.success('Siparişiniz başarıyla alındı!');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Sipariş oluşturulamadı.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Sepetiniz Boş</h2>
        <p className="text-muted-foreground mb-8">Henüz sepetinize hiç kitap eklemediniz.</p>
        <Link href="/" className={buttonVariants({ size: 'lg' })}>Kitapları Keşfet</Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Sepetim ({totalItems} Ürün)</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 space-y-4">
          {cart.map((item) => (
            <Card key={item.book_id}>
              <CardContent className="p-4 flex gap-6 items-center">
                <div className="w-20 h-28 bg-muted rounded overflow-hidden flex-shrink-0 border">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-primary font-medium">₺{parseFloat(item.price as string).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-2">Adet: <strong className="text-foreground">{item.quantity}</strong></p>
                </div>
                <div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      removeFromCart(item.book_id);
                      toast.info(`${item.title} sepetten çıkarıldı.`);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full lg:w-1/3">
          <Card className="sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle>Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Ara Toplam</span>
                <span>₺{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Kargo</span>
                <span className="text-green-600 font-medium">Ücretsiz</span>
              </div>
              <Separator />
              <div className="flex justify-between text-2xl font-extrabold pb-2">
                <span>Toplam</span>
                <span className="text-primary">₺{totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={isOrdering}
              >
                {isOrdering ? 'Siparişiniz Alınıyor...' : (user ? 'Siparişi Tamamla' : 'Giriş Yap ve Devam Et')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
