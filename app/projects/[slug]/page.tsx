import { notFound } from "next/navigation";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";
import { Redis } from "@upstash/redis";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 60;
export const dynamic = 'force-dynamic';

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

export default async function PostPage({ params }: Props) {
  const slug = params?.slug;

  const supabase = createServerClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

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
      <Header project={project as any} views={views} />
      <ReportView slug={(project as any).slug} />

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <div dangerouslySetInnerHTML={{ __html: (project as any).content || '' }} />
      </article>
    </div>
  );
}
