import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, url, category } = body as {
    name: string;
    url: string;
    category?: string;
  };

  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: "Name and URL are required" },
      { status: 400 }
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const source = await prisma.source.create({
      data: { name: name.trim(), url: url.trim(), category: category?.trim() || null },
    });
    return NextResponse.json(source, { status: 201 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A source with this URL already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
