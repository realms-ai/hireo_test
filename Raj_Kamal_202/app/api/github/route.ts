import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_URL = "https://api.github.com/search/repositories";
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";
  const perPage = "10";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${GITHUB_API_URL}?q=${encodeURIComponent(
        query
      )}&sort=stars&order=desc&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
