import { NextRequest, NextResponse } from "next/server";
import { countries } from "@/lib/countries";
import { indicatorKeys } from "@/lib/indicators";
import { getWages } from "@/lib/api/oecd";
import { getSeries } from "@/lib/api/worldBank";
export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "US";
  const indicator = request.nextUrl.searchParams.get("indicator");
  if (
    !countries.some((c) => c.code === country) ||
    !indicatorKeys.some((k) => k === indicator)
  )
    return NextResponse.json(
      { error: "Invalid country or indicator" },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      indicator === "wages"
        ? await getWages(country)
        : await getSeries(country, indicator as (typeof indicatorKeys)[number]),
    );
  } catch (error) {
    console.error(
      "Economic provider request failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Unable to load economic data." },
      { status: 502 },
    );
  }
}
