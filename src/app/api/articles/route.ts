import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;

  const sourceId = searchParams.get("sourceId");
  const category = searchParams.get("category");
  const isRead = searchParams.get("isRead");
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "date";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  const where: Prisma.ArticleWhereInput = {};
  const andConditions: Prisma.ArticleWhereInput[] = [];

  if (sourceId) where.sourceId = parseInt(sourceId, 10);
  if (isRead !== null && isRead !== "") where.isRead = isRead === "true";
  if (category) andConditions.push({ source: { category } });
  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search } },
        { source: { name: { contains: search } } },
      ],
    });
  }
  if (andConditions.length > 0) where.AND = andConditions;

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
