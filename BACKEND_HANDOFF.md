# Backend handoff for 9jaconnect frontend (production)

Copy this to your backend engineer. The frontend is wired and ready. These are the gaps blocking a full production launch on `https://api.9jaconnet.com`.

**Frontend repo:** `9ja_connect_frontend`  
**API base (server env only):** `API_BASE_URL=https://api.9jaconnet.com`  
The browser calls same-origin `/api/v1/...`; Next.js proxies to this host so the backend URL is not exposed in frontend network requests.

All successful API responses should use the envelope the frontend already expects:

```json
{
  "success": true,
  "data": { },
  "error": null
}
```

Errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "machine_readable_code",
    "message": "Human readable message"
  }
}
```

---

## P0 — Must ship before launch

### 1) Professional gallery on read endpoints

**Problem:** Upload works (`POST /professionals/{id}/gallery`), but list, detail, and `/me` do not return gallery. Customers never see work photos. Pros hit the 5-image limit while the UI shows fewer photos.

**Add to these responses:**

- `GET /api/v1/professionals` (each item in `data.items[]`)
- `GET /api/v1/professionals/{professional_id}` (in `data.professional`)
- `GET /api/v1/professionals/me` (in `data` or `data.professional`)

**Shape (frontend mapper):**

```json
{
  "gallery": [
    { "id": "uuid", "url": "https://api.9jaconnet.com/.../image.jpg" }
  ],
  "cover_image_url": "https://api.9jaconnet.com/.../first.jpg"
}
```

- `gallery` max 5 items, ordered (first = listing cover)
- `url` must be a public HTTPS URL the browser can load (or path starting with `/` that resolves under the API host)
- `cover_image_url` optional; if omitted, frontend uses `gallery[0].url`

**Upload response** (`POST /api/v1/professionals/{id}/gallery`) should return the saved image in `data`:

```json
{
  "success": true,
  "data": {
    "gallery_image": {
      "id": "uuid",
      "url": "https://..."
    }
  }
}
```

(`id` + `url` at top level of `data` also works.)

---

### 2) Directory keyword search

**Problem:** Keyword search was returning `422` with `directory_search_invalid_params` on production.

**Required:** Accept `query` (preferred) and `q` alias on:

`GET /api/v1/professionals`

**Also support:** `sort=recency|rating|recommended`, `min_rating`, `page`, `page_size`.

**Search fields:** `business_name`, `service_description`, and services (plus category/subcategory if useful).

**Keep existing filters:** `state_id`, `lga_id`, `category_id`, `subcategory_id`.

**Example:**

```
GET /api/v1/professionals?query=solar&state_id=...&sort=recommended&page=1&page_size=20
```

**Response:** same list shape as today (`data.items[]` + `data.pagination`).

Frontend now sends `query=` (not `q=`).
---

### 3) Notifications API

**Status:** Documented in Customer API. Frontend is wired. Confirm these are live on production (previously 404).

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/notifications?page=1&page_size=30` | Bearer |
| GET | `/api/v1/notifications/unread-count` | Bearer |
| POST | `/api/v1/notifications/{notification_id}/read` | Bearer |
| POST | `/api/v1/notifications/read-all` | Bearer |

**Unread count `data` shape (any of these works):**

```json
{ "unread_count": 3 }
```

or a bare number in `data`.

**List item shape:**

```json
{
  "id": "uuid",
  "title": "New message",
  "body": "Optional detail",
  "type": "ticket_message",
  "entity_id": "ticket-uuid",
  "href": "/tickets/uuid",
  "is_read": false,
  "created_at": "2026-07-10T12:00:00Z"
}
```

Frontend also accepts: `message`, `notification_type`, `read`, `read_at`, nested `ticket.id`.

---

### 4) `PATCH /api/v1/auth/me`

**Status:** Documented in Customer API as `UpdateProfileRequest`. Frontend account settings already call this. Confirm it is live on production.

**Request body (partial update):**

```json
{
  "full_name": "string",
  "phone": "string",
  "whatsapp_number": "string",
  "home_state_id": "uuid",
  "home_lga_id": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { }
  }
}
```

Return the updated `user` object (same fields as login `user`).

---

### 5) Pending reviews for customer dashboard

**Status:** Documented in Customer API. Frontend customer dashboard calls `GET /api/v1/reviews/pending`. Confirm it is live (previously 405 on production).
---

## P1 — Strongly recommended

### 6) Auth response documentation (OpenAPI empty today)

Login, refresh, and Google OAuth should all return in `data`:

```json
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "user": {
    "id": "uuid",
    "professional_id": "uuid or null",
    "email": "...",
    "user_type": "customer | professional | admin",
    "full_name": "...",
    "profile_photo_url": "https://... or null",
    "onboarding_completed": true
  }
}
```

**Google OAuth:** `POST /api/v1/auth/oauth/google` with `{ "id_token": "...", "user_type": "customer|professional", "professional_profile": { ... } }` when signing up as pro.

### 7) CORS

Allow the production frontend origin(s), for example:

- `https://9jaconnect.com` (or your Vercel/host URL)
- `http://localhost:3000` (dev)

### 8) Google OAuth

Whitelist the production frontend origin in Google Cloud Console. Frontend needs:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
```

---

## Already working on production (verified)

- `GET /api/v1/professionals` (list, filters without `q`)
- `GET /api/v1/professionals/{id}` (detail, no gallery yet)
- Categories, states, LGAs
- Auth: register, login, forgot/reset, verify email (frontend wired)
- Tickets create/list/detail, messages, quotes, disputes (frontend wired)
- Gallery upload + delete endpoints exist (read path missing)

---

## Backend QA checklist (run after deploy)

1. **Gallery**
   - Upload 2 images as a pro
   - `GET /professionals/me` returns both in `gallery[]` with HTTPS `url`
   - `GET /professionals/{id}` returns same `gallery`
   - `GET /professionals` list items include `cover_image_url` or `gallery[0]`

2. **Search**
   - `GET /professionals?q=cleaning` returns 200 and filtered results (not 422)

3. **Notifications** (logged-in user)
   - `GET /notifications/unread-count` → 200
   - `GET /notifications` → 200 with items array

4. **Profile**
   - `PATCH /auth/me` with `full_name` → 200 and updated user

5. **Reviews**
   - `GET /reviews/pending` as customer with completed ticket → 200

6. **CORS**
   - Browser request from production frontend origin succeeds (no CORS error in Network tab)

---

## Contact / labels

Tag backend tasks: `prod-blocker` · `api-gap` · `docs`

Frontend will work with graceful fallbacks until P0 items ship (keyword search falls back to filters only; notifications stay quiet; gallery uses owner-side cache in same browser only).
