'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/utils/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, User, SeparatorHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderItem {
  id: number;
  book_id: number;
  title: string;
  price: string;
  image: string;
  quantity: number;
}

interface Order {
  id: number;
  total_price: string;
  created_at: string;
  items: OrderItem[];
}

export default function Profile() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      try {
        const data = await fetchAPI('/orders');
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Siparişler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (isAuthLoading || (isLoading && user)) {
    return (
      <div className="py-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        <Card className="w-full md:w-1/3 xl:w-1/4 h-[300px]">
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 h-full">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
        <div className="w-full md:w-2/3 xl:w-3/4 space-y-6">
          <Skeleton className="h-10 w-48 mb-6" />
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-1/3" /></CardHeader>
              <CardContent><Skeleton className="h-16 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  return (
    <div className="py-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* User Card */}
        <div className="w-full md:w-1/3 xl:w-1/4">
          <Card className="sticky top-24">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-primary-foreground mb-4">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-1 line-clamp-1">{user.email}</h2>
              <Badge variant="outline" className="mb-6">
                {user.is_admin ? 'Yönetici' : 'Üye'}
              </Badge>
              
              <Button variant="secondary" className="w-full justify-start mt-4">
                <User className="mr-2 h-4 w-4" />
                Hesap Ayarları
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="w-full md:w-2/3 xl:w-3/4">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Sipariş Geçmişim</h1>

          {error && (
            <Card className="border-destructive/50 bg-destructive/10 mb-8">
              <CardContent className="p-4 text-destructive font-medium">
                {error}
              </CardContent>
            </Card>
          )}

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold tracking-tight mb-2">Henüz Siparişiniz Yok</h3>
                <p className="text-muted-foreground mb-6">İlk siparişinizi hemen oluşturabilirsiniz.</p>
                <Link href="/" className={buttonVariants({ size: 'lg' })}>Alışverişe Başla</Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <div className="bg-muted px-6 py-4 flex flex-wrap justify-between items-center border-b">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Sipariş Tarihi</p>
                      <p className="text-sm font-bold">
                        {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Sipariş No</p>
                      <p className="text-sm">#{order.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Toplam</p>
                      <p className="text-sm text-primary font-bold">₺{parseFloat(order.total_price).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-muted rounded flex-shrink-0 overflow-hidden border">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <Link href={`/books/${item.book_id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">₺{item.price} x {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
