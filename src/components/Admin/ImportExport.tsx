
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Import, Export, FileCsv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toCSV, parseCSV } from "@/utils/csvUtils";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type ProductRow = {
  id: string;
  name: string;
  sku?: string | null;
  stock: number;
};

const ImportExport = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<"export" | "import" | false>(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewRows, setPreviewRows] = useState<ProductRow[] | null>(null);

  // 1. Export CSV - download current products
  async function handleExport() {
    setLoading("export");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, stock");

      if (error) throw new Error(error.message);

      const csv = toCSV(
        ["id", "name", "sku", "stock"],
        data as ProductRow[]
      );

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `products-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast({ title: "Export successful", description: "Product CSV downloaded." });
    } catch (e: any) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }

  // 2. Import CSV - update product stock by CSV
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading("import");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const csv = evt.target?.result as string;
        const rows = parseCSV(csv) as ProductRow[];
        // Only allow rows with id and stock
        const toPreview = rows
          .filter((r) => r.id && r.stock !== undefined)
          .map((r) => ({
            id: r.id,
            name: r.name || "",
            sku: r.sku || "",
            stock: Number(r.stock),
          }));
        setPreviewRows(toPreview);
      } catch (err: any) {
        toast({ title: "CSV Parse Failed", description: err.message, variant: "destructive" });
      }
      setLoading(false);
    };
    reader.onerror = () => {
      toast({ title: "Read Error", description: "Failed to read file", variant: "destructive" });
      setLoading(false);
    };
    reader.readAsText(file);
  }

  async function handleConfirmImport() {
    if (!previewRows) return;
    setImporting(true);
    let success = 0;
    let fail = 0;
    for (const row of previewRows) {
      const { error } = await supabase
        .from("products")
        .update({ stock: row.stock, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (error) fail++;
      else success++;
    }
    setImporting(false);
    setPreviewRows(null);
    if (success > 0) {
      toast({ title: "Import Complete", description: `${success} products updated.`, variant: "default" });
    }
    if (fail > 0) {
      toast({ title: "Partial Import Error", description: `${fail} rows failed to import. Check data and try again.`, variant: "destructive" });
    }
  }

  function resetImport() {
    setPreviewRows(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCsv className="h-5 w-5" />
          Import/Export Data <span className="ml-2 text-xs text-muted-foreground">(CSV only)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row flex-wrap gap-3 items-start">
        <div className="flex flex-col gap-2">
          <Button variant="outline" disabled={!!loading} onClick={handleExport}>
            {loading === "export" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Export className="mr-2 h-4 w-4" />}
            Export Products CSV
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportFile}
            disabled={!!loading}
            id="import-csv"
          />
          <label htmlFor="import-csv">
            <Button asChild variant="outline" disabled={!!loading}>
              <span>
                {loading === "import" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Import className="mr-2 h-4 w-4" />}
                Import Products CSV
              </span>
            </Button>
          </label>
        </div>
        {/* Show import preview with confirm/cancel */}
        {previewRows && (
          <div className="w-full mt-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Preview updates ({previewRows.length} rows):</div>
            <div className="overflow-auto border rounded">
              <table className="min-w-[320px] text-sm">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-2 py-1 text-left">ID</th>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">SKU</th>
                    <th className="px-2 py-1 text-left">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-2 py-1">{r.id}</td>
                      <td className="px-2 py-1">{r.name}</td>
                      <td className="px-2 py-1">{r.sku}</td>
                      <td className="px-2 py-1">{r.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="default" onClick={handleConfirmImport} disabled={importing}>
                {importing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Confirm Import
              </Button>
              <Button variant="outline" onClick={resetImport} disabled={importing}>
                Cancel
              </Button>
            </div>
            <div className="text-xs mt-2 text-muted-foreground">Only stock is updated during import. Rows missing product ID or stock are ignored.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportExport;

