# Play Console Internal Testing Checklist

Last updated: 08-06-2026

## Build Files

- [x] AAB: `mobile/play-store/release/dynamic-bazar-delivery-v1.aab`
- [x] APK for side-load testing: `mobile/play-store/release/dynamic-bazar-delivery-v1.apk`
- [x] App icon: `mobile/play-store/graphics/app-icon-512.png`
- [x] Feature graphic: `mobile/play-store/graphics/feature-graphic-1024x500.png`
- [x] Phone screenshots: `mobile/play-store/screenshots/phone/`

## Pre-upload Checks Completed

- [x] `npm run typecheck` passed.
- [x] GAS syntax check passed.
- [x] Release APK built.
- [x] Release APK installed on connected Android device.
- [x] Production AAB built successfully.
- [x] App opened successfully on connected Android tablet.
- [x] Non-destructive screens tested: Home, Orders, COD, Profile.
- [x] Sanitized Play Store screenshots captured from connected Android tablet.
- [x] App package: `online.dynamicbazar.delivery`
- [x] Version: `1.0.0`
- [x] Version code: `1`

## Play Console Steps

1. [ ] Finish Play Console developer account payment and identity verification.
2. [ ] Open Google Play Console.
3. [ ] Create/select app: Dynamic Bazar Delivery.
4. [ ] Set default language: English.
5. [ ] Category: Business.
6. [ ] Add app access instructions for tester login credentials.
7. [ ] Add privacy policy URL.
8. [ ] Complete Data safety using `DATA_SAFETY_DRAFT.md`.
9. [ ] Complete App content:
   - Ads: No
   - App category: App
   - Target audience: business/internal users
   - News app: No
   - COVID/tracing: No
   - Financial features: only COD operational tracking, not consumer finance
10. [ ] Upload AAB to Internal testing.
11. [ ] Add testers by email list or Google Group.
12. [ ] Add release notes from `STORE_LISTING.md`.
13. [ ] Roll out to internal testing.
14. [ ] Install from Play testing link on at least two phones.

## Real-device Internal Test Cases

- [x] Partner login works on connected tablet.
- [x] Orders refresh from system.
- [x] Home, Orders, COD, and Profile screens render on connected tablet.
- [ ] Push token registers automatically.
- [ ] Partner receives order notification.
- [ ] Notification tap opens exact order detail.
- [ ] Planned delivery date can be selected and edited within allowed range.
- [ ] Delivery/RTO is blocked until planned date exists.
- [ ] Call customer button starts configured masked call flow or safe fallback.
- [ ] Delivery OTP send/verify works.
- [ ] Delivery proof photo uploads.
- [ ] Failed/refused/cancelled proof photo uploads.
- [ ] COD summary and settlement submission works.
- [ ] Daily stock proof photo submission works.
- [ ] Admin login opens admin tabs.
- [ ] Admin sees orders and order detail.
- [ ] Admin sees stock photo logs.
- [ ] Admin can assign an order to a partner.
- [ ] Admin can approve/reject COD settlement.
- [ ] Location permission prompt appears and location logs update while app is open.

## Known Remaining Manual Items

- [ ] Complete Play Console account payment and identity verification with matching legal details.
- [ ] Publish privacy policy draft at a public URL.
- [ ] Confirm reviewer/tester login credentials for Play Console App access.
- [ ] Upload AAB in Play Console with account owner access.
- [ ] Complete Data safety and App content forms in Play Console.
- [ ] Confirm notification tap behavior manually on physical phone.
- [ ] Run manual flows only on test orders: delivery OTP, delivered proof, failed proof, COD settlement, stock proof, admin approve/reject.
