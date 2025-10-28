import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await getAdminSession();

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, content, slug, date, published, url, repository, cover_image_url } = body;

    if (!title || !description || !content || !slug || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          content,
          slug,
          date,
          published: published || false,
          url: url || null,
          repository: repository || null,
          cover_image_url: cover_image_url || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Revalidate the projects page and the new project page
    revalidatePath('/projects');
    revalidatePath(`/projects/${data.slug}`);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}