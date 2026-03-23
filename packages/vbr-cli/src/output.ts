import chalk from "chalk";
import Table from "cli-table3";

export type OutputFormat = "json" | "table";

/** Print data as JSON */
function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/** Print data as a table. Expects an array of objects. */
function printTable(rows: Record<string, unknown>[], columns?: string[]): void {
  if (!rows.length) {
    console.log(chalk.yellow("No results."));
    return;
  }

  const keys = columns || Object.keys(rows[0]);
  const table = new Table({
    head: keys.map((k) => chalk.cyan(k)),
    wordWrap: true,
  });

  for (const row of rows) {
    table.push(keys.map((k) => String(row[k] ?? "")));
  }

  console.log(table.toString());
}

/** Print output in the requested format */
export function printOutput(
  format: OutputFormat,
  data: unknown,
  options?: { columns?: string[] },
): void {
  if (format === "json") {
    printJson(data);
    return;
  }

  // Table mode: if data is an array, render as table
  if (Array.isArray(data)) {
    printTable(data as Record<string, unknown>[], options?.columns);
    return;
  }

  // Table mode with a single object: render as key-value pairs
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const table = new Table();
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null) {
        table.push({ [chalk.cyan(key)]: JSON.stringify(value, null, 2) });
      } else {
        table.push({ [chalk.cyan(key)]: String(value ?? "") });
      }
    }
    console.log(table.toString());
    return;
  }

  // Fallback
  console.log(String(data));
}

/** Print an error message to stderr */
export function printError(message: string): void {
  console.error(chalk.red(`Error: ${message}`));
}

/** Print a success message */
export function printSuccess(message: string): void {
  console.log(chalk.green(message));
}
