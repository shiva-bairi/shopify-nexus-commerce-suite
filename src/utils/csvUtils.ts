
export function toCSV(headers: string[], data: Record<string, any>[]): string {
  const escape = (v: any) =>
    typeof v === "string"
      ? `"${v.replace(/"/g, '""')}"`
      : v === null || v === undefined
      ? ""
      : v;
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((key) => escape(row[key])).join(",")),
  ].join("\r\n");
  return csv;
}

export function parseCSV(csv: string): Record<string, string>[] {
  // Simple CSV parser for admin-usable files (no multiline cell support)
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines
    .map((line) => {
      const values = line.split(",");
      return headers.reduce((obj, h, i) => {
        obj[h.trim()] = (values[i] || "").trim();
        return obj;
      }, {} as Record<string, string>);
    })
    .filter((row) => Object.values(row).some((v) => v !== ""));
}
