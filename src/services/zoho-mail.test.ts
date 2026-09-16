import { describe, expect, it } from "vitest";
import { createMailboxMessageReference, decodeMailboxMessageReference, mailboxMetadata, parseMailboxConfiguration, resolveMailboxFromConfigs, sanitizeMailHtml, type ServerMailboxConfig } from "@/services/zoho-mail";

describe("Zoho Mail content safety", () => {
  it("removes executable and externally embedded email content", () => {
    const html = sanitizeMailHtml('<p>Hello</p><script>alert(1)</script><iframe src="https://evil.example"></iframe><img src="https://evil.example/pixel">');
    expect(html).toContain("<p>Hello</p>");
    expect(html).not.toContain("script");
    expect(html).not.toContain("iframe");
    expect(html).not.toContain("img");
  });

  it("forces safe link behavior", () => {
    const html = sanitizeMailHtml('<a href="https://example.com" onclick="alert(1)">Open</a>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
    expect(html).not.toContain("onclick");
  });

  it("parses independent server-side mailboxes and exposes metadata without secrets", () => {
    const configs = parseMailboxConfiguration(JSON.stringify({
      editorial: { displayName: "Editorial", email: "editorial@example.com", region: "IN", accountId: "1001", clientId: "editorial-client", clientSecret: "editorial-secret", refreshToken: "editorial-refresh" },
      support: { displayName: "Support", email: "support@example.com", region: "EU", accountId: "2002", clientId: "support-client", clientSecret: "support-secret", refreshToken: "support-refresh" },
    }));

    expect(mailboxMetadata(configs)).toEqual([
      { id: "editorial", displayName: "Editorial", email: "editorial@example.com" },
      { id: "support", displayName: "Support", email: "support@example.com" },
    ]);
    expect(JSON.stringify(mailboxMetadata(configs))).not.toContain("secret");
    expect(JSON.stringify(mailboxMetadata(configs))).not.toContain("1001");
  });

  it("rejects a signed editorial message reference in the support context", () => {
    const secret = "test-mail-reference-secret";
    const editorialReference = createMailboxMessageReference("editorial", "11", "42", secret);

    expect(decodeMailboxMessageReference(editorialReference, "editorial", secret)).toEqual({ mailboxId: "editorial", folderId: "11", messageId: "42" });
    expect(() => decodeMailboxMessageReference(editorialReference, "support", secret)).toThrowError(/not valid for this mailbox/i);
    expect(() => decodeMailboxMessageReference(`${editorialReference}tampered`, "editorial", secret)).toThrowError(/not valid for this mailbox/i);
  });

  it("requires an explicit mailbox when more than one is configured", () => {
    const configs = parseMailboxConfiguration(JSON.stringify({
      editorial: { displayName: "Editorial", email: "editorial@example.com", region: "IN", accountId: "1001", clientId: "editorial-client", clientSecret: "editorial-secret", refreshToken: "editorial-refresh" },
      support: { displayName: "Support", email: "support@example.com", region: "EU", accountId: "2002", clientId: "support-client", clientSecret: "support-secret", refreshToken: "support-refresh" },
    }));

    expect(() => resolveMailboxFromConfigs(configs)).toThrowError(/mailboxId is required/i);
    expect(resolveMailboxFromConfigs(configs, "support").accountId).toBe("2002");
    expect(() => resolveMailboxFromConfigs(configs, "business")).toThrowError(/not available/i);
  });

  it("keeps the legacy single-mailbox resolution contract", () => {
    const config = { id: "default", displayName: "Primary mailbox", email: "editorial@example.com", region: "IN", accountId: "1001", clientId: "client", clientSecret: "secret", refreshToken: "refresh" } as ServerMailboxConfig;
    expect(resolveMailboxFromConfigs([config]).id).toBe("default");
    expect(resolveMailboxFromConfigs([config], "default").email).toBe("editorial@example.com");
  });
});
