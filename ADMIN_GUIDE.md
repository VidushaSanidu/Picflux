# PRB Admin / ML Service Guide

**Base URL:** `https://api.perturbai.io`  
**Local dev:** `http://localhost:4001`

**Auth for all calls below:** `Authorization: Bearer <PRB_API_KEY>`  
(or an admin JWT cookie)

---

## Job Lifecycle

```
WAITING ──► CLASSIFIED ──► PENDING ──► COMPLETE
              (Call 1)    (user clicks   (Call 2)
                           "Proceed")
```

| Status | Who sets it | Meaning |
|--------|------------|---------|
| `WAITING` | Created automatically | Job submitted, awaiting ML classification |
| `CLASSIFIED` | ML service — **Call 1** | Initial classification done; waiting for user to confirm |
| `PENDING` | User (via `POST /jobs/:id/proceed`) | User approved; perturbation in progress |
| `COMPLETE` | ML service — **Call 2** | Perturbation finished; results uploaded |

---

## Updating a Job — Two-Call Pattern

The ML processing service updates each job in **two separate `PATCH /jobs/:id` calls**.

---

### Call 1 — Classification Result

After the ML model classifies the original user image, send the scores, upload the example images, and transition the job to `CLASSIFIED`.

```
PATCH /jobs/:id
Authorization: Bearer <PRB_API_KEY>
Content-Type: multipart/form-data
```

| Field | Type | Description |
|-------|------|-------------|
| `exampleImages` | file[] | One or more example/explanation images (max 10 MB each, max 20 files). **Replaces** any existing example images. |
| `initialModelScore` | number | Confidence score (0–1) for the original image |
| `initialClass` | string | Predicted class label (e.g. `"cat"`) |
| `status` | string | `CLASSIFIED` |

**curl example:**
```bash
curl -X PATCH https://api.perturbai.io/jobs/<JOB_ID> \
  -H "Authorization: Bearer <PRB_API_KEY>" \
  -F "exampleImages=@/path/to/example1.jpg" \
  -F "exampleImages=@/path/to/example2.jpg" \
  -F "initialModelScore=0.92" \
  -F "initialClass=cat" \
  -F "status=CLASSIFIED"
```

**Python example:**
```python
import requests

with open("example1.jpg", "rb") as ex1, \
     open("example2.jpg", "rb") as ex2:

    requests.patch(
        f"https://api.perturbai.io/jobs/{job_id}",
        headers={"Authorization": f"Bearer {PRB_API_KEY}"},
        files=[
            ("exampleImages", ("example1.jpg", ex1, "image/jpeg")),
            ("exampleImages", ("example2.jpg", ex2, "image/jpeg")),
        ],
        data={
            "initialModelScore": 0.92,
            "initialClass": "cat",
            "status": "CLASSIFIED",
        },
    )
```

> **Important:** Repeat the `exampleImages` field once per file — do **not** send them as a JSON array. Up to 20 files are accepted per call.

**Response `200`** — raw job entity (storage keys, no presigned URLs):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "CLASSIFIED",
  "exampleImageKeys": [
    "prb/examples/uuid1.jpg",
    "prb/examples/uuid2.jpg"
  ],
  "processedImageKey": null,
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": null,
  "afterScore": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:01:00.000Z"
}
```

After this call, the job sits in `CLASSIFIED` and the frontend shows the result to the user. The user then clicks **Proceed** (`POST /jobs/:id/proceed`), which moves the status to `PENDING` — signalling to the ML service that perturbation should begin.

---

### Call 2 — Perturbation Result

After perturbation is complete, upload the output images and scores, then mark the job `COMPLETE`.

```
PATCH /jobs/:id
Authorization: Bearer <PRB_API_KEY>
Content-Type: multipart/form-data
```

| Field | Type | Description |
|-------|------|-------------|
| `processedImage` | file | The perturbed output image (max 10 MB) |
| `afterClass` | string | Predicted class after perturbation |
| `afterScore` | number | Confidence score after perturbation |
| `status` | string | `COMPLETE` |

**curl example:**
```bash
curl -X PATCH https://api.perturbai.io/jobs/<JOB_ID> \
  -H "Authorization: Bearer <PRB_API_KEY>" \
  -F "processedImage=@/path/to/perturbed.jpg" \
  -F "afterClass=dog" \
  -F "afterScore=0.61" \
  -F "status=COMPLETE"
```

**Python example:**
```python
import requests

with open("perturbed.jpg", "rb") as processed:

    requests.patch(
        f"https://api.perturbai.io/jobs/{job_id}",
        headers={"Authorization": f"Bearer {PRB_API_KEY}"},
        files=[
            ("processedImage", ("perturbed.jpg", processed, "image/jpeg")),
        ],
        data={
            "afterClass": "dog",
            "afterScore": 0.61,
            "status": "COMPLETE",
        },
    )
```

**Response `200`** — raw job entity (storage keys, no presigned URLs):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "COMPLETE",
  "exampleImageKeys": [
    "prb/examples/uuid1.jpg",
    "prb/examples/uuid2.jpg"
  ],
  "processedImageKey": "prb/processed/uuid.jpg",
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": "dog",
  "afterScore": 0.61,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

---

## Error Reference

| Code | Reason |
|------|--------|
| `400` | A file is invalid, exceeds 10 MB, or is not JPEG/PNG/WebP/GIF |
| `401` | Missing or invalid API key / JWT cookie |
| `404` | Job not found |
| `500` | Internal server error |

---

## Reading Jobs (for polling)

### List all jobs

```bash
curl https://api.perturbai.io/jobs \
  -H "Authorization: Bearer <PRB_API_KEY>"
```

### Get a single job

```bash
curl https://api.perturbai.io/jobs/<JOB_ID> \
  -H "Authorization: Bearer <PRB_API_KEY>"
```

Both endpoints return presigned URLs (`userImageUrl`, `processedImageUrl`, `exampleImageUrls`) valid for **10 minutes**.
