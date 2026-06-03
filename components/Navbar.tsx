'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 w-full z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold mr-4 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1 rounded-md">K</span>
          <span>Kutuphane</span>
        </Link>
        <div className="hidden md:flex gap-4">
          <Link href="/" className={buttonVariants({ variant: 'ghost' })}>
            Ana Sayfa
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/cart" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), "relative group")}>
          <ShoppingCart className="w-4 h-4" />
          <span className="sr-only">Sepet</span>
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[1.25rem] flex items-center justify-center h-5">
              {totalItems}
            </Badge>
          )}
        </Link>
        
        {user ? (
          <div className="flex items-center gap-2">
            {user.is_admin && (
              <Link
                href="/admin"
                className={cn(buttonVariants({ variant: 'outline' }), "gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground")}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}
            <Link href="/profile" className={cn(buttonVariants({ variant: 'ghost' }), "gap-2")}>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Siparişlerim</span>
            </Link>
            <Button variant="destructive" size="icon" onClick={logout} title="Çıkış Yap">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
              Giriş Yap
            </Link>
            <Link href="/register" className={buttonVariants({ variant: 'default' })}>
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
