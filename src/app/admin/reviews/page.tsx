import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/primitives";

const reviews = [
  {
    id: "r1",
    author: "Ada O.",
    professional: "Okeke Electricals",
    excerpt: "Excellent work and clear communication throughout.",
  },
  {
    id: "r2",
    author: "Tunde A.",
    professional: "FreshCoat Painting",
    excerpt: "Arrived on time, finished neatly, fair pricing.",
  },
];

export default function AdminReviewsPage() {
  return (
    <PageShell
      title="Review moderation"
      description="Review list with detail view. Flag / remove reviews that violate platform rules."
    >
      <div className="space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="ui-card p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl text-black">
                  {review.professional}
                </h2>
                <p className="mt-1 text-sm text-muted">by {review.author}</p>
                <p className="mt-3 text-sm">{review.excerpt}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Flag
                </Button>
                <Button size="sm" variant="danger">
                  Remove
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
