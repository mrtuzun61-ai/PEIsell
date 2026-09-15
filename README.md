# ShootGo

ShootGo is a hyperlocal second-hand marketplace for iOS and Android.

Core UX:
- Open app -> immediately see products
- Sell -> Photo -> Price -> Short description -> Location -> Publish
- Browsing is public
- Login is required for messaging, favorites, listing creation, profile, and listing management

Business rules:
- New account: first 30 days, up to 3 listings free total
- After free eligibility:
  - item price <= 500 CAD -> 1 CAD listing fee
  - >500 and <=1000 -> 2 CAD
  - >1000 and <=3000 -> 3 CAD
  - >3000 -> 5 CAD
- Listings expire after 30 days
- Relisting starts a new 30-day period and uses normal pricing
- No subscription / no recurring billing
- Optional Boost is supported in schema/config but payment provider wiring is intentionally left as an integration point

## Structure

- `mobile/` Expo + React Native + Expo Router
- `admin/` Next.js admin dashboard skeleton
- `supabase/migrations/` PostgreSQL schema, RLS, helper functions

## Important

This repository does not contain secrets or service-role credentials.

You still need to:
1. Add mobile environment values from `mobile/.env.example`.
2. Add admin environment values from `admin/.env.example`.
3. Install dependencies.
4. Wire the final payment provider appropriate for App Store / Play Store distribution.
5. Run real-device testing.

## Live Supabase

ShootGo is backed by the dedicated Supabase project in Canada Central. The repository intentionally keeps client configuration in `.env.example`; real env files are gitignored.
