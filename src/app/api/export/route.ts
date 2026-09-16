import { encodeCsv } from "@/lib/csv";
/** Same-origin attachment response also works in browsers that restrict blob downloads. */
export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > 2_000_000)
    return new Response("Export is too large", { status: 413 });
  const form = new URLSearchParams(body);
  const filename = form.get("filename") ?? "econlens.csv";
  if (!/^econlens-[a-zA-Z0-9-]+\.csv$/.test(filename))
    return new Response("Invalid filename", { status: 400 });
  try {
    const rows: unknown = JSON.parse(form.get("rows") ?? "null");
    if (
      !Array.isArray(rows) ||
      rows.length > 1000 ||
      !rows.every(
        (row) =>
          Array.isArray(row) &&
          row.length <= 20 &&
          row.every(
            (cell) =>
              cell === null ||
              typeof cell === "string" ||
              (typeof cell === "number" && Number.isFinite(cell)),
          ),
      )
    )
      return new Response("Invalid export data", { status: 400 });
    return new Response(encodeCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Invalid export data", { status: 400 });
  }
}
