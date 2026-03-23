import { Command } from "commander";
import {
  login,
  clearSession,
  loadSession,
  saveSession,
} from "../client.js";
import type { Product } from "../client.js";
import { printSuccess, printError, printOutput } from "../output.js";
import type { OutputFormat } from "../output.js";

/** Products that use REST-based OAuth login */
const REST_PRODUCTS = ["vbr", "vone", "vspc", "vro"] as const;
type RestProduct = (typeof REST_PRODUCTS)[number];

function isRestProduct(p: string): p is RestProduct {
  return (REST_PRODUCTS as readonly string[]).includes(p);
}

export function registerAuthCommand(program: Command): void {
  const auth = program
    .command("auth")
    .description("Authentication for Veeam products");

  // --- REST-based login (VBR, VONE, VSPC, VRO) ---
  auth
    .command("login")
    .description("Authenticate with a Veeam product")
    .argument("<product>", "Product to authenticate: vbr | vone | vspc | vro | k10")
    .requiredOption("--host <host>", "Server hostname or IP")
    .requiredOption("--username <username>", "Username")
    .requiredOption("--password <password>", "Password")
    .option("--kubeconfig <path>", "Path to kubeconfig (k10 only)")
    .option("--context <context>", "Kubernetes context (k10 only)")
    .option("--namespace <namespace>", "K10 namespace (default: kasten-io)")
    .action(async (product: string, opts) => {
      const format = program.opts().format as OutputFormat;
      const p = product.toLowerCase() as Product;

      try {
        if (p === "k10") {
          // K10 uses kubeconfig-based auth
          const { initK10Client } = await import("./k10/k10-client.js");
          const ns = opts.namespace || process.env.K10_NAMESPACE || "kasten-io";
          const serverUrl = initK10Client(opts.kubeconfig, opts.context, ns);
          saveSession("k10", {
            host: serverUrl,
            token: "k8s",
            username: opts.username || "kubeconfig",
            createdAt: new Date().toISOString(),
          });
          if (format === "json") {
            printOutput(format, { status: "authenticated", host: serverUrl, namespace: ns });
          } else {
            printSuccess(`Authenticated to K10 cluster at ${serverUrl} (namespace: ${ns})`);
          }
          return;
        }

        if (!isRestProduct(p)) {
          printError(`Unknown product: ${product}. Must be one of: vbr, vone, vspc, vro, k10`);
          process.exit(1);
        }

        const session = await login(p, opts.host, opts.username, opts.password);
        if (format === "json") {
          printOutput(format, {
            status: "authenticated",
            product: p,
            host: session.host,
            username: session.username,
            createdAt: session.createdAt,
          });
        } else {
          printSuccess(`Authenticated to ${p.toUpperCase()} at ${session.host} as ${session.username}`);
          printSuccess(`Session saved to ~/.config/veeam/${p}.json`);
        }
      } catch (error) {
        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // --- Logout ---
  auth
    .command("logout")
    .description("Clear saved session for a product")
    .argument("<product>", "Product: vbr | vone | vspc | vro | k10")
    .action((product: string) => {
      const format = program.opts().format as OutputFormat;
      const p = product.toLowerCase() as Product;
      clearSession(p);
      if (format === "json") {
        printOutput(format, { status: "logged_out", product: p });
      } else {
        printSuccess(`${p.toUpperCase()} session cleared.`);
      }
    });

  // --- Status ---
  auth
    .command("status")
    .description("Show auth status for a product (or all)")
    .argument("[product]", "Product: vbr | vone | vspc | vro | k10 (omit for all)")
    .action((product?: string) => {
      const format = program.opts().format as OutputFormat;
      const products: Product[] = product
        ? [product.toLowerCase() as Product]
        : ["vbr", "vone", "vspc", "vro", "k10"];

      const results = products.map((p) => {
        const session = loadSession(p);
        return session
          ? {
              product: p,
              authenticated: true,
              host: session.host,
              username: session.username,
              createdAt: session.createdAt,
            }
          : { product: p, authenticated: false };
      });

      if (format === "json") {
        printOutput(format, products.length === 1 ? results[0] : results);
      } else {
        for (const r of results) {
          if (r.authenticated) {
            printSuccess(
              `${r.product.toUpperCase()}: authenticated to ${(r as { host: string }).host} as ${(r as { username: string }).username}`,
            );
          } else {
            printError(`${r.product.toUpperCase()}: not authenticated`);
          }
        }
      }
    });
}
