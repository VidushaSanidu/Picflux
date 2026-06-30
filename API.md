# Picflux API Reference

**Base URL:** `http://localhost:4000`
Image public url: R2_PUBLIC_URL

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


# PRB API Reference

**Base URL:** `https://api.perturbai.io`  
**Local dev:** `http://localhost:4001`

---

## Authentication

| Method | Description |
|--------|-------------|
| **JWT Cookie** | Set automatically on login/register. Sent via `httpOnly` cookie named `token`. Required to create jobs. |
| **API Key** | Pass as `Authorization: Bearer <PRB_API_KEY>` header. Used by the ML processing service to read and update jobs. |
| **Admin JWT** | JWT cookie belonging to an `admin`-role user. Accepted wherever an API key is accepted. |

---

## Role Summary

| Role | Description |
|------|-------------|
| `general` | Default role on registration. Cannot create jobs. |
| `granted` | Can create and submit jobs for processing. |
| `admin` | Full access — can create jobs and access all protected endpoints. |

---

## `GET /health`

System health check.

**Response `200`**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Authentication Routes

### `POST /auth/register`

Create a new account. Sets the `token` JWT cookie on success.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✓ | User email address |
| `password` | string | ✓ | Plain-text password (min 8 characters) |
| `name` | string | — | Display name (optional) |

**Response `201`**
```json
{ "message": "Registration successful. Please check your email to verify your account." }
```

`username` is automatically set to the part of the email before `@`.

**Errors**

| Code | Reason |
|------|--------|
| `400` | Missing/invalid `email` or password too short |
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
  "username": "johndoe",
  "name": "John Doe",
  "role": "general"
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
  "username": "johndoe",
  "name": "John Doe",
  "role": "general"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |

---

### `GET /auth/google`

Initiates Google OAuth flow. Redirects the browser to Google's consent screen.

---

### `GET /auth/google/callback`

Google OAuth callback. On success, sets the JWT cookie and redirects to the frontend dashboard. On failure, redirects to `/login?error=oauth_failed`.

---

## Jobs

### `POST /jobs`

Upload an image and create a new processing job.

**Auth:** JWT cookie required — user must have `granted` or `admin` role.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | ✓ | Image to process (JPEG, PNG, WebP, or GIF — max 10 MB) |

**Response `201`**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "WAITING",
  "exampleImageKeys": [],
  "processedImageKey": null,
  "initialModelScore": null,
  "initialClass": null,
  "afterClass": null,
  "afterScore": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**`status` values:** `WAITING` | `CLASSIFIED` | `PENDING` | `COMPLETE`

**Errors**

| Code | Reason |
|------|--------|
| `400` | No file provided |
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but role is not `granted` or `admin` |

---

### `POST /jobs/:id/proceed`

Transition a job from `CLASSIFIED` to `PENDING`, signalling that the granted user approves the initial classification and wants perturbation to begin.

**Auth:** JWT cookie required — user must have `granted` or `admin` role. Non-admin users may only proceed their own jobs.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Job UUID |

**Response `200`** *(raw job entity — storage keys only, no presigned URLs)*
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "PENDING",
  "exampleImageKeys": [],
  "processedImageKey": null,
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": null,
  "afterScore": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but role is not `granted` or `admin`, or job belongs to another user |
| `404` | Job not found |
| `409` | Job is not in `CLASSIFIED` status |

---

### `GET /jobs`

Return all jobs in reverse-chronological order. Each job includes short-lived presigned URLs (10 minutes) for stored images.

**Auth:** `Authorization: Bearer <PRB_API_KEY>` **or** admin JWT cookie required.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "status": "COMPLETE",
    "userImageUrl": "https://r2.example.com/...",
    "userImageKey": "prb/user/uuid.jpg",
    "processedImageUrl": "https://r2.example.com/...",
    "processedImageKey": "prb/processed/uuid.jpg",
    "exampleImageUrls": ["https://r2.example.com/..."],
    "exampleImageKeys": ["prb/examples/uuid.jpg"],
    "initialModelScore": 0.92,
    "initialClass": "cat",
    "afterClass": "dog",
    "afterScore": 0.61,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
]
```

`processedImageUrl`/`processedImageKey` are `null` until a processed image is uploaded via `PATCH`. `exampleImageUrls`/`exampleImageKeys` are empty arrays until example images are uploaded via `PATCH`.

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid API key / JWT cookie |

---

### `GET /jobs/:id`

Return a single job by ID, including short-lived presigned URLs (10 minutes) for stored images.

**Auth:** `Authorization: Bearer <PRB_API_KEY>` **or** admin JWT cookie required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Job UUID |

**Response `200`**
```json
{
  "id": "uuid",
  "status": "COMPLETE",
  "userImageUrl": "https://r2.example.com/...",
  "userImageKey": "prb/user/uuid.jpg",
  "processedImageUrl": "https://r2.example.com/...",
  "processedImageKey": "prb/processed/uuid.jpg",
  "exampleImageUrls": ["https://r2.example.com/..."],
  "exampleImageKeys": ["prb/examples/uuid.jpg"],
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": "dog",
  "afterScore": 0.61,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

`processedImageUrl`/`processedImageKey` are `null` until a processed image is uploaded via `PATCH`. `exampleImageUrls`/`exampleImageKeys` are empty until example images are uploaded via `PATCH`.

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid API key / JWT cookie |
| `404` | Job not found |

---

### `PATCH /jobs/:id`

Update a job with result data from the processing service. All fields are optional — only provided fields are updated.

**Auth:** `Authorization: Bearer <PRB_API_KEY>` **or** admin JWT cookie required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Job UUID |

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `processedImage` | file | — | Perturbed output image (JPEG, PNG, WebP, or GIF — max 10 MB). Uploaded to R2 and stored as `processedImageKey`. |
| `exampleImages` | file[] | — | One or more example images (JPEG, PNG, WebP, or GIF — max 10 MB each). Replaces all existing example images. |
| `status` | string | — | New job status (`WAITING` \| `CLASSIFIED` \| `PENDING` \| `COMPLETE`) |
| `initialModelScore` | number | — | Model confidence score for the original image |
| `initialClass` | string | — | Predicted class for the original image |
| `afterClass` | string | — | Predicted class after perturbation |
| `afterScore` | number | — | Model confidence score after perturbation |

**Response `200`** *(raw job entity — storage keys only, no presigned URLs)*
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "COMPLETE",
  "exampleImageKeys": ["prb/examples/uuid.jpg"],
  "processedImageKey": "prb/processed/uuid.jpg",
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": "dog",
  "afterScore": 0.61,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Uploaded file is invalid or exceeds 10 MB |
| `401` | Missing or invalid API key / JWT cookie |
| `404` | Job not found |

---

## User Management

### `PATCH /users/me`

Update the authenticated user's own profile. At least one field must be provided. Email cannot be changed.

**Auth:** JWT cookie required (any role).

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | — | New display name (send empty string to clear) |
| `username` | string | — | New username (cannot be empty) |
| `currentPassword` | string | — | Current password — **required when changing password** |
| `password` | string | — | New password (min 8 characters) |

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "role": "general"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | No fields provided, `username` is empty, `currentPassword` missing when changing password, or new password too short |
| `401` | Missing or invalid JWT cookie, or `currentPassword` is incorrect |

---

All routes below require a valid JWT cookie **and** the `admin` role.

### `GET /users`

List all registered users.

**Auth:** JWT cookie + `admin` role required.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "general",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |

---

### `PATCH /users/:id/role`

Update a user's role.

**Auth:** JWT cookie + `admin` role required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | User UUID |

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | ✓ | New role (`general` \| `granted` \| `admin`) |

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "granted"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Invalid or missing `role` value |
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |
| `404` | User not found |


---

### `GET /jobs/my`

Return the last 10 jobs submitted by the authenticated user, in reverse-chronological order. Each job includes short-lived presigned URLs (10 minutes) for stored images.

**Auth:** JWT cookie required — user must have `granted` or `admin` role.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "status": "COMPLETE",
    "userImageUrl": "https://r2.example.com/...",
    "userImageKey": "prb/user/uuid.jpg",
    "processedImageUrl": "https://r2.example.com/...",
    "processedImageKey": "prb/processed/uuid.jpg",
    "exampleImageUrls": ["https://r2.example.com/..."],
    "exampleImageKeys": ["prb/examples/uuid.jpg"],
    "perturbedExampleImageUrls": ["https://r2.example.com/..."],
    "perturbedExampleImageKeys": ["prb/perturbed/uuid.jpg"],
    "initialModelScore": 0.92,
    "initialClass": "cat",
    "afterClass": "dog",
    "afterScore": 0.61,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
]
```

Returns at most 10 items. `processedImageUrl`/`processedImageKey` are `null` until set via `PATCH`. Array fields are empty until populated via `PATCH`.

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but role is not `granted` or `admin` |

---

## Leaderboard

Validator dashboards — each validator maintains their own view of the subnet, which the public can read back per-validator.

### `POST /api/v1/report`

**Auth:** Wallet signature — no API key or JWT cookie. Validators sign the raw request body bytes with their sr25519 hotkey.

**Required Headers**

| Header | Description |
|--------|-------------|
| `X-Validator-Hotkey` | SS58-encoded validator hotkey |
| `X-Signature` | `0x`-prefixed hex sr25519 signature of the exact raw JSON body bytes |

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_id` | string | ✓ | Identifier of the evaluated task |
| `timestamp` | string | ✓ | ISO 8601 datetime — used for replay protection (rejected if older than `SIGNATURE_MAX_AGE_SECONDS`) |
| `validator_hotkey` | string | ✓ | Must match `X-Validator-Hotkey` header exactly |
| `network` | object | ✓ | Network-wide aggregate statistics (see below) |
| `miners` | array | ✓ | Per-miner evaluation results (see below) |

**`network` object**

| Field | Type | Description |
|-------|------|-------------|
| `total_miners` | number | Total miners on the subnet |
| `available_miners` | number | Miners that responded |
| `avg_score` | number | Network average score |
| `avg_rmse` | number | Network average RMSE |
| `avg_norm` | number | Network average norm |
| `success_count` | number | Number of valid responses |

**`miners` array item**

| Field | Type | Description |
|-------|------|-------------|
| `uid` | number | Miner UID on the subnet |
| `hotkey` | string | Miner hotkey (SS58) |
| `coldkey` | string | Miner coldkey (SS58) |
| `incentive` | number | Miner incentive score |
| `avg_score` | number | Running average score |
| `last_score` | number | Score from this evaluation |
| `rmse` | number | Root mean squared error |
| `norm` | number | Norm value |
| `result` | string | `"valid"` \| `"timeout"` \| `"rejected"` |
| `image_url` | string | URL of the evaluated image (empty string if none) |

**Response `200`**
```json
{
  "ok": true,
  "task_id": "task_48036",
  "miners": 58
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Empty request body |
| `401` | Missing headers, invalid signature, or timestamp older than `SIGNATURE_MAX_AGE_SECONDS` |
| `403` | `X-Validator-Hotkey` does not match `body.validator_hotkey`, or hotkey is not a registered validator |
| `422` | Invalid JSON body or missing required fields |

---

### `GET /api/v1/validators`

List the SS58 hotkeys of all validators that have submitted at least one report. Public — no authentication required. Ordered by most recently updated first.

**Response `200`**
```json
{
  "validators": [
    "5F3sa2TJ...",
    "5GrwvaEF..."
  ]
}
```

---

### `GET /api/v1/leaderboard/:hotkey`

Retrieve the stored dashboard for a specific validator. Public — no authentication required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `hotkey` | SS58 hotkey of the validator |

**Response `200`**
```json
{
  "validatorHotkey": "5F3sa2TJ...",
  "taskId": "task_48036",
  "timestamp": "2026-06-27T23:18:00.000Z",
  "network": {
    "totalMiners": 58,
    "availableMiners": 42,
    "avgScore": 0.579,
    "avgRmse": 0.0974,
    "avgNorm": 0.064,
    "successCount": 31
  },
  "miners": [
    {
      "uid": 12,
      "hotkey": "5GrwvaEF...",
      "coldkey": "5DAAnrj7...",
      "incentive": 0.7,
      "avgScore": 0.9215,
      "lastScore": 0.9342,
      "rmse": 0.0841,
      "norm": 0.0117,
      "result": "valid",
      "imageUrl": "https://..."
    }
  ],
  "updatedAt": "2026-06-27T23:18:05.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `404` | No data found for this validator hotkey |

---

### `GET /api/v1/burn-rate`

Return the current burn rate. Public — no authentication required.

**Response `200`**
```json
{ "burnRate": 0.2 }
```

---

### `POST /api/v1/burn-rate`

Set the burn rate.

**Auth:** `Authorization: Bearer <PRB_API_KEY>` **or** admin JWT cookie required.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `burnRate` | number | ✓ | New burn rate value |

**Response `200`**
```json
{ "ok": true, "burnRate": 0.2 }
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid API key / JWT cookie |
| `422` | `burnRate` is not a finite number |

