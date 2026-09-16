# Zoho Mail Admin Integration

The authenticated WikiBulz admin dashboard can manage multiple independent Zoho Mail mailboxes from **Admin > Mail**. Mail data is fetched from Zoho on demand; messages and attachments are not copied into MongoDB.

## Server environment

Add the structured configuration to the server environment only. Do not put it in browser code, commit real values, or paste secrets into `.env.example`.

Each object key is a safe mailbox ID. Keep IDs stable and limited to lowercase letters, numbers, `_`, and `-`.

```text
ZOHO_MAILBOXES_JSON={"editorial":{"displayName":"Editorial","email":"editorial@wikibulz.com","region":"IN","accountId":"","clientId":"","clientSecret":"","refreshToken":""},"support":{"displayName":"Support","email":"support@wikibulz.com","region":"IN","accountId":"","clientId":"","clientSecret":"","refreshToken":""},"contact":{"displayName":"Contact","email":"contact@wikibulz.com","region":"IN","accountId":"","clientId":"","clientSecret":"","refreshToken":""},"business":{"displayName":"Business","email":"business@wikibulz.com","region":"IN","accountId":"","clientId":"","clientSecret":"","refreshToken":""},"press":{"displayName":"Press","email":"press@wikibulz.com","region":"IN","accountId":"","clientId":"","clientSecret":"","refreshToken":""}}
ZOHO_MAIL_REFERENCE_SECRET=
```

The browser receives only `id`, `displayName`, and `email`. Client secrets, refresh tokens, account IDs, and OAuth context stay on the server. `ZOHO_MAIL_REFERENCE_SECRET` signs message references; if it is omitted, the existing `JWT_SECRET` is used.

`region` must match the Zoho data center for each mailbox: `US`, `EU`, `IN`, `AU`, `JP`, `CA`, `CN`, `AE`, or `SA`. For example, an Indian mailbox uses `IN` and the `mail.zoho.in` / `accounts.zoho.in` API domains. Verify the correct region from the mailbox URL before creating the OAuth token.

## Backward-compatible single mailbox

The current six-variable configuration remains supported. When `ZOHO_MAILBOXES_JSON` is absent, these variables create one server-side mailbox with the safe ID `default`:

```text
ZOHO_MAIL_REGION=IN
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ACCOUNT_ID=
ZOHO_MAIL_ADDRESS=editorial@wikibulz.com
```

The mailbox selector still appears with one option, and old requests without `mailboxId` continue to work while only one mailbox is configured. With multiple mailboxes, `mailboxId` is required.

## One-time Zoho authorization

1. In the Zoho API Console, create a Self Client for the same Zoho organization/mailbox.
2. Request only the mailbox scopes needed by this dashboard:
   `ZohoMail.accounts.READ,ZohoMail.folders.READ,ZohoMail.messages.READ,ZohoMail.messages.CREATE,ZohoMail.messages.UPDATE,ZohoMail.messages.DELETE`.
3. Generate an authorization code with offline access enabled, then exchange the code for an access token and refresh token at the region-specific Zoho Accounts OAuth token endpoint.
4. Store each mailbox refresh token, client ID, client secret, and account ID in the server environment. Never send any of these values to the browser.
5. Use the Zoho Mail accounts API to identify the numeric account ID for each mailbox and place it in that mailbox's server-side configuration.
6. Restart the application process after changing environment variables. The dashboard will show a connection error instead of attempting mailbox calls when the variables are missing.

## Local token setup command

From the project root, run the reusable local-only setup utility for the mailbox you are authorizing:

```text
npm run zoho:setup -- editorial
```

The utility reads `ZOHO_CLIENT_ID` and `ZOHO_CLIENT_SECRET` from `.env.local` or the current process environment, prompts for the authorization code without echoing it, and calls only the India Accounts token endpoint. It never writes the authorization code to disk and never prints any token or secret. On success it writes only the returned refresh token to `ZOHO_REFRESH_TOKEN` in legacy single-mailbox mode, or to the selected mailbox's `refreshToken` field inside `ZOHO_MAILBOXES_JSON`.

The command performs one exchange only. An authorization code is single-use; generate a new code after any failed or interrupted exchange rather than retrying the same code.

Use the official guides for the current authorization parameters and regional URLs:

- [Zoho Mail API regional domains](https://www.zoho.com/mail/help/api/getting-started-with-api.html)
- [Zoho Mail API overview](https://www.zoho.com/mail/help/api/email-api.html)
- [Refreshing OAuth access tokens](https://www.zoho.com/connect/api/oauth-authentication-refreshing-access-tokens.html)

## Local development

Put mocked values only in a local, untracked environment file when testing configuration parsing. Do not add live credentials for automated tests. The app refreshes each short-lived Zoho access token server-side and keeps it in a per-mailbox in-memory cache; the long-lived refresh tokens remain in the environment.

`GET /api/admin/mailboxes` is admin-authenticated and returns only safe metadata. Every mail operation accepts the selected mailbox context. Message references are signed with the mailbox ID and folder ID, so a reference issued for `editorial` is rejected when submitted to `support`.

## Production deployment

Configure mailbox secrets in the deployment secret/environment manager, not in the repository. Keep each Zoho region paired with its mailbox. Before using real credentials, verify the selector, Inbox, Sent, Drafts, Starred, Trash, search, opening a message, attachment download, and a harmless draft action. This implementation does not send mail or connect to Zoho during automated tests.

## Troubleshooting

- **Not configured:** the structured mailbox document is missing/empty, or the legacy single-mailbox variables are incomplete.
- **Mailbox unavailable:** confirm the requested safe mailbox ID exists in the server-side configuration. Account IDs and tokens are never accepted from the browser.
- **Authorization failed:** check that the region matches the mailbox and that the refresh token was generated for the same client and data center.
- **Permission denied:** regenerate the token with the required Mail scopes and confirm the account belongs to the intended organization.
- **Folder not found:** confirm the account exposes the standard Inbox, Sent, Drafts, and Trash folders.
- **Attachment failure:** verify the message still exists and the attachment is within the dashboard's 50 MB download limit.

The dashboard uses server-side pagination and Zoho search, sanitizes message HTML before rendering, validates signed mailbox-bound message references and attachment IDs, isolates token caches and errors per mailbox, and requires an existing WikiBulz admin session for every mail API route.
