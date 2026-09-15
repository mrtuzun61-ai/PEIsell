# Setup

## 1) Supabase
Create a new Supabase project.

Run the SQL in:
`supabase/migrations/0001_shootgo_foundation.sql`

Then copy the URL and anon key into:
`mobile/.env`

For the admin app, also add the service-role key to:
`admin/.env.local`

Never put the service-role key in the mobile app.

## 2) Mobile
```bash
cd mobile
npm install
npx expo start
```

## 3) Admin
```bash
cd admin
npm install
npm run dev
```

## 4) Important payment note
The included database and RPC logic supports free-credit checks and fee calculation.
For paid listings, you still need to integrate the final payment provider and, only after verified payment, insert/update a `payments` row with `status='paid'`.

The database `publish_listing()` RPC will refuse to activate a paid listing unless a matching successful payment exists.

## 5) Before App Store / Play Store
- Replace placeholder visuals with final ShootGo branding.
- Complete image upload from Expo to the `listing-images` bucket.
- Complete chat UI using `conversations` and `messages`.
- Add server-side/admin authorization for admin routes.
- Add payment provider webhooks and idempotency.
- Add scheduled expiration handling (or filter active feed by `expires_at` and run a periodic expiry job).
- Add abuse/spam rate limits and report review workflow.
- Run iOS and Android real-device testing.
