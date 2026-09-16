import { Download } from "lucide-react";
export function CsvDownload({
  filename,
  rows,
}: {
  filename: string;
  rows: (string | number | null)[][];
}) {
  return (
    <form method="post" action="/api/export">
      <input type="hidden" name="filename" value={filename} />
      <input type="hidden" name="rows" value={JSON.stringify(rows)} />
      <button className="csv-download" type="submit">
        <Download size={14} />
        Download CSV
      </button>
    </form>
  );
}
