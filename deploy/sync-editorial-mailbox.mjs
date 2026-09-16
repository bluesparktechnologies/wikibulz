import fs from "node:fs";

const envPath = process.argv[2];

if (!envPath) {
  console.error("Editorial mailbox sync requires an environment file path.");
  process.exit(1);
}

function readEnv(text) {
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

function redactAccountId(value) {
  return value.length > 4 ? `[redacted]...${value.slice(-4)}` : "[redacted]";
}

function accountEmail(account) {
  for (const field of ["emailAddress", "mailboxAddress", "primaryEmailAddress"]) {
    if (typeof account?.[field] === "string" && account[field].includes("@")) return account[field];
  }
  return "";
}

async function main() {
  const original = fs.readFileSync(envPath, "utf8");
  const values = readEnv(original);
  const region = values.ZOHO_MAIL_REGION || "IN";
  const clientId = values.ZOHO_CLIENT_ID;
  const clientSecret = values.ZOHO_CLIENT_SECRET;
  const refreshToken = values.ZOHO_REFRESH_TOKEN;

  if (region !== "IN" || !clientId || !clientSecret || !refreshToken) {
    console.log("Editorial mailbox sync skipped: existing production Zoho settings are incomplete.");
    return;
  }

  const tokenResponse = await fetch("https://accounts.zoho.in/oauth/v2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token" }),
  });
  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || typeof tokenPayload.access_token !== "string") {
    console.error(`Editorial mailbox sync failed during token refresh (HTTP ${tokenResponse.status}).`);
    process.exit(1);
  }

  const accountResponse = await fetch("https://mail.zoho.in/api/accounts", {
    headers: { authorization: `Zoho-oauthtoken ${tokenPayload.access_token}`, accept: "application/json" },
  });
  const accountPayload = await accountResponse.json().catch(() => ({}));
  const accounts = Array.isArray(accountPayload.data) ? accountPayload.data : [];
  const editorialMatches = accounts.filter((account) => accountEmail(account).toLowerCase() === "editorial@wikibulz.com");
  const account = editorialMatches.length === 1 ? editorialMatches[0] : accounts.length === 1 ? accounts[0] : null;
  const accountId = typeof account?.accountId === "string" ? account.accountId : "";
  const email = accountEmail(account);

  if (!accountResponse.ok || !accountId || !email) {
    console.error(`Editorial mailbox sync failed during account lookup (HTTP ${accountResponse.status}).`);
    process.exit(1);
  }

  let mailboxes = {};
  if (values.ZOHO_MAILBOXES_JSON) {
    try {
      mailboxes = JSON.parse(values.ZOHO_MAILBOXES_JSON);
    } catch {
      console.error("Editorial mailbox sync failed: ZOHO_MAILBOXES_JSON is invalid.");
      process.exit(1);
    }
  }
  if (!mailboxes || typeof mailboxes !== "object" || Array.isArray(mailboxes)) {
    console.error("Editorial mailbox sync failed: ZOHO_MAILBOXES_JSON must be an object.");
    process.exit(1);
  }

  mailboxes.editorial = { displayName: "Editorial", email, region: "IN", accountId, clientId, clientSecret, refreshToken };
  const serialized = JSON.stringify(mailboxes);
  const lines = original.split(/\r?\n/);
  const index = lines.findIndex((line) => /^\s*ZOHO_MAILBOXES_JSON\s*=/.test(line));
  const replacement = `ZOHO_MAILBOXES_JSON=${serialized}`;
  if (index >= 0) lines[index] = replacement;
  else lines.unshift(replacement);
  fs.writeFileSync(envPath, lines.join("\n"), { mode: 0o600 });
  console.log(`Editorial mailbox configured: ${email} (${redactAccountId(accountId)}).`);
}

main().catch(() => {
  console.error("Editorial mailbox sync failed unexpectedly.");
  process.exit(1);
});
