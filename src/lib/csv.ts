/** RFC 4180-style CSV parser: supports quoted fields, escaped quotes and CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(value);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else value += c;
  }
  if (quoted) throw new Error("Unterminated CSV field");
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}
/** Quote every field. Neutralize formula-like text without altering numeric values. */
export function encodeCsv(rows: (string | number | null)[][]): string {
  return rows
    .map((row) =>
      row
        .map((value) => {
          let text = value === null ? "" : String(value);
          if (typeof value === "string" && /^[=+@\-\t\r]/.test(text))
            text = "'" + text;
          return '"' + text.replaceAll('"', '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
}
