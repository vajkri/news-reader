import { fetchAndPersistArticles } from "@/lib/fetch-sources";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await fetchAndPersistArticles();
  return Response.json(result);
}
