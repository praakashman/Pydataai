export interface DatasetRow {
  [key: string]: string | number | boolean | null;
}

export interface ColumnMeta {
  name: string;
  type: "number" | "string" | "boolean";
  nullCount: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean)[];
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
}

export function parseCsv(csvText: string): { headers: string[]; rows: DatasetRow[] } {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
  const rows: DatasetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV splitting handling commas within quotes if any
    const rawTokens = lines[i].split(",").map(t => t.trim().replace(/^["']|["']$/g, ""));
    const row: DatasetRow = {};
    headers.forEach((col, idx) => {
      const val = rawTokens[idx];
      if (val === undefined || val === "" || val.toLowerCase() === "nan" || val.toLowerCase() === "null") {
        row[col] = null;
      } else if (!isNaN(Number(val)) && val.trim() !== "") {
        row[col] = Number(val);
      } else if (val.toLowerCase() === "true" || val.toLowerCase() === "false") {
        row[col] = val.toLowerCase() === "true";
      } else {
        row[col] = val;
      }
    });
    rows.push(row);
  }

  return { headers, rows };
}

export function profileDataset(rows: DatasetRow[], headers: string[]): {
  columns: ColumnMeta[];
  stats: Record<string, any>;
  outliers: Record<string, number>;
  duplicatesCount: number;
} {
  const totalRows = rows.length;
  const columns: ColumnMeta[] = [];
  const stats: Record<string, any> = {};
  const outliers: Record<string, number> = {};

  // Duplicate detection
  const rowStrings = new Set<string>();
  let duplicatesCount = 0;
  rows.forEach(r => {
    const serialized = JSON.stringify(r);
    if (rowStrings.has(serialized)) duplicatesCount++;
    else rowStrings.add(serialized);
  });

  headers.forEach(col => {
    const values = rows.map(r => r[col]);
    const nonNulls = values.filter(v => v !== null && v !== undefined);
    const nullCount = totalRows - nonNulls.length;
    const uniqueCount = new Set(nonNulls).size;

    // determine type
    const numericVals = nonNulls.filter((v): v is number => typeof v === "number");
    const isNumeric = numericVals.length > nonNulls.length * 0.7 && numericVals.length > 0;

    if (isNumeric && numericVals.length > 0) {
      const sum = numericVals.reduce((a, b) => a + b, 0);
      const mean = sum / numericVals.length;
      const sorted = [...numericVals].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const median = sorted[Math.floor(sorted.length / 2)];
      const variance = numericVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / numericVals.length;
      const std = Math.sqrt(variance);

      // Quartiles
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const outlierThresholdLower = q1 - 1.5 * iqr;
      const outlierThresholdUpper = q3 + 1.5 * iqr;
      const outlierCount = numericVals.filter(v => v < outlierThresholdLower || v > outlierThresholdUpper).length;
      outliers[col] = outlierCount;

      stats[col] = {
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        std: Number(std.toFixed(2)),
        variance: Number(variance.toFixed(2)),
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        q1: Number(q1.toFixed(2)),
        q3: Number(q3.toFixed(2)),
        iqr: Number(iqr.toFixed(2)),
      };

      columns.push({
        name: col,
        type: "number",
        nullCount,
        uniqueCount,
        sampleValues: nonNulls.slice(0, 5),
        min,
        max,
        mean: Number(mean.toFixed(2)),
        std: Number(std.toFixed(2)),
      });
    } else {
      // categorical/string
      // calculate frequency
      const freqMap: Record<string, number> = {};
      nonNulls.forEach(v => {
        const str = String(v);
        freqMap[str] = (freqMap[str] || 0) + 1;
      });
      const topCategories = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k, v]) => ({ value: k, count: v }));

      stats[col] = {
        mode: topCategories[0]?.value || "N/A",
        topCategories,
      };

      columns.push({
        name: col,
        type: "string",
        nullCount,
        uniqueCount,
        sampleValues: nonNulls.slice(0, 5),
      });
    }
  });

  return { columns, stats, outliers, duplicatesCount };
}

export function cleanData(
  rows: DatasetRow[],
  options: {
    handleNulls: "fill_mean" | "fill_zero" | "drop_rows";
    dropDuplicates: boolean;
  }
): DatasetRow[] {
  let cleaned = [...rows];

  if (options.dropDuplicates) {
    const seen = new Set<string>();
    cleaned = cleaned.filter(r => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (options.handleNulls === "drop_rows") {
    cleaned = cleaned.filter(row => Object.values(row).every(v => v !== null && v !== undefined));
  } else if (options.handleNulls === "fill_zero") {
    cleaned = cleaned.map(row => {
      const next: DatasetRow = { ...row };
      Object.keys(next).forEach(k => {
        if (next[k] === null || next[k] === undefined) {
          next[k] = 0;
        }
      });
      return next;
    });
  } else if (options.handleNulls === "fill_mean") {
    // compute mean per numeric column
    const colMeans: Record<string, number> = {};
    const cols = Object.keys(cleaned[0] || {});
    cols.forEach(c => {
      const numVals = cleaned.map(r => r[c]).filter((v): v is number => typeof v === "number");
      if (numVals.length > 0) {
        colMeans[c] = Number((numVals.reduce((a, b) => a + b, 0) / numVals.length).toFixed(2));
      }
    });

    cleaned = cleaned.map(row => {
      const next: DatasetRow = { ...row };
      cols.forEach(c => {
        if (next[c] === null || next[c] === undefined) {
          next[c] = colMeans[c] ?? 0;
        }
      });
      return next;
    });
  }

  return cleaned;
}
