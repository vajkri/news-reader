import { prisma } from "@/lib/prisma";
import { FeedTable } from "@/components/features/feed/FeedTable";

export const revalidate = 60;

export default async function HomePage() {
  const sources = await prisma.source.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      category: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
    orderBy: { name: "asc" },
  });

  // Serialize Date objects to strings for client component
  const serialized = JSON.parse(JSON.stringify(sources));

  return (
    <div className="section-container py-6">
      <FeedTable sources={serialized} />
    </div>
  );
}
