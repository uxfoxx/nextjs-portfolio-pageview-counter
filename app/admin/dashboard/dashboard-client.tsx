'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  date: string;
  published: boolean;
  url?: string;
  repository?: string;
}

export default function DashboardClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      alert('An error occurred while deleting the project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tl from-zinc-900 via-zinc-400/10 to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-100 mb-2">Admin Dashboard</h1>
            <p className="text-zinc-400">Manage your portfolio projects</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="mb-6">
          <Link
            href="/admin/dashboard/new"
            className="inline-block px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-lg transition"
          >
            + Add New Project
          </Link>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <p className="text-lg mb-2">No projects yet</p>
              <p className="text-sm">Create your first project to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 border-b border-zinc-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-100">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-100">Slug</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-100">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-100">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-zinc-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="text-zinc-100 font-medium">{project.title}</div>
                        <div className="text-zinc-400 text-sm mt-1">{project.description}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 text-sm font-mono">{project.slug}</td>
                      <td className="px-6 py-4 text-zinc-300 text-sm">
                        {new Date(project.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.published
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600'
                          }`}
                        >
                          {project.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/dashboard/edit/${project.id}`}
                            className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm rounded transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id, project.title)}
                            disabled={deletingId === project.id}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition border border-red-500/20 disabled:opacity-50"
                          >
                            {deletingId === project.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
