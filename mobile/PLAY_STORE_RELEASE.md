# Play Store Release Runbook

Use this file as the release gate for the first Play Store internal testing upload.

## Release Track

- First release track: Play Console Internal testing.
- Do not roll out to Production until the internal test checklist below passes on at least two Android phones.
- APK builds are for local direct install only. Play Console upload must use the production AAB.

## Required Local State

- `app.json` Android package: `online.dynamicbazar.delivery`.
- `app.json` Android `versionCode`: increase by 1 for every Play upload.
- `google-services.json` must exist locally in `mobile/` and must match Firebase package `online.dynamicbazar.delivery`.
- Expo project credentials must have the Firebase FCM V1 service account key uploaded for this Android application.
- `mobile/.env` must contain the live `EXPO_PUBLIC_GAS_API_URL` and production UPI values.
- `google-services.json`, Firebase service-account JSON, `.env`, APK, AAB, keystore/key files must stay ignored and untracked.

## Build Commands

```powershell
cd "E:\My Project\New folder\dynamic-bazar-app\mobile"
npm run typecheck
npx expo config --type public
npm run build:aab
```

Upload the generated AAB to Play Console Internal testing.

## Internal Test Checklist

- Fresh install from Play internal testing link.
- Admin login works and partner login works.
- Logout clears session; app restart keeps session before logout.
- Partner sees only their assigned orders/district.
- Auto push registration creates/updates a row in `PUSH TOKENS` without pressing a debug button.
- Admin receives test/admin alert; partner receives assigned-order or stock/deadline alert.
- Delivery OTP sends, delivery submit writes Sheet status and proof URL.
- Failed/refused/cancelled submit writes Sheet status and proof URL.
- Refused delivery and cancelled by customer require house proof photo.
- Offline delivery/fail/settlement queues, then reconnect sync uploads proof and clears pending item.
- COD Cash, UPI QR, and Prepaid flows behave correctly.
- COD settlement proof reaches `PAYMENT LOG`; admin approve/reject works.
- Maps opens Google Maps or browser fallback on partner phone.
- Theme selector persists after app restart and text is readable on small/low-end Android.
- No partner-facing debug tools, token previews, raw server errors, or secret values are visible.

## Play Console Assets

- App name: Dynamic Bazar Delivery
- Short description: Delivery, COD, and stock operations app for Dynamic Bazar partners.
- Category: Business or Productivity.
- Required assets: 512x512 app icon, 1024x500 feature graphic, phone screenshots from the real app.
- Required policy docs: live privacy policy URL and completed Data safety form.
