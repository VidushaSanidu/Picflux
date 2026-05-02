# Picflux API Reference

**Base URL:** `http://localhost:4000`

---

## Authentication

| Method | Description |
|--------|-------------|
| **JWT Cookie** | Set automatically on login/register. Sent with every request via `httpOnly` cookie named `token`. Used by the web app. |
| **API Key** | Pass as `Authorization: Bearer <key>` header. Used for programmatic / third-party access. |

---

## Role Summary

| Role | Auth Required | Notes |
|------|---------------|-------|
| [Public](#1-public) | None | Open browsing and discovery |
| [Authenticated](#2-authenticated--jwt-cookie) | JWT cookie | Web users after login |
| [API Key Holder](#3-api-key-holder) | `Authorization: Bearer <key>` | Programmatic upload & download |
| [Admin](#4-admin) | JWT cookie + `admin` role | Moderation workflows |

---

## 1. Public

No authentication required for any route in this section.

---

### `GET /health`

System health check.

**Response `200`**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### `GET /v1/images`

List all approved images. Supports search, filtering and pagination.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | Full-text search on title/tags |
| `tags` | string | — | Comma-separated tag filter (e.g. `nature,sunset`) |
| `page` | number | `1` | Page number (≥ 1) |
| `limit` | number | `20` | Results per page (1–100) |

**Response `200`**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Mountain Sunset",
      "location": "Alps",
      "tags": ["nature", "sunset"],
      "mimeType": "image/jpeg",
      "sizeBytes": 204800,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "uploader": { "id": "uuid", "email": "user@example.com" }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  },
  "topTags": ["nature", "travel", "urban", "wildlife", "sunset"]
}
```

---

### `GET /v1/images/:id`

Get details of a single approved image, including a short-lived presigned view URL (10 minutes).

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Image UUID |

**Response `200`**
```json
{
  "id": "uuid",
  "title": "Mountain Sunset",
  "location": "Alps",
  "tags": ["nature", "sunset"],
  "mimeType": "image/jpeg",
  "sizeBytes": 204800,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "approvedAt": "2025-01-02T00:00:00.000Z",
  "uploader": { "id": "uuid", "email": "user@example.com" },
  "viewUrl": "https://r2.example.com/..."
}
```

**Errors**

| Code | Reason |
|------|--------|
| `404` | Image not found or not approved |

---

### `GET /v1/tags/popular`

Returns the top 5 most-used tags across all approved images.

**Response `200`**
```json
{
  "tags": ["nature", "travel", "urban", "wildlife", "sunset"]
}
```

---

### `GET /v1/images/:id/download`

Returns a presigned download URL for an approved image.

- **Guest (unauthenticated):** Rate limited to **5 downloads per IP per 24 hours**.
- **Authenticated (JWT or API key):** Rate limit is bypassed.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Image UUID |

**Response `200`**
```json
{
  "downloadUrl": "https://r2.example.com/..."
}
```

**Errors**

| Code | Reason |
|------|--------|
| `404` | Image not found or not approved |
| `429` | Guest daily download limit (5) reached — resets in 24 hours |

---

## 2. Authenticated — JWT Cookie

These routes require a valid JWT cookie (`token`). Obtain one via `POST /auth/register` or `POST /auth/login`.

---

### `POST /auth/register`

Create a new account. Sets the `token` JWT cookie on success.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✓ | User email address |
| `password` | string | ✓ | Plain-text password | min 8

**Response `201`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Missing or invalid `email`/`password` |
| `409` | Email already registered |

---

### `POST /auth/login`

Authenticate and receive a JWT cookie.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✓ | Registered email |
| `password` | string | ✓ | Account password |

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Missing `email` or `password` |
| `401` | Invalid credentials |

---

### `POST /auth/logout`

Clears the JWT cookie.

**Response `200`**
```json
{ "message": "Logged out" }
```

---

### `GET /auth/me`

Returns the currently authenticated user's profile.

**Auth:** JWT cookie required.

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |

---

### `POST /images/upload`

Upload an image for review (web flow). The image is stored with `pending` status until approved by an admin.

**Auth:** JWT cookie required.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | ✓ | Image file (JPEG, PNG, WebP, etc.) |
| `title` | string | — | Optional title |
| `location` | string | — | Optional location label |
| `tags` | string \| string[] | — | Comma-separated string or repeated field |

**Response `201`**
```json
{
  "id": "uuid",
  "status": "pending",
  "title": "Mountain Sunset",
  "location": "Alps",
  "tags": ["nature", "sunset"],
  "mimeType": "image/jpeg",
  "sizeBytes": 204800,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | No file provided |
| `401` | Missing or invalid JWT cookie |

---

### `GET /images/mine`

List all images uploaded by the authenticated user (all statuses).

**Auth:** JWT cookie required.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "storageKey" : "images/gfwenemle.png",
    "status": "pending",
    "title": "Mountain Sunset",
    "location": "Alps",
    "tags": ["nature", "sunset"],
    "mimeType": "image/jpeg",
    "sizeBytes": 204800,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "rejectionReason": null
  }
]
```

**`status` values:** `pending` | `approved` | `rejected`

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |

---

### `POST /api-keys/`

Generate a new API key for the authenticated user. The raw key is shown **only once** and cannot be recovered.

**Auth:** JWT cookie required.

**Response `201`**
```json
{
  "message": "Store this key securely. It will not be shown again.",
  "key": "pfx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "id": "uuid",
  "keyPrefix": "pfx_xxxx",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |

---

### `GET /api-keys/`

List all active API keys belonging to the authenticated user. Raw keys are **never** returned.

**Auth:** JWT cookie required.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "keyPrefix": "pfx_xxxx",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |

---

### `DELETE /api-keys/:id`

Revoke an API key owned by the authenticated user.

**Auth:** JWT cookie required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | API key UUID |

**Response `200`**
```json
{ "message": "API key revoked" }
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `404` | Key not found or not owned by user |

---

## 3. API Key Holder

These routes use `Authorization: Bearer <api-key>` instead of a JWT cookie.

---

### `POST /api/v1/images`

Upload an image via API key (programmatic flow). Stored with `pending` status until approved.

**Auth:** `Authorization: Bearer <api-key>` required.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | ✓ | Image file (JPEG, PNG, WebP, etc.) |
| `title` | string | — | Optional title |
| `location` | string | — | Optional location label |
| `tags` | string \| string[] | — | Comma-separated string or repeated field |

**Response `201`**
```json
{
  "id": "uuid",
  "status": "pending",
  "title": "Mountain Sunset",
  "location": "Alps",
  "tags": ["nature", "sunset"],
  "mimeType": "image/jpeg",
  "sizeBytes": 204800,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | No file provided |
| `401` | Missing, invalid, or revoked API key |

---

### `GET /api/v1/images/:id/download` *(authenticated)*

Same endpoint as the public download but authenticated via API key — rate limit is bypassed.

See [Public → Download](#get-apiv1imagesiddownload) for full details.

---

## 4. Admin

All admin routes require a valid JWT cookie **and** the `admin` role.

---

### `GET /admin/images/pending`

List all images with `pending` status awaiting moderation.

**Auth:** JWT cookie + admin role required.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "title": "Mountain Sunset",
    "tags": ["nature", "sunset"],
    "mimeType": "image/jpeg",
    "sizeBytes": 204800,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "uploader": { "id": "uuid", "email": "user@example.com" }
  }
]
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |

---

### `GET /admin/images/:id`

Get full details of a single pending image, including a presigned preview URL.

**Auth:** JWT cookie + admin role required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Image UUID |

**Response `200`**
```json
{
  "id": "uuid",
  "title": "Mountain Sunset",
  "location": "Alps",
  "tags": ["nature", "sunset"],
  "mimeType": "image/jpeg",
  "sizeBytes": 204800,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "uploader": { "id": "uuid", "email": "user@example.com" },
  "previewUrl": "https://r2.example.com/..."
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |
| `404` | Image not found |

---

### `PATCH /admin/images/:id/approve`

Approve a pending image. Status changes to `approved` and the image becomes publicly visible.

**Auth:** JWT cookie + admin role required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Image UUID |

**Response `200`**
```json
{
  "id": "uuid",
  "status": "approved",
  "approvedAt": "2025-01-02T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |
| `404` | Image not found |

---

### `PATCH /admin/images/:id/reject`

Reject a pending image with an optional reason. Status changes to `rejected`.

**Auth:** JWT cookie + admin role required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Image UUID |

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | — | Human-readable rejection reason |

**Response `200`**
```json
{
  "id": "uuid",
  "status": "rejected",
  "rejectionReason": "Low image quality"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |
| `404` | Image not found |

---

## Error Format

All errors follow a consistent shape:

```json
{ "message": "Human-readable error description" }
```

Common HTTP status codes used across the API:

| Code | Meaning |
|------|---------|
| `400` | Bad request — validation failure |
| `401` | Unauthenticated — missing or invalid credentials |
| `403` | Forbidden — authenticated but lacks required role |
| `404` | Resource not found |
| `409` | Conflict — e.g. duplicate email |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal server error |
