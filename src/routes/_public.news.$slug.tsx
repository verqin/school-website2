import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaFrame, PageHero, Prose, Section } from "@/components/site/primitives";
import { EmptyState, ErrorState } from "@/components/site/states";
import { formatDate, newsPostQuery } from "@/lib/content";

export const Route = createFileRoute("/_public/news/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `News - Sample1 School` },
      { name: "description", content: `Read the latest from Sample1 School: ${params.slug.replace(/-/g, " ")}.` },
      { property: "og:title", content: "News - Sample1 School" },
      { property: "og:description", content: "A story from the Sample1 School community." },
    ],
  }),
  component: NewsDetailPage,
});

function NewsDetailPage() {
  const { slug } = Route.useParams();
  const post = useQuery(newsPostQuery(slug));

  if (post.isPending) {
    return (
      <Section>
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
        </div>
      </Section>
    );
  }

  if (post.isError) {
    return (
      <Section>
        <ErrorState onRetry={() => post.refetch()} />
      </Section>
    );
  }

  if (!post.data) {
    return (
      <Section>
        <EmptyState
          title="Story not found"
          description="This article may have been unpublished or the link is incorrect."
          action={
            <Button asChild variant="outline">
              <Link to="/news">Back to news</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={`${post.data.category ?? "News"} · ${formatDate(post.data.published_at ?? post.data.created_at)}`}
        title={post.data.title}
        description={post.data.excerpt ?? undefined}
      />
      <Section>
        <article className="mx-auto max-w-3xl">
          {post.data.cover_image_url ? (
            <MediaFrame src={post.data.cover_image_url} alt={post.data.title} ratio="aspect-[16/9]" className="mb-8" />
          ) : null}
          <Prose text={post.data.body ?? ""} />
          <div className="mt-10">
            <Button asChild variant="outline">
              <Link to="/news">Back to all news</Link>
            </Button>
          </div>
        </article>
      </Section>
    </>
  );
}
