import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sourceId = parseInt(id, 10);
  if (isNaN(sourceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  await prisma.source.delete({ where: { id: sourceId } });
  return NextResponse.json({ ok: true });
}
