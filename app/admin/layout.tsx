'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Not logged in → go to login
      router.replace('/login');
    } else if (!isLoading && user && !user.is_admin) {
      // Logged in but not admin → 403 forbidden
      router.replace('/forbidden');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.is_admin) return null;

  return (
    <div className="flex min-h-screen -mx-4 md:-mx-6">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-background/50">
        <div className="p-6 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
