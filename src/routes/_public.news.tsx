import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MediaFrame, PageHero, Section } from "@/components/site/primitives";
import { CardSkeletonGrid, EmptyState, ErrorState } from "@/components/site/states";
import { formatDate, newsListQuery } from "@/lib/content";

const title = "School News";
const description = "Announcements, achievements and stories from across the Sample1 School community.";

export const Route = createFileRoute("/_public/news")({
  head: () => ({
    meta: [
      { title: `${title} - Sample1 School` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const news = useQuery(newsListQuery());

  return (
    <>
      <PageHero eyebrow="Newsroom" title={title} description={description} />
      <Section>
        {news.isPending ? (
          <CardSkeletonGrid count={6} />
        ) : news.isError ? (
          <ErrorState onRetry={() => news.refetch()} />
        ) : news.data.length === 0 ? (
          <EmptyState
            title="No news published yet"
            description="Published stories will appear here, newest first."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.data.map((post) => (
              <article key={post.id} className="group flex flex-col overflow-hidden rounded-xl border bg-card">
                <MediaFrame src={post.cover_image_url} alt={post.title} ratio="aspect-[16/10]" />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-medium text-secondary">
                    {post.category ?? "News"} · {formatDate(post.published_at ?? post.created_at)}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">
                    <Link
                      to="/news/$slug"
                      params={{ slug: post.slug }}
                      className="underline-offset-4 group-hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
