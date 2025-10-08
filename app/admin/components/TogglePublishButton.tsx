'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TogglePublishButtonProps {
  projectId: string;
  published: boolean;
}

export default function TogglePublishButton({ projectId, published }: TogglePublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to update project status');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        published
          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
          : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
      } disabled:opacity-50`}
      title={published ? 'Unpublish' : 'Publish'}
    >
      {published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}
