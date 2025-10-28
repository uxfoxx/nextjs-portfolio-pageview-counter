import { notFound } from "next/navigation";
import { Header } from "./header";
import { ReportView } from "./view";
import { Redis } from "@upstash/redis";
import { getSupabaseClient } from "@/lib/supabase/server";

export const revalidate = 60;

type Props = {
  params: {
    slug: string;
  };
};

let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn("Redis not configured, view counts will be disabled");
}

export async function generateStaticParams(): Promise<Props["params"][]> {
  const supabase = getSupabaseClient();

  console.log('[generateStaticParams] Fetching published projects for static generation...');

  const { data: projects } = await supabase
    .from('projects')
    .select('slug')
    .eq('published', true);

  const slugs = projects?.map((p) => ({ slug: p.slug })) || [];
  console.log('[generateStaticParams] Generated slugs:', slugs.map(s => s.slug));
  console.log('[generateStaticParams] Total projects found:', slugs.length);

  return slugs;
}

export default async function PostPage({ params }: Props) {
  const slug = params?.slug;
  console.log('[PostPage] Received slug parameter:', slug);

  const supabase = getSupabaseClient();

  console.log('[PostPage] Querying project with slug:', slug);

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, slug, description, content, date, url, repository, cover_image_url')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  console.log('[PostPage] Query result:', project ? 'Project found' : 'No project found');
  if (project) {
    console.log('[PostPage] Project details:', {
      id: project.id,
      title: project.title,
      slug: project.slug,
      published: true // We only query published projects
    });
  } else {
    console.log('[PostPage] No project found for slug:', slug);
  }

  if (!project) {
    console.log('[PostPage] Calling notFound() for slug:', slug);
    notFound();
  }

  let views = 0;

  if (redis) {
    try {
      views = (await redis.get<number>(["pageviews", "projects", slug].join(":"))) ?? 0;
    } catch (e) {
      console.warn("Failed to fetch views from Redis");
    }
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <Header project={project} views={views} />
      <ReportView slug={project.slug} />

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless max-w-4xl">
        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-2xl">
            <img
              src={project.cover_image_url}
              alt={`${project.title} cover`}
              className="w-full h-64 md:h-80 lg:h-96 object-cover"
            />
          </div>
        )}
        
        {project.content ? (
          <div dangerouslySetInnerHTML={{ __html: project.content }} />
        ) : (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-lg">No content available for this project.</p>
          </div>
        )}
      </article>
    </div>
  );
}
