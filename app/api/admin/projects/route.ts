import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if service role key is available and properly loaded
    console.log('Service role key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Service role key (first 20 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20));
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Environment NODE_ENV:', process.env.NODE_ENV);

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
    
    // Debug: Test the client by attempting a simple query first
    console.log('Testing Supabase client with service role...');
    const { data: testData, error: testError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Service role client test failed:', testError);
    } else {
      console.log('Service role client test successful');
    }

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

    console.log('Attempting to insert project with data:', {
      title: title.trim(),
      slug: slug.trim(),
      published: published || false
    });

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
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.log('Project created successfully:', data.id);

    // Revalidate the projects page and the new project page
    revalidatePath('/projects');
    revalidatePath(`/projects/${data.slug}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}