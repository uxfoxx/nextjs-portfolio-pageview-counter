import { notFound } from "next/navigation";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";
import { Redis } from "@upstash/redis";
import { getSupabaseClient } from "@/lib/supabase/server";
import ReactMarkdown from 'react-markdown';

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

  const { data: projects } = await supabase
    .from('projects')
    .select('slug')
    .eq('published', true);

  return projects?.map((p) => ({ slug: p.slug })) || [];
}

export default async function PostPage({ params }: Props) {
  const slug = params?.slug;
  const supabase = getSupabaseClient();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (!project) {
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

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <ReactMarkdown>{project.content}</ReactMarkdown>
      </article>
    </div>
  );
}
