# Play Console Internal Testing Checklist

## Build Files

- AAB: `mobile/play-store/release/dynamic-bazar-delivery-v1.aab`
- APK for side-load testing: `mobile/play-store/release/dynamic-bazar-delivery-v1.apk`
- App icon: `mobile/play-store/graphics/app-icon-512.png`
- Feature graphic: `mobile/play-store/graphics/feature-graphic-1024x500.png`
- Phone screenshots: `mobile/play-store/screenshots/phone/`

## Pre-upload Checks Completed

- `npm run typecheck` passed.
- GAS syntax check passed.
- Release APK built.
- Release APK installed on connected Android device.
- Production AAB built successfully.
- App package: `online.dynamicbazar.delivery`
- Version: `1.0.0`
- Version code: `1`

## Play Console Steps

1. Open Google Play Console.
2. Create/select app: Dynamic Bazar Delivery.
3. Set default language: English.
4. Category: Business.
5. Add app access instructions for tester login credentials.
6. Add privacy policy URL.
7. Complete Data safety using `DATA_SAFETY_DRAFT.md`.
8. Complete App content:
   - Ads: No
   - App category: App
   - Target audience: business/internal users
   - News app: No
   - COVID/tracing: No
   - Financial features: only COD operational tracking, not consumer finance
9. Upload AAB to Internal testing.
10. Add testers by email list or Google Group.
11. Add release notes from `STORE_LISTING.md`.
12. Roll out to internal testing.
13. Install from Play testing link on at least two phones.

## Real-device Internal Test Cases

- Partner login works.
- Push token registers automatically.
- Partner receives order notification.
- Notification tap opens exact order detail.
- Orders refresh from system.
- Planned delivery date can be selected and edited within allowed range.
- Delivery/RTO is blocked until planned date exists.
- Call customer button starts configured masked call flow or safe fallback.
- Delivery OTP send/verify works.
- Delivery proof photo uploads.
- Failed/refused/cancelled proof photo uploads.
- COD summary and settlement submission works.
- Daily stock proof photo submission works.
- Admin login opens admin tabs.
- Admin sees orders and order detail.
- Admin sees stock photo logs.
- Admin can assign an order to a partner.
- Admin can approve/reject COD settlement.
- Location permission prompt appears and location logs update while app is open.

## Known Remaining Manual Items

- Publish privacy policy draft at a public URL.
- Capture 4-6 final Play screenshots after device authorization is restored.
- Confirm notification tap behavior manually on physical phone.
- Upload AAB in Play Console with account owner access.
