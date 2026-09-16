import { createInterface } from "node:readline/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type AnyRecord = Record<string, unknown>;

const PROJECT_ENV_PATH = join(process.cwd(), ".env.local");
const ZOHO_TOKEN_ENDPOINT = "https://accounts.zoho.in/oauth/v2/token";
const SAFE_MAILBOX_ID = /^[a-z][a-z0-9_-]{0,31}$/;

function printUsage(): never {
  console.error("Usage: npm run zoho:setup -- <mailboxId>");
  console.error("Example: npm run zoho:setup -- editorial");
  process.exit(2);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Usage: npm run zoho:setup -- <mailboxId>");
  console.log("Example: npm run zoho:setup -- editorial");
  process.exit(0);
}

function parseEnvFile(path: string) {
  const values: Record<string, string> = {};
  if (!existsSync(path)) return values;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[match[1]] = value;
  }
  return values;
}

function localEnv() {
  const fileValues = parseEnvFile(PROJECT_ENV_PATH);
  return (name: string) => process.env[name] || fileValues[name] || "";
}

function required(value: string, name: string) {
  if (!value.trim()) throw new Error(`${name} is missing from .env.local or the current process environment.`);
  return value.trim();
}

function parseMailboxConfig(raw: string, mailboxId: string) {
  let document: unknown;
  try {
    document = JSON.parse(raw);
  } catch {
    throw new Error("ZOHO_MAILBOXES_JSON is not valid JSON.");
  }

  if (Array.isArray(document)) {
    const row = document.find((item) => item && typeof item === "object" && (item as AnyRecord).id === mailboxId);
    if (!row || typeof row !== "object") throw new Error(`Mailbox '${mailboxId}' is not defined in ZOHO_MAILBOXES_JSON.`);
    return { mode: "structured" as const, document, row: row as AnyRecord };
  }

  if (!document || typeof document !== "object") throw new Error("ZOHO_MAILBOXES_JSON must be an object or array.");
  const row = (document as AnyRecord)[mailboxId];
  if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`Mailbox '${mailboxId}' is not defined in ZOHO_MAILBOXES_JSON.`);
  return { mode: "structured" as const, document, row: row as AnyRecord };
}

function getMailboxSettings(getEnv: (name: string) => string, mailboxId: string) {
  const raw = getEnv("ZOHO_MAILBOXES_JSON").trim();
  if (!raw) {
    return {
      mode: "legacy" as const,
      region: getEnv("ZOHO_MAIL_REGION").toUpperCase() || "IN",
      clientId: required(getEnv("ZOHO_CLIENT_ID"), "ZOHO_CLIENT_ID"),
      clientSecret: required(getEnv("ZOHO_CLIENT_SECRET"), "ZOHO_CLIENT_SECRET"),
    };
  }

  const structured = parseMailboxConfig(raw, mailboxId);
  const row = structured.row;
  return {
    ...structured,
    region: String(row.region || getEnv("ZOHO_MAIL_REGION") || "").toUpperCase(),
    clientId: required(String(row.clientId || getEnv("ZOHO_CLIENT_ID")), `${mailboxId}.clientId or ZOHO_CLIENT_ID`),
    clientSecret: required(String(row.clientSecret || getEnv("ZOHO_CLIENT_SECRET")), `${mailboxId}.clientSecret or ZOHO_CLIENT_SECRET`),
  };
}

function updateEnvField(name: string, value: string) {
  const exists = existsSync(PROJECT_ENV_PATH);
  const original = exists ? readFileSync(PROJECT_ENV_PATH, "utf8") : "";
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  const lines = original.split(/\r?\n/);
  const index = lines.findIndex((line) => new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`).test(line));
  const nextLine = `${name}=${value}`;
  if (index >= 0) lines[index] = nextLine;
  else lines.push(nextLine);
  writeFileSync(PROJECT_ENV_PATH, lines.join(newline), { encoding: "utf8", mode: 0o600 });
}

function saveStructuredRefreshToken(raw: string, mailboxId: string, refreshToken: string) {
  let document: unknown;
  try {
    document = JSON.parse(raw);
  } catch {
    throw new Error("ZOHO_MAILBOXES_JSON is not valid JSON.");
  }

  if (Array.isArray(document)) {
    const row = document.find((item) => item && typeof item === "object" && (item as AnyRecord).id === mailboxId);
    if (!row || typeof row !== "object") throw new Error(`Mailbox '${mailboxId}' is not defined in ZOHO_MAILBOXES_JSON.`);
    (row as AnyRecord).refreshToken = refreshToken;
  } else if (document && typeof document === "object") {
    const row = (document as AnyRecord)[mailboxId];
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`Mailbox '${mailboxId}' is not defined in ZOHO_MAILBOXES_JSON.`);
    (row as AnyRecord).refreshToken = refreshToken;
  } else {
    throw new Error("ZOHO_MAILBOXES_JSON must be an object or array.");
  }

  updateEnvField("ZOHO_MAILBOXES_JSON", JSON.stringify(document));
}

function readHidden(prompt: string) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    const readline = createInterface({ input: process.stdin, output: process.stdout });
    return readline.question(prompt).finally(() => readline.close());
  }

  return new Promise<string>((resolve, reject) => {
    let value = "";
    const input = process.stdin;
    const finish = (error?: Error) => {
      input.setRawMode?.(false);
      input.pause();
      input.removeListener("data", onData);
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") return finish(new Error("Authorization code input cancelled."));
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u0008" || char === "\u007f") {
          if (value) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        value += char;
        process.stdout.write("*");
      }
    };
    process.stdout.write(prompt);
    input.setRawMode(true);
    input.setEncoding("utf8");
    input.resume();
    input.on("data", onData);
  });
}

function sanitized(value: unknown) {
  return String(value ?? "unknown")
    .replace(/[\r\n]+/g, " ")
    .replace(/(access_token|refresh_token|client_secret|authorization_code|code)\s*[:=]\s*[^\s,;&]+/gi, "$1=[redacted]")
    .slice(0, 240);
}

async function main() {
  const mailboxId = process.argv[2]?.trim().toLowerCase();
  if (!mailboxId || !SAFE_MAILBOX_ID.test(mailboxId)) printUsage();

  const getEnv = localEnv();
  const settings = getMailboxSettings(getEnv, mailboxId);
  if (settings.region !== "IN") throw new Error(`Mailbox '${mailboxId}' is configured for region '${settings.region || "unknown"}', not IN.`);

  console.log(`Zoho Mail setup: ${mailboxId}`);
  const authorizationCode = (await readHidden("Zoho authorization code: ")).trim();
  if (!authorizationCode) throw new Error("Authorization code was empty.");

  const response = await fetch(ZOHO_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: settings.clientId, client_secret: settings.clientSecret, code: authorizationCode, grant_type: "authorization_code" }),
  });
  const payload = await response.json().catch(() => ({})) as AnyRecord;

  if (!response.ok || typeof payload.access_token !== "string" || typeof payload.refresh_token !== "string" || typeof payload.api_domain !== "string" || typeof payload.token_type !== "string" || payload.expires_in === undefined) {
    const errorCode = sanitized(payload.error ?? payload.code ?? `HTTP_${response.status}`);
    const errorMessage = sanitized(payload.error_description ?? payload.message ?? "Zoho did not return a successful token response.");
    console.error(`Zoho token exchange failed (HTTP ${response.status}): ${errorCode} - ${errorMessage}`);
    process.exitCode = 1;
    return;
  }

  if (settings.mode === "structured") saveStructuredRefreshToken(getEnv("ZOHO_MAILBOXES_JSON"), mailboxId, payload.refresh_token);
  else updateEnvField("ZOHO_REFRESH_TOKEN", payload.refresh_token);

  console.log(`Zoho token exchange succeeded for ${mailboxId}.`);
  console.log("Refresh token saved to the local mailbox configuration. No token or secret was printed.");
}

main().catch((error) => {
  console.error(`Zoho setup stopped: ${sanitized(error instanceof Error ? error.message : "unknown error")}`);
  process.exitCode = 1;
});
