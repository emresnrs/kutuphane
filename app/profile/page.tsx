'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/utils/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Package, User, Settings, Camera, LogOut, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  const { user, isLoading: isAuthLoading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  // Settings State
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
    if (user && user.profile_image) {
      setProfileImage(user.profile_image);
    }
    if (user && user.username) {
      setUsername(user.username);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Fotoğraf boyutu 2MB'dan küçük olmalıdır.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }
    
    setIsUpdating(true);
    try {
      const data = await fetchAPI('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
          profileImage
        })
      });
      updateUser(data.user);
      toast.success(data.message || 'Profil başarıyla güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Güncelleme başarısız oldu.');
      } finally {
        setIsUpdating(false);
      }
    };
  
    const handleCancelOrder = async (orderId: number) => {
      if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) return;
      
      try {
        const data = await fetchAPI(`/orders/${orderId}`, {
          method: 'DELETE',
        });
        toast.success(data.message || 'Sipariş iptal edildi.');
        setOrders(orders.filter(o => o.id !== orderId));
      } catch (err: any) {
        toast.error(err.message || 'Sipariş iptal edilemedi.');
      }
    };
  
    if (isAuthLoading || (isLoading && user)) {
    return (
      <div className="py-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        <Card className="w-full md:w-1/3 xl:w-1/4 h-[300px]">
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 h-full">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-6 w-32" />
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

  if (!user) return null;

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* User Sidebar */}
        <div className="w-full md:w-1/3 xl:w-1/4">
          <Card className="sticky top-24">
            <CardContent className="p-6 text-center">
              <div className="relative w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-primary-foreground mb-4 overflow-hidden border-4 border-background shadow-sm">
                {profileImage ? (
                  <img src={profileImage} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  (user.username || user.email).charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-1 line-clamp-1">{user.username || user.email}</h2>
              {user.username && <p className="text-sm text-muted-foreground mb-4">{user.email}</p>}
              <Badge variant="outline" className="mb-6 mt-2">
                {user.is_admin ? 'Yönetici' : 'Üye'}
              </Badge>
              
              <div className="flex flex-col gap-2 mt-4">
                <Button 
                  variant={activeTab === 'orders' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Siparişlerim
                </Button>
                <Button 
                  variant={activeTab === 'settings' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Hesap Ayarları
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-2/3 xl:w-3/4">
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in">
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
                      <div className="bg-muted px-6 py-4 flex flex-wrap justify-between items-center border-b gap-4">
                        <div className="flex gap-8 flex-wrap">
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
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleCancelOrder(order.id)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Siparişi İptal Et
                        </Button>
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
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in">
              <h1 className="text-3xl font-bold tracking-tight mb-8">Hesap Ayarları</h1>
              
              <Card>
                <form onSubmit={handleUpdateProfile}>
                  <CardHeader>
                    <CardTitle>Profil ve Güvenlik</CardTitle>
                    <CardDescription>Profil fotoğrafınızı ve parolanızı bu alandan güncelleyebilirsiniz.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Profil Resmi */}
                    <div className="space-y-4">
                      <Label>Profil Fotoğrafı</Label>
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 bg-muted rounded-full overflow-hidden border-2 border-border flex items-center justify-center">
                          {profileImage ? (
                            <img src={profileImage} alt="Profil Önizleme" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Fotoğraf Değiştir
                            </Button>
                            {profileImage && (
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={() => setProfileImage(null)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Kaldır
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Önerilen boyut: 1:1, Max 2MB.</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6"></div>

                    {/* Kullanıcı Adı */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Kişisel Bilgiler</h3>
                      <div className="space-y-2 max-w-sm">
                        <Label htmlFor="username">Kullanıcı Adı</Label>
                        <Input 
                          id="username" 
                          type="text" 
                          placeholder="Kullanıcı adınızı girin" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6"></div>

                    {/* Şifre Değiştirme */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Şifre Değiştir</h3>
                      <div className="space-y-2 max-w-sm">
                        <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          placeholder="••••••••" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <Label htmlFor="newPassword">Yeni Şifre</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          placeholder="••••••••" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          placeholder="••••••••" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                  </CardContent>
                  <CardFooter className="bg-muted/50 px-6 py-4 flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
