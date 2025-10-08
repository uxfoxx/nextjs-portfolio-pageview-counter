import { isAuthenticated } from '@/lib/auth/pin';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import AdminNav from './components/AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <AdminNav />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
