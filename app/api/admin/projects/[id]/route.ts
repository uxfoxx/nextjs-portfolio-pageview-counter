import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if slug already exists (excluding current project)
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .maybeSingle();

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        slug: slug.trim(),
        date,
        published: published || false,
        url: url?.trim() || null,
        repository: repository?.trim() || null,
        cover_image_url,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Revalidate the projects page and the updated project page
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await getAdminSession();

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getAdminSupabaseClient();

    // First, get the project to retrieve its slug for cache invalidation
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('slug')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Revalidate the projects page and the deleted project page
    revalidatePath('/projects');
    if (project?.slug) {
      revalidatePath(`/projects/${project.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}