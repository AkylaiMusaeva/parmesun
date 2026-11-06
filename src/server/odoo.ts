export interface OdooConfig {
  url: string;
  database: string;
  username: string;
  apiKey: string;
}

export interface OdooRpcError {
  code: number;
  message: string;
  data?: {
    name?: string;
    debug?: string;
    exception_name?: string;
  };
}

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function getOdooConfig(): OdooConfig | null {
  const url = env("ODOO_URL");
  const database = env("ODOO_DATABASE");
  const username = env("ODOO_USERNAME");
  const apiKey = env("ODOO_API_KEY");
  if (!url || !database || !username || !apiKey) return null;

  return {
    url: url.replace(/\/+$/, ""),
    database,
    username,
    apiKey,
  };
}

export async function odooRpc(config: OdooConfig, service: "common" | "object", method: string, args: unknown[]) {
  const response = await fetch(`${config.url}/jsonrpc`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Date.now(),
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Odoo returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { result?: unknown; error?: OdooRpcError };
  if (payload.error) {
    throw new Error(payload.error.data?.exception_name
      ? `${payload.error.data.exception_name}: ${payload.error.message}`
      : payload.error.message);
  }
  return payload.result;
}

export async function authenticateOdoo(config: OdooConfig): Promise<number> {
  const uid = await odooRpc(config, "common", "authenticate", [
    config.database,
    config.username,
    config.apiKey,
    {},
  ]);
  if (typeof uid !== "number" || uid <= 0) {
    throw new Error("Odoo authentication failed");
  }
  return uid;
}

export async function callOdoo(
  config: OdooConfig,
  uid: number,
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {},
) {
  return odooRpc(config, "object", "execute_kw", [
    config.database,
    uid,
    config.apiKey,
    model,
    method,
    args,
    kwargs,
  ]);
}

