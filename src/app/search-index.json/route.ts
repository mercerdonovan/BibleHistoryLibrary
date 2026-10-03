import { getSearchDocuments } from "@/lib/tracts";

export const dynamic = "force-static";

/** Full-text index, generated at build time and fetched by the search page. */
export async function GET() {
  return Response.json(await getSearchDocuments());
}
