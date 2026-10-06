# Auth API contract (M1)

Base path: `<backend>/api`. JSON in and out unless noted. This is the contract
between the NestJS backend (MCH-86..91) and the mobile app (MCH-92); Swagger at
`/api/docs` is generated from the same DTOs.

## Shared shapes

**Session** — returned by every endpoint that logs a user in:

```json
{
  "accessToken": "eyJ…",
  "accessTokenExpiresIn": 900,
  "refreshToken": "<id>.<secret>",
  "refreshTokenExpiresAt": "2026-11-05T12:00:00.000Z",
  "user": { "id": "…", "email": "a@b.c", "displayName": "Ana" }
}
```

**Me** — the current account:

```json
{
  "id": "…", "email": "a@b.c", "displayName": "Ana",
  "emailVerified": true,
  "hasPassword": true,
  "providers": ["LOCAL", "GOOGLE"]
}
```

**Error** — every failure:

```json
{ "statusCode": 401, "error": "Unauthorized", "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password.", "path": "/api/auth/login", "timestamp": "…" }
```

Clients branch on `code`, never on `message`. Validation failures are 400 with
`message` as a string array and no `code`.

## Endpoints

Public unless marked 🔒 (needs `Authorization: Bearer <accessToken>`).

| Method & path | Body | Success | Error codes |
|---|---|---|---|
| `POST /auth/register` | `{email, password, displayName}` | 201 `{message}` (always the same, no enumeration) | 400 validation |
| `POST /auth/login` | `{email, password}` | 200 Session | 401 `INVALID_CREDENTIALS`, 403 `EMAIL_NOT_VERIFIED` |
| `POST /auth/refresh` | `{refreshToken}` | 200 Session without `user` | 401 `INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_REUSED` |
| `GET /auth/me` 🔒 | — | 200 Me | 401 `UNAUTHORIZED`, `SESSION_REVOKED` |
| `GET /auth/verify?token=` | — | 200 **HTML** "Email verified, go back to the app" | 400 **HTML** error page (invalid, expired or already used) |
| `POST /auth/verify/resend` | `{email}` | 202 `{message}` (always the same) | 429 throttled |
| `POST /auth/password/forgot` | `{email}` | 200 `{message}` (always the same) | 429 throttled |
| `POST /auth/password/reset` | `{email, code, newPassword}` | 200 `{message}`; all sessions of the user are revoked | 400 `INVALID_RESET_CODE`, 400 validation |
| `POST /auth/logout` | `{refreshToken}` | 204 (also 204 for an unknown/already revoked token) | — |
| `POST /auth/logout-all` 🔒 | — | 204; every session of the user is revoked | 401 |
| `POST /auth/google` | `{idToken}` | 200 Session (new users are created, email verified) | 401 `INVALID_GOOGLE_TOKEN`, 409 `ACCOUNT_EXISTS_LINK_REQUIRED` |
| `POST /auth/link/google` 🔒 | `{idToken}` | 200 Me | 401 `INVALID_GOOGLE_TOKEN`, 409 `GOOGLE_ALREADY_LINKED` |
| `DELETE /auth/link/google` 🔒 | — | 200 Me | 400 `PASSWORD_REQUIRED_TO_UNLINK`, 404 `GOOGLE_NOT_LINKED` |

## Rules

* Access token: JWT, 15 min. Refresh token: opaque, 30 days, rotated on every
  refresh; replaying a used one revokes the whole session (`REFRESH_TOKEN_REUSED`).
* A stale `Authorization` header never blocks a public route.
* Verification link: random 32-byte token, stored hashed, 24 h, single use. The
  mail links to `${APP_URL}/api/auth/verify?token=…`.
* Reset code: 6 digits, stored hashed, 15 min, 5 wrong attempts invalidate it;
  requesting a new code invalidates the previous one.
* Mail is sent through the authenticated SMTP account configured with
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM`.
* Google: the idToken audience must be `GOOGLE_WEB_CLIENT_ID`. A Google email that
  already belongs to a local account is refused with `ACCOUNT_EXISTS_LINK_REQUIRED`
  (log in with the password, then link from settings). No silent auto-linking.
