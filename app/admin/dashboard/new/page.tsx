import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProjectForm from '../components/project-form';

export default async function NewProject() {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-tl from-zinc-900 via-zinc-400/10 to-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">Add New Project</h1>
          <p className="text-zinc-400">Create a new project for your portfolio</p>
        </div>

        <ProjectForm />
      </div>
    </div>
  );
}
