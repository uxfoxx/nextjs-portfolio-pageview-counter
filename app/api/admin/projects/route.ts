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

    if (!title?.trim() || !description?.trim() || !content?.trim() || !slug?.trim() || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabaseClient();

    // Check if slug already exists
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          slug: slug.trim(),
          date,
          published: published || false,
          url: url?.trim() || null,
          repository: repository?.trim() || null,
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