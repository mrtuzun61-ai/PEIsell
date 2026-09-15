# Build ShootGo without a computer

The project is ready for Expo Application Services (EAS) builds.

## What you can do from a phone
1. Open https://expo.dev in your phone browser and sign in/create an Expo account.
2. Connect your GitHub account to Expo.
3. Select the repository `mrtuzun61-ai/PEIsell` and set the app root directory to `mobile`.
4. Create/configure the Expo project for ShootGo.
5. Add these environment variables in the Expo project settings:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Run an Android preview build using the `preview` profile. This produces an APK suitable for direct installation/testing.
7. For Google Play later, run the `production` profile. It produces an Android App Bundle (AAB).
8. iOS production builds require an Apple Developer account and Apple signing credentials.

## Build profiles
- `preview`: internal distribution; Android APK for direct testing.
- `production`: store-ready build profile; Android AAB and iOS production build.

## Important
The GitHub repository intentionally does not contain private service-role credentials. Only client-safe public Supabase values should be configured for the mobile app.
