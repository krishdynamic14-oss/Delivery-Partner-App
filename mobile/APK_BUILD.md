# Android APK Build

Use this when creating a real installable Android preview APK.

## One-Time Login

From `mobile/`:

```powershell
npx eas login
```

Use the Expo account that should own the Dynamic Bazar app builds.

## Preview APK Build

```powershell
npm run build:apk
```

Expected profile:

- `preview`
- Android package: `online.dynamicbazar.delivery`
- Output type: APK
- Distribution: internal

EAS will print a build URL. When the build finishes, download the APK from that URL and install it on the phone.

## Production Play Store Build

Later, for Play Console:

```powershell
npm run build:aab
```

That produces an Android App Bundle instead of an APK.

Increase `android.versionCode` in `app.json` before every Play Console upload.

The full Play Store internal testing gate lives in [`PLAY_STORE_RELEASE.md`](./PLAY_STORE_RELEASE.md).

## Current Manual Checks Before Building

- `mobile/.env` must contain the live `EXPO_PUBLIC_GAS_API_URL`.
- Apps Script must be deployed as the latest Web App version.
- `npm run typecheck` should pass.
- `npx expo config --type public` should show Android package `online.dynamicbazar.delivery`, version `1.0.0`, and the expected `android.versionCode`.
- Test login, order refresh, delivery, refused/cancel proof, failed/RTO, and COD settlement in Expo Go before building.
