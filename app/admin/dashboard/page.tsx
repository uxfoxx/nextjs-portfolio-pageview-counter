import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import DeleteButton from '../components/DeleteButton';
import TogglePublishButton from '../components/TogglePublishButton';
import { Project } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

async function getProjects(): Promise<Project[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
}

export default async function AdminDashboard() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-zinc-400 mt-2">Manage your portfolio projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Create New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 mb-4">No projects yet</p>
          <Link
            href="/admin/projects/new"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
          <table className="w-full">
            <thead className="bg-zinc-900 border-b border-zinc-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Cover</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Title</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    {project.cover_image_url ? (
                      <img
                        src={project.cover_image_url}
                        alt={project.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center">
                        <span className="text-zinc-500 text-xs">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-zinc-100">{project.title}</p>
                      <p className="text-sm text-zinc-400 truncate max-w-xs">{project.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        project.published
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {project.published ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {project.date ? format(new Date(project.date), 'MMM d, yyyy') : 'No date'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <TogglePublishButton projectId={project.id} published={project.published} />
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteButton projectId={project.id} projectTitle={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-zinc-400">
        Total projects: {projects.length} ({projects.filter(p => p.published).length} published, {projects.filter(p => !p.published).length} drafts)
      </div>
    </div>
  );
}
