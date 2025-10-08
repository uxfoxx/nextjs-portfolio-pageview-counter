import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import ProjectForm from '../../components/project-form';

export default async function EditProject({ params }: { params: { id: string } }) {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const supabase = getAdminSupabaseClient();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !project) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-tl from-zinc-900 via-zinc-400/10 to-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">Edit Project</h1>
          <p className="text-zinc-400">Update project information</p>
        </div>

        <ProjectForm initialData={project} isEdit={true} />
      </div>
    </div>
  );
}
