import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const sourceId = searchParams.get("sourceId");
  const category = searchParams.get("category");
  const isRead = searchParams.get("isRead");
  const sort = searchParams.get("sort") ?? "date";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (sourceId) where.sourceId = parseInt(sourceId, 10);
  if (isRead !== null && isRead !== "") {
    where.isRead = isRead === "true";
  }
  if (category) {
    where.source = { category };
  }

  const orderBy =
    sort === "readTime"
      ? [{ readTimeMin: "desc" as const }, { publishedAt: "desc" as const }]
      : [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { source: { select: { name: true, category: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({ articles, total, page, limit });
}
