# 9jaconnect production checklist

Copy into Notion or Linear. Base API: `https://api.9jaconnet.com`

## Backend (must fix / add)

- [ ] `GET /api/v1/professionals?q=` keyword search
- [ ] Document login / refresh / Google OAuth: `access_token`, `refresh_token`, `user`
- [ ] Document directory params: `state_id`, `lga_id`, `category_id`, `subcategory_id`, `q`, `page`, `page_size`, optional `is_verified`, `sort`
- [ ] Notifications API: list, mark read, read-all, unread count
- [ ] `PATCH /api/v1/auth/me` for profile fields
- [ ] Pending reviews endpoint for customer dashboard
- [ ] Confirm review ratings: single `rating` vs price/time/quality
- [ ] Confirm email deep links + token TTL/error codes
- [ ] Confirm resend-verification rate limits
- [ ] Fill empty OpenAPI `200` schemas

## Backend (nice to have)

- [ ] WebSocket/SSE chat
- [ ] Document private file access
- [ ] CORS for prod/staging origins
- [ ] Google OAuth client whitelist
- [ ] `sort=rating` + premium boost

## Frontend - done

- [x] Auth: login, register, forgot/reset/verify, Google call, resend verification
- [x] Directory: categories, states/LGAs, list, detail, create ticket
- [x] Customer dashboard + tickets list
- [x] Professional dashboard + tickets list/status
- [x] Ticket detail: messages, quote, confirm, dispute, status
- [x] Reviews submit (averages price/time/quality → single rating) + profile reviews list
- [x] Customer onboarding + preferences
- [x] Account settings: photo upload, deletion request (profile PATCH blocked)
- [x] Customer KYC upload + status
- [x] Professional profile edit + settings/verification upload

## Frontend - still blocked / later

- [ ] Notifications (needs backend)
- [ ] Editable account profile fields (needs `PATCH /auth/me`)
- [ ] True pending-reviews feed (needs backend endpoint)
- [ ] Arrangements / ads / admin suite
- [ ] Keyword search server-side (needs `q=`)

## Labels

`backend-gap` · `frontend-wire` · `docs` · `prod-blocker`
