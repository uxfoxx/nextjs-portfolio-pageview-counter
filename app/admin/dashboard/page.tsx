import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import DashboardClient from './dashboard-client';

export default async function AdminDashboard() {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const supabase = getAdminSupabaseClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
  }

  return <DashboardClient projects={projects || []} />;
}
