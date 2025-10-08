'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Plus, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/projects/new', label: 'New Project', icon: Plus },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-zinc-800 border-r border-zinc-700 flex flex-col">
      <div className="p-6 border-b border-zinc-700">
        <h1 className="text-xl font-bold text-zinc-100">Admin Panel</h1>
        <p className="text-xs text-zinc-400 mt-1">Project Management</p>
      </div>

      <div className="flex-1 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-zinc-700">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </nav>
  );
}
