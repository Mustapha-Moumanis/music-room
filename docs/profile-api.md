# Profile & friends API contract (M2)

Base path: `<backend>/api`. JSON in and out. Every endpoint here needs
`Authorization: Bearer <accessToken>`. This is the contract between the backend
(MR-53, MR-52, MR-51) and the mobile screens (MR-50); Swagger at `/api/docs` is
generated from the same DTOs. Errors use the shape in [auth-api.md](auth-api.md).

## Profile groups (V.1)

| Group | Fields | Who sees it |
|---|---|---|
| `public` | `displayName`, `bio`, `avatarUrl` | Everyone |
| `friends` | `realName`, `city` | Friends and yourself |
| `private` | `birthDate` (`YYYY-MM-DD`), `phone` | Only yourself |
| `music` | `genres` (fixed list), `tags` (free), `visibility` | Whoever `visibility` allows: `PUBLIC`, `FRIENDS` or `PRIVATE` |

A pending friend request in either direction grants nothing beyond what a
stranger sees. The rule lives in one function, `visibleSections`
(`backend/src/modules/users/profile-visibility.ts`).

**MyProfile** — `GET /users/me`:

```json
{
  "id": "…", "email": "a@b.c",
  "public": { "displayName": "Ana", "bio": null, "avatarUrl": null },
  "friends": { "realName": null, "city": null },
  "private": { "birthDate": null, "phone": null },
  "music": { "genres": ["house"], "tags": ["road trip"], "visibility": "PUBLIC" }
}
```

**UserProfile** — `GET /users/:id`: `{id, relationship, public}` plus `friends`,
`private` and `music` only when the viewer may see them. A hidden group is left
out entirely, never sent as `null`.

**Relationship** — how the viewer relates to a user: `SELF`, `FRIENDS`,
`REQUEST_SENT` (I asked them), `REQUEST_RECEIVED` (they asked me), `NONE`.

## Endpoints

| Method & path | Body / query | Success | Error codes |
|---|---|---|---|
| `GET /users/me` | | 200 MyProfile | |
| `PATCH /users/me` | any subset of `{public, friends, private, music}` | 200 MyProfile | 400 validation |
| `GET /users/genres` | | 200 `{genres: string[]}` | |
| `GET /users/search` | `?q=` 2–50 chars | 200 `[{id, displayName, avatarUrl, relationship}]` (max 20) | 400 validation |
| `GET /users/:id` | | 200 UserProfile | 404 `USER_NOT_FOUND` |
| `GET /friends` | | 200 `[{id, displayName, avatarUrl, since}]` | |
| `GET /friends/requests` | | 200 `{incoming: [{user, createdAt}], outgoing: [{user, createdAt}]}` | |
| `POST /friends/requests/:userId` | | 200 `{userId, relationship}` | 400 `CANNOT_FRIEND_SELF`, 404 `USER_NOT_FOUND` |
| `POST /friends/requests/:userId/accept` | | 200 `{userId, relationship: "FRIENDS"}` | 404 `FRIEND_REQUEST_NOT_FOUND` |
| `POST /friends/requests/:userId/decline` | | 204 | |
| `DELETE /friends/requests/:userId` | (cancel my request) | 204 | |
| `DELETE /friends/:userId` | (unfriend) | 204 | |

## Rules

- `PATCH /users/me` changes only the fields sent. `null` or an empty string
  clears an optional field; `displayName` can't be cleared. Unknown fields are
  rejected at every level with 400.
- Limits: display name 1–80, bio 280, real name and city 80, phone 6–20 of
  `0-9 + ( ) . -` and spaces, birth date a real past date from 1900, at most 10
  genres and 10 tags (tags are trimmed, lower-cased, 30 chars, no duplicates).
- Search matches display names only, never emails, so it can't confirm who has an
  account. Unverified accounts are invisible: they don't appear in search, and
  their profile and friend requests return 404.
- Friend operations are idempotent. Sending a request to someone who already
  asked you accepts theirs. Writes for a pair of users run under a Postgres
  advisory lock, so racing requests still end as one friendship.
