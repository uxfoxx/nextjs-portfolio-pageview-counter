'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import imageCompression from 'browser-image-compression';
import { useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type as any,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Image compression error:', error);
      return file;
    }
  };

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);

    try {
      const compressedFile = await compressImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { url } = await response.json();

      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-800/50 overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-700 bg-zinc-900/50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('bold') ? 'bg-zinc-700' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4 text-zinc-300" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('italic') ? 'bg-zinc-700' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4 text-zinc-300" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700' : ''
          }`}
          title="Heading"
        >
          <Heading2 className="w-4 h-4 text-zinc-300" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('bulletList') ? 'bg-zinc-700' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4 text-zinc-300" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('orderedList') ? 'bg-zinc-700' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4 text-zinc-300" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('blockquote') ? 'bg-zinc-700' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4 text-zinc-300" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('codeBlock') ? 'bg-zinc-700' : ''
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4 text-zinc-300" />
        </button>

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-zinc-700 transition ${
            editor.isActive('link') ? 'bg-zinc-700' : ''
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4 text-zinc-300" />
        </button>

        <label
          className={`p-2 rounded hover:bg-zinc-700 transition cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4 text-zinc-300" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-zinc-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="w-4 h-4 text-zinc-300" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-zinc-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="w-4 h-4 text-zinc-300" />
        </button>

        {uploading && (
          <span className="ml-auto text-xs text-zinc-400 flex items-center">
            Uploading...
          </span>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
