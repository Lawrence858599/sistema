import { NextResponse } from "next/server";
import { catalogService } from "@/services/catalog-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await catalogService.getCatalogPageData({
    query: searchParams.get("query") ?? undefined,
    categorySlug: searchParams.get("categorySlug") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  return NextResponse.json(data);
}
