# Dynamic Bazar Delivery App Audit And Launch Plan

Date: 2026-05-11  
Branch reviewed: `feature-react-native-mvp`  
GitHub remote: `https://github.com/krishdynamic14-oss/Delivery-Partner-App.git`  
Current remote sync: local branch matches `origin/feature-react-native-mvp` with `0` commits ahead and `0` behind.

## Executive Verdict

We are going in the planned direction.

The original repository started as a polished HTML/CSS/JavaScript prototype for a broader delivery management system with Admin, Postman, and Caller roles. The current React Native work correctly narrows the first Android MVP to the most important deployable workflow: delivery partners logging in, seeing assigned orders, confirming delivery or failure, tracking COD, and syncing with Google Sheets through Google Apps Script.

The app is not Play Store ready yet. It is a working MVP foundation with real Google Sheet reads and COD settlement writes already proven. The next serious work is not more visual prototyping; it is production hardening: reliable delivery/failed write verification, photo proof upload, offline sync visibility, real auth/session validation, Android device testing, and Play Console release preparation.

## What Was Reviewed

- Root HTML prototype files: `login.html`, `admin-dashboard.html`, `orders.html`, `delivery-flow.html`, `otp-confirm.html`, `settlement.html`, `postman-profile.html`, `caller-panel.html`, and supporting `app.css` / `app.js`.
- React Native Expo app under `mobile/`.
- Google Apps Script backend under `gas/DeliveryAppAPI.gs`.
- Setup documentation under `gas/SETUP.md`.
- Build checklist under `mobile/TODO.md`.
- Git branch history and remote alignment.
- Expo config and TypeScript health.

Verification commands run:

```bash
git fetch origin
git status --short --branch
git rev-list --left-right --count HEAD...origin/feature-react-native-mvp
npm run typecheck
npx expo config --type public
```

Result:

- TypeScript typecheck passed.
- Expo config loads and detects local `.env`.
- Android package is configured as `online.dynamicbazar.delivery`.
- EAS preview APK and production AAB profiles exist.
- Git branch is clean and aligned with GitHub.

## Original Prototype Assessment

The original HTML app is a strong visual and workflow reference. It covers a wider product than the first Android MVP:

- Admin dashboard
- Order management
- Assignment flow
- COD earnings
- Stock/inventory
- Live map mock
- Event logs
- Postman delivery flow
- OTP confirmation
- Cash settlement
- Postman profile
- Caller panel

This is useful as a product vision, but it should not all be rebuilt immediately in React Native. The current MVP plan wisely avoids copying everything and instead focuses on the delivery partner app first. That is the correct engineering choice because delivery partners are the people who need the Android app in the field.

## Current React Native App Assessment

The React Native app is built with:

- Expo SDK 54
- TypeScript
- React Navigation
- SecureStore for partner session
- AsyncStorage for cached orders and offline queue
- NetInfo for connectivity checks
- Expo Image Picker for camera proof foundation
- EAS build profiles

Current native screens:

- Login
- Dashboard
- Orders list
- Order detail
- Delivery confirmation
- Failed delivery / RTO
- COD tracker
- Profile / sync status

This matches the MVP screen plan well. The UI direction is also consistent with what we wanted: dark logistics-focused UI, orange/amber Dynamic Bazar brand color, glass-style panels, dense cards, and mobile-first field workflows.

## Backend Assessment

Google Apps Script currently supports:

- Partner login lookup from real Sheet data
- Orders by district
- Orders by district and partner
- Mark delivered
- Mark failed
- COD settlement log
- Column diagnostics
- Partner diagnostics

The column mapping now matches the real Sheet headers:

```text
ORDER NUMBER, NAME, ADDRESS, PIN CODE, DISTRICT, WHATSAPP NUMBER,
MOBILE NUMBER, PRODUCT, QUANTITY, AMOUNT, PAYMENT MODE, ORDER DATE,
ORDER BY, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, GIVE TO PARTNER,
SENT IN GROUP, DELIVERY DATE, REMARKS, PROCESSED, ORDER_COUNTED,
DELIVERY_COUNTED, BILL LINK, REMARK2, PAYMENT DATE, RCVD AMOUNT
```

Known verified real-data behavior:

- Real partner login worked for `7093996323`.
- Partner resolved as `GUNVANTBHAI`, district `MEHSANA`.
- The app fetched 3 assigned orders.
- COD totals matched the Sheet data.
- COD settlement wrote to `PAYMENT LOG`.

This is good progress. It proves that the Expo app, GAS endpoint, and Sheet can communicate correctly.

## Planned Versus Actual

| Area | Plan | Current State | Verdict |
| --- | --- | --- | --- |
| Preserve HTML prototype | Keep as reference | Preserved at repo root | On plan |
| Create Expo RN app | Build inside repo | App exists in `mobile/` | On plan |
| TypeScript/navigation/theme | Required | Implemented | On plan |
| Glass-style outstanding UI | Required | Strong first pass implemented | On plan, needs polish |
| Google Sheets/GAS backend | Required | Connected and partly verified | On plan |
| Real partner login | Required | Lookup by partner phone works | Partly done |
| Assigned orders | Required | Fetches by district and partner | Partly verified |
| Delivery confirmation | Required | UI and API path exist | Needs real Sheet test |
| Failed delivery/RTO | Required | UI and API path exist | Needs real Sheet test |
| COD tracker | Required | Built and real settlement verified | Good progress |
| Photo proof | Required | Camera capture exists | Upload/storage pending |
| Offline queue | Required | Foundation exists | Needs visible sync status and device test |
| Android build | Required | EAS profiles exist | APK/AAB not built yet |
| Play internal testing | Required | Not started | Pending |

## What Changed For Good

The project improved in the following important ways:

1. The app moved from static prototype to real React Native Android architecture.
2. The old HTML prototype is still safe and usable as design reference.
3. Real Google Sheet column names are mapped properly.
4. The app now uses the deployed GAS Web App through `.env`.
5. Login no longer blindly accepts any number when GAS is configured.
6. Partner order filtering now uses district plus partner name.
7. COD settlement writes partner, phone, district, assigned COD, collected COD, remaining COD, and counts to `PAYMENT LOG`.
8. Partner names and settlement log values are trimmed/cleaned.
9. Map navigation was added from order detail and delivery screens.
10. Delivery and failed submit flows now show synced/queued feedback instead of failing silently.
11. The TODO file now separates build completion from testing completion, which reduces confusion.

## What Is Working Properly Now

Working by code and verification:

- Expo project compiles with `npm run typecheck`.
- Expo config loads.
- App package name is configured.
- App can run in Expo Go / web preview based on previous testing.
- Real GAS endpoint is configured locally.
- Real partner login has been tested.
- Real assigned order fetch has been tested.
- COD tracker totals have been tested.
- COD settlement write has been tested.
- Offline queue foundation exists.
- Delivery/failed actions now queue when network or GAS fails.

Working by code but still needs real-device or Sheet verification:

- Delivery confirmation writes to Sheet.
- Failed/RTO writes to Sheet.
- Session persistence after restart.
- Offline reconnect auto-sync.
- Camera capture on Android device.

Not working yet / not built yet:

- Google Drive photo upload.
- Photo URL stored against order after upload.
- Real OTP verification.
- PIN login.
- Bonvoice masked call integration.
- Settlement history.
- Polished sync status component.
- Android APK/AAB build.
- Play Console internal testing.

## Important Risks

### 1. Apps Script Token Security Is Weak

Current token handling is enough for MVP testing, but not production. Tokens are predictable values like `partner-<phone>`. Before public rollout, GAS must validate sessions with a real token store, PIN/OTP login, or Firebase/Auth provider.

Recommended next step:

- Keep GAS for data first, but add a `SESSIONS` sheet or script properties cache for issued tokens.
- Expire sessions.
- Validate token phone/partner/district on every order update.

### 2. Delivery/Failed Writes Can Affect Real Orders

The write endpoints update real rows. This is expected, but risky during testing.

Recommended next step:

- Add a test order in Sheet1.
- Add confirmation UI that clearly shows order number and customer before final submit.
- Add duplicate-submit protection and server-side status checks.

### 3. Photo Proof Is Not Production-Ready

Camera capture exists, but the image currently remains local unless a URL is supplied. Play Store/internal testing can proceed without Drive upload only if photo proof is intentionally marked as a later phase. For the stated MVP, Drive upload is required.

Recommended next step:

- Add GAS endpoint for base64 photo upload to Drive.
- Add `DB_PROOF_FOLDER_ID` script property.
- Return photo URL.
- Store URL in `DELIVERY_PHOTO` or a supported sheet column.

### 4. Offline Queue Needs More Transparency

The app queues actions, but partners need to see exactly what is pending and whether retry succeeded.

Recommended next step:

- Add reusable `SyncStatusCard`.
- Show pending count, last sync time, last error, and manual retry.
- Keep failed queue items visible until resolved.

### 5. Play Store Assets Are Not Ready

EAS build profiles exist, but Play Store launch needs store assets, privacy policy, testing, and app content declarations.

Recommended next step:

- Create final 512x512 icon.
- Create 1024x500 feature graphic.
- Capture phone screenshots.
- Write privacy policy.
- Prepare Data safety answers.

## Play Store Requirements To Keep In Mind

Current Google Play target API policy says that from August 31, 2025, new apps and updates must target Android 15 / API 35 or higher. Source: https://support.google.com/googleplay/android-developer/answer/11926878

Google Play internal testing supports up to 100 internal testers and is recommended before broader tracks. Source: https://support.google.com/googleplay/android-developer/answer/9845334

Google Play Data safety requires developers to declare data collection/sharing and provide a privacy policy, even when limited data is collected. Source: https://support.google.com/googleplay/android-developer/answer/10787469

Expo EAS uses AAB by default for Play Store distribution, while APK is better for direct device/emulator testing. Source: https://docs.expo.dev/build-reference/apk

Our current setup is directionally compatible:

- `eas.json` has preview APK profile.
- `eas.json` has production AAB profile.
- Expo SDK 54 should be compatible with modern Android target requirements, but this must be confirmed during EAS build output before Play upload.

## Recommended Roadmap From Here

### Phase 1: Finish Real Delivery MVP

Goal: one partner can complete daily work safely.

Tasks:

- Add better final confirmation before delivered/failed submit.
- Test delivered update on a dummy Sheet order.
- Test failed/RTO update on a dummy Sheet order.
- Show Sheet-sync success clearly.
- Add per-action sync status card.
- Add last sync timestamp.
- Add manual retry result summary.

Exit criteria:

- Partner can login, view assigned orders, mark delivered, mark failed, settle COD, and see sync result.

### Phase 2: Photo Proof Upload

Goal: delivery proof is stored and traceable.

Tasks:

- Add Drive folder script property.
- Add GAS upload endpoint.
- Compress/capture photo in app.
- Upload proof image.
- Store proof URL against order.
- Show uploaded proof in order detail.

Exit criteria:

- Delivered order row contains a working proof URL.

### Phase 3: Authentication Hardening

Goal: app is not open to anyone who knows the endpoint.

Tasks:

- Add PIN or OTP login.
- Add session token generation.
- Add token expiry.
- Validate district and partner on every write.
- Reject partner writing another partner's order.

Exit criteria:

- Every API write is tied to a verified partner session.

### Phase 4: Android Testing

Goal: app is reliable on real delivery phones.

Tasks:

- Install Android Studio and one emulator.
- Test Expo Go on current phone.
- Build preview APK.
- Install APK on at least two phones.
- Test Android 8, Android 11, Android 13+ if possible.
- Test one low-end phone.
- Test poor network / offline queue.

Exit criteria:

- No blocking layout, sync, camera, or navigation failures on real devices.

### Phase 5: Play Internal Testing

Goal: real Play Store internal release.

Tasks:

- Create/verify Google Play Developer account.
- Confirm app package name before first upload.
- Build production AAB.
- Upload to internal testing.
- Add tester emails.
- Add privacy policy.
- Complete App content and Data safety.
- Add screenshots, icon, feature graphic.
- Install from Play internal test link.

Exit criteria:

- Internal testers can install from Play and complete one real order flow.

## Immediate Next Build Recommendation

Build `SyncStatusCard` next.

Why:

- It helps partners understand whether the app is online, synced, or pending.
- It supports delivery, failed, COD, and future photo upload workflows.
- It reduces confusion during real field testing.

Recommended UI content:

- Online/offline state.
- Pending queue count.
- Last sync time.
- Last sync result.
- Manual `Sync now` button.
- Error message if retry fails.

Recommended files to touch:

- `mobile/src/types.ts`
- `mobile/src/services/storage.ts`
- `mobile/src/services/offlineQueue.ts`
- `mobile/src/state/OrdersContext.tsx`
- `mobile/src/components/SyncStatusCard.tsx`
- `mobile/src/screens/DashboardScreen.tsx`
- `mobile/src/screens/ProfileScreen.tsx`
- `mobile/TODO.md`

## Should We Change The Direction?

No major direction change is needed.

We should continue with React Native + Expo + GAS/Google Sheets for the MVP. This is still the fastest route for the current business workflow. Firebase or a full database can come later if the Sheet becomes too slow, too risky, or too difficult to secure.

The main change in discipline should be this:

- Build one production slice at a time.
- Test each slice on real Android.
- Keep `mobile/TODO.md` updated.
- Do not expand into Admin/Caller/native inventory screens until delivery partner MVP is stable.

## Final Launch Readiness Checklist

Before Play internal testing:

- [ ] Delivered action verified against dummy Sheet order.
- [ ] Failed action verified against dummy Sheet order.
- [ ] COD settlement verified after latest GAS redeploy.
- [ ] Photo upload verified.
- [ ] Offline queue verified on real device.
- [ ] Session persists after app restart.
- [ ] Logout clears session.
- [ ] App handles bad GAS URL/network without crash.
- [ ] Preview APK built and installed.
- [ ] Production AAB built.
- [ ] Privacy policy created.
- [ ] Data safety form prepared.
- [ ] Store icon and feature graphic prepared.
- [ ] Screenshots captured.
- [ ] Internal testers added.

## Current Conclusion

The app is being built the way we wanted for the delivery partner MVP. It is not complete, but the architecture and direction are correct. The strongest parts are the native screen foundation, real Sheet mapping, partner order fetch, COD tracker, and settlement logging. The weakest parts are production auth, photo upload, sync visibility, and device-tested release readiness.

The next best move is to improve sync visibility and then finish photo proof upload. After that, the project should move into Android APK testing and Play internal testing.
