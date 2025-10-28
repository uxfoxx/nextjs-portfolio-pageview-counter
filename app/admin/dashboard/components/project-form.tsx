'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Save, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const RichTextEditor = dynamic(() => import('@/app/components/rich-text-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-zinc-800/50 border border-zinc-700 rounded-lg flex items-center justify-center">
      <p className="text-zinc-400">Loading editor...</p>
    </div>
  ),
});

interface ProjectFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    content: string;
    slug: string;
    date: string;
    published: boolean;
    url?: string;
    repository?: string;
    cover_image_url?: string;
  };
  isEdit?: boolean;
}

export default function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    slug: initialData?.slug || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    published: initialData?.published !== undefined ? initialData.published : true,
    url: initialData?.url || '',
    repository: initialData?.repository || '',
  });

  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState(initialData?.cover_image_url || '');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEdit ? generateSlug(title) : prev.slug,
    }));
  };

  const handleCoverImageChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setCoverImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverImagePreview(previewUrl);

    // Upload the image
    setUploadingCover(true);
    try {
      // Compress the image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setCoverImageUrl(data.url);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload cover image. Please try again.');
      // Reset on error
      setCoverImageFile(null);
      setCoverImagePreview('');
      URL.revokeObjectURL(previewUrl);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverImageChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleCoverImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImageUrl('');
    if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview('');
  };

  // Cleanup blob URLs on unmount
  React.useEffect(() => {
    return () => {
      if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/projects/${initialData?.id}`
        : '/api/admin/projects';

      const method = isEdit ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        cover_image_url: coverImageUrl || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save project');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-100 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-zinc-100 mb-2">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent font-mono text-sm"
            required
          />
          <p className="mt-1 text-xs text-zinc-400">URL-friendly identifier (e.g., my-project)</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-100 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-100">
            Cover Image
          </label>
          
          {!coverImagePreview ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-zinc-400 bg-zinc-800/50'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingCover}
              />
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-zinc-400">
                  {uploadingCover ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-400"></div>
                  ) : (
                    <Upload className="w-full h-full" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-zinc-100">
                    {uploadingCover ? 'Uploading...' : 'Drop your cover image here'}
                  </p>
                  <p className="text-sm text-zinc-400">
                    or click to browse (PNG, JPG, GIF up to 10MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={removeCoverImage}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                disabled={uploadingCover}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                  {uploadingCover ? 'Processing image...' : 'Cover image ready'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleCoverImageChange(file);
                    };
                    input.click();
                  }}
                  className="text-sm text-zinc-400 hover:text-zinc-300 font-medium"
                  disabled={uploadingCover}
                >
                  Change Image
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-100 mb-2">
            Content * (Rich Text Editor)
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-zinc-100 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="published" className="block text-sm font-medium text-zinc-100 mb-2">
              Status
            </label>
            <div className="flex items-center h-[42px]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span className="ms-3 text-sm font-medium text-zinc-300">
                  {formData.published ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-zinc-100 mb-2">
            Project URL
          </label>
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="repository" className="block text-sm font-medium text-zinc-100 mb-2">
            Repository URL
          </label>
          <input
            type="url"
            id="repository"
            value={formData.repository}
            onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || uploadingCover}
          className="px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || uploadingCover ? 'Processing...' : isEdit ? 'Update Project' : 'Create Project'}
        </button>

        <Link
          href="/admin/dashboard"
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded-lg transition"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}