'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/app/admin/components/ImageUpload';
import RichTextEditor from '@/app/admin/components/RichTextEditor';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProject({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    cover_image_url: null as string | null,
    published: false,
    date: '',
    url: '',
    repository: '',
  });

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${params.id}`);
      if (response.ok) {
        const { project } = await response.json();
        setFormData({
          title: project.title,
          slug: project.slug,
          description: project.description,
          content: project.content || '',
          cover_image_url: project.cover_image_url,
          published: project.published,
          date: project.date ? new Date(project.date).toISOString().split('T')[0] : '',
          url: project.url || '',
          repository: project.repository || '',
        });
      } else {
        alert('Failed to load project');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent, publish?: boolean) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = publish !== undefined
        ? { ...formData, published: publish }
        : formData;

      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-zinc-100 mb-8">Edit Project</h1>

      <form className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Project title"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-zinc-300 mb-2">
            Slug *
          </label>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="project-slug"
            required
          />
          <p className="mt-1 text-sm text-zinc-500">
            URL: /projects/{formData.slug}
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Brief description of the project"
            required
          />
        </div>

        <div>
          <ImageUpload
            label="Cover Image"
            value={formData.cover_image_url}
            onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
            bucket="cover"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Content
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-zinc-300 mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-zinc-300 mb-2">
              Project URL
            </label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="repository" className="block text-sm font-medium text-zinc-300 mb-2">
            Repository URL
          </label>
          <input
            id="repository"
            type="url"
            value={formData.repository}
            onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-zinc-700">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={saving || !formData.title || !formData.description}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving || !formData.title || !formData.description}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
        </div>
      </form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full border border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Delete Project</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete <span className="font-medium text-zinc-200">{formData.title}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
