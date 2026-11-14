import { getSearchDocuments } from "@/lib/books";

export const dynamic = "force-static";

/** Full-text index of every chapter, generated at build time and fetched by the search page. */
export async function GET() {
  return Response.json(await getSearchDocuments());
}
