import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MediaFrame, PageHero, Section } from "@/components/site/primitives";
import { CardSkeletonGrid, EmptyState, ErrorState } from "@/components/site/states";
import { albumsQuery } from "@/lib/content";

const title = "Photo Gallery";
const description = "Albums from school life at Sample1 School - events, trips, sport, arts and everyday moments.";

export const Route = createFileRoute("/_public/gallery")({
  head: () => ({
    meta: [
      { title: `${title} - Sample1 School` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const albums = useQuery(albumsQuery());

  return (
    <>
      <PageHero eyebrow="Gallery" title={title} description={description} />
      <Section>
        {albums.isPending ? (
          <CardSkeletonGrid count={6} />
        ) : albums.isError ? (
          <ErrorState onRetry={() => albums.refetch()} />
        ) : albums.data.length === 0 ? (
          <EmptyState
            title="No albums published yet"
            description="Create an album in the admin area and upload images to the media library."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.data.map((album) => (
              <Link
                key={album.id}
                to="/gallery/$slug"
                params={{ slug: album.slug }}
                className="group overflow-hidden rounded-xl border bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <MediaFrame src={album.cover_image_url} alt={album.title} ratio="aspect-[4/3]" />
                <div className="p-5">
                  <h2 className="text-lg font-semibold group-hover:underline">{album.title}</h2>
                  {album.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{album.description}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
