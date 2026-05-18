# Dynamic Bazar Mobile Build Checklist

This file is the working source of truth for the React Native Android MVP. Update it before or after every meaningful build slice so the implementation stays aligned with the app goal.

## Status Legend

- `[x]` Done and committed
- `[~]` Started but not production-ready
- `[ ]` Not started

## Build And Test Tracker

Use this table before marking anything fully complete. `Build` means the feature exists in code. `Test` means it has been verified in Expo web, Expo Go, emulator, or a real Android device as appropriate.

| Area | Build | Test | Verification Needed |
| --- | --- | --- | --- |
| Expo app scaffold | [x] | [x] | `npm run typecheck`, Expo config validation |
| GitHub feature branch | [x] | [x] | Branch pushed to origin |
| Expo web preview | [x] | [x] | `http://localhost:8083` returns app UI |
| Secure role-based session | [~] | [ ] | GAS validates admin/partner token shape and partner scope; restart app and real-device regression still needed |
| Dashboard KPIs | [x] | [ ] | Verify totals against mock and real data |
| Orders list tabs/search | [x] | [ ] | Search order/customer/area/product/phone |
| Order detail screen | [x] | [ ] | Open every order status without crash |
| Delivery confirmation UI | [x] | [x] | Real phone test confirmed delivery sync after Drive upload pause |
| Failed delivery UI | [x] | [~] | Reason validation, house proof required for refused/cancel, notes submit, failed state, sync/queued alert added |
| COD tracker UI | [x] | [x] | Summary and order-wise amounts match real MEHSANA orders |
| Doorstep UPI QR payment | [~] | [ ] | Configure `EXPO_PUBLIC_UPI_ID`, scan generated QR, verify Sheet payment columns |
| Offline queue foundation | [x] | [~] | Proof files are copied to app storage for queued retry and cleaned after sync/remove; reconnect sync still needs full device test |
| GAS API starter | [~] | [x] | `meta.columns` verified against deployed Web App |
| Real Google Sheets sync | [~] | [~] | Login, partner order fetch, and COD settlement write verified |
| Photo upload to Drive | [~] | [ ] | Shared proof-image compression and size guard added; verify Drive URL on Android |
| Hidden admin/partner login mapping | [~] | [ ] | Backend returns role from registered mobile; no visible admin selector |
| Admin dashboard shell | [x] | [ ] | Admin role opens hidden admin tabs, all-order monitoring, settlement approval, stock view/update, and quick assignment |
| Partner password login | [~] | [ ] | Password login added; real SMS OTP still needs provider if required later |
| Android preview APK | [ ] | [ ] | Build APK and install on phone |
| Play internal testing | [~] | [ ] | Release runbook, data-safety draft, privacy-policy draft added; upload AAB and complete internal test install |
| Core glass-style UI polish | [x] | [x] | Visual direction approved in preview; continue screen-by-screen polish |
| Multi-theme support | [~] | [ ] | Dark Orange, Light Clean, and High Contrast added; verify every screen on real Android |
| Push notification foundation | [~] | [x] | Expo/Firebase token registration and GAS push test working; internal-test auto registration still needs fresh install verification |
| Maps route handoff | [~] | [ ] | Android Google Maps/geo/browser fallback added; verify on delivery partner phones |
| Multi-UPI routing | [~] | [ ] | Comma-separated `EXPO_PUBLIC_UPI_IDS` supported; verify QR payments across all UPI IDs |
| Cancel call recording proof | [~] | [ ] | Cancelled parcel now requires attached call recording; verify upload link in Sheet/Drive |

## Product Goal

Build a production-ready Android operations app for Dynamic Bazar. Admin and delivery partners use the same login screen; the backend maps each registered mobile number to the correct role. Partners view assigned orders, confirm deliveries with OTP/photo/COD, record failed deliveries, track COD, work offline, and sync with Google Sheets through Google Apps Script.

## Current Foundation

- [x] GitHub branch: `feature-react-native-mvp`
- [x] Expo React Native + TypeScript app in `mobile/`
- [x] Existing HTML prototype preserved as UI reference
- [x] Expo web preview support for VS Code/browser viewing
- [x] EAS build profiles for preview APK and production AAB
- [x] Android package configured as `online.dynamicbazar.delivery`
- [x] Secure local session storage foundation
- [x] Cached orders and offline queue foundation
- [x] Starter GAS file in `gas/DeliveryAppAPI.gs`

## MVP Screens

- [x] Login placeholder screen
- [~] Hidden role mapping from one login screen
- [x] Admin dashboard shell
- [x] Admin all-orders monitoring screen
- [x] Admin quick order assignment from active partner list
- [x] Admin stock dispatch/update form backed by Stock Master
- [x] Dashboard with COD and order KPIs
- [x] Orders list with status tabs
- [x] Search by order number, customer, area, product, or masked phone
- [x] Order detail screen
- [x] Delivery confirmation screen with OTP field and photo proof
- [x] Failed delivery / RTO submission screen
- [x] COD tracker and settlement screen
- [x] Profile and sync status screen
- [~] Splash/session check screen with branded loading state
- [~] Password login screen
- [ ] OTP verification screen for partner login
- [ ] Notifications screen
- [ ] Daily report screen
- [ ] Bills/documents screen

## Backend And Data

- [~] GAS API starter action router
- [x] Confirm exact Google Sheet column names from real Sheet1
- [x] Update `DeliveryAppAPI.gs` mapping to real Sheet1 columns
- [x] Deploy GAS Web App
- [x] Document script property `DB_SHEET_ID`
- [x] Verify `meta.columns` resolves Sheet1 headers
- [x] Add admin partner list endpoint (`admin.partners`)
- [~] Add safe partner diagnostics endpoint (`meta.partners`)
- [~] Add script-property based column alias mapping (`DB_COLUMN_ALIASES_JSON`)
- [~] Add script-property based sheet names (`DB_ORDERS_SHEET`, `DB_PAYMENT_LOG_SHEET`)
- [ ] Configure `EXPO_PUBLIC_GAS_API_URL` in `mobile/.env`
- [~] Replace demo login with real partner lookup
- [~] Add token/session validation in GAS
- [~] Enforce district-level access in GAS
- [~] Fetch real assigned orders by district
- [~] Fetch all orders for hidden admin role
- [ ] Fetch single order detail from GAS
- [x] Assign order to delivery partner from admin app
- [x] Mark delivered in Sheet1
- [~] Mark failed/RTO in Sheet1
- [x] Write COD settlement to `PAYMENT LOG`
- [~] Upload delivery photo and store photo URL
- [ ] Return consistent API error codes/messages
- [~] Map raw backend/network failures to user-safe app messages

## Delivery Workflow

- [x] Local delivered status update
- [x] Local failed status update
- [x] Persist local status changes
- [x] Queue offline delivered/failed/settlement actions
- [~] Real customer delivery OTP validation
- [x] Photo compression before upload
- [~] Google Drive upload through GAS
- [ ] Delivery success receipt screen
- [~] Failed delivery reason dropdown
- [~] Refused/cancelled delivery requires house photo proof
- [~] Cancelled delivery requires customer call recording attachment
- [ ] Next-attempt date picker
- [x] Prevent duplicate submission during sync
- [~] Show sync conflict/error state per order

## COD Workflow

- [x] COD summary from local orders
- [x] COD order-wise breakdown
- [x] Settlement submission stub
- [x] Real settlement entry in Google Sheet
- [x] Delivery payment selector: Cash / UPI QR / Prepaid
- [x] UPI reference validation during delivery submit
- [~] Settlement history through admin pending/recent settlement list
- [ ] Outstanding COD warning if not settled by day end
- [x] Add partner, district, and COD breakdown to settlement payload/log

## Offline And Sync

- [x] Offline queue foundation
- [x] Queue count visible in profile/dashboard
- [x] Dedicated sync status component
- [x] Retry queue with visible per-action details and local remove/attach-proof controls
- [~] Store queued photo/call recording files safely until upload
- [~] Rebuild queued photo/call recording payloads from local URI on sync retry
- [~] Clean persisted proof files after successful sync or pending-action removal
- [~] Automatic sync on reconnect
- [x] Manual force sync action with result summary
- [x] Last sync timestamp

## Outstanding UI Direction

Create a premium, field-usable mobile UI. The app should feel like a polished logistics tool, not a rough admin form.

- [~] Build an outstanding dark mobile UI inspired by the current prototype
- [~] Use restrained glassmorphism/glass-door styling for hero cards, bottom bars, and priority panels
- [ ] Keep text readable in sunlight and on low-end Android screens
- [ ] Use orange/amber for Dynamic Bazar brand and COD emphasis
- [ ] Use green/red/blue only for clear operational states
- [ ] Avoid oversized marketing sections inside the app
- [~] Make order cards dense, scannable, and thumb-friendly
- [~] Add clear empty, loading, syncing, offline, success, and error states
- [ ] Add subtle motion for state changes without slowing field work
- [ ] Ensure every screen works at small Android sizes
- [x] Replace text-only tab icons with proper icon set
- [~] Add polished splash screen and adaptive app icon
- [ ] Add Gujarati/Hindi/English language-ready copy structure
- [~] Add selectable app themes: Dark Orange, Light Clean, High Contrast
- [ ] Verify theme contrast and text fit on all partner/admin screens
- [ ] Hide debug-only support UI before production launch

## Android And Deployment

- [ ] Install Android Studio and create one Android Virtual Device
- [ ] Verify `npm run android` opens emulator
- [ ] Test Expo Go preview on physical Android phone
- [ ] Add EAS project ID after first EAS setup
- [ ] Build preview APK
- [ ] Install APK on at least two Android phones
- [ ] Build production AAB
- [ ] Prepare Play Console internal testing release
- [~] Privacy policy URL
- [ ] App icon 512x512
- [ ] Feature graphic 1024x500
- [ ] Play Store screenshots
- [~] Data safety form
- [x] Configure Firebase FCM V1 service account key in Expo credentials
- [ ] Keep `google-services.json`, Firebase service-account JSON, `.env`, and APK files out of GitHub
- [ ] Confirm final APK uses the correct Firebase project and `google-services.json`
- [~] Play Store internal testing release runbook

## Testing Checklist

- [ ] Login/session persists after app restart
- [ ] Logout clears local session
- [ ] Partner sees only assigned district orders
- [ ] Search and tabs return expected orders
- [x] Delivered action updates UI, local cache, and Sheet1
- [~] Failed/refused action updates UI, local cache, and Sheet1 with proof rule
- [x] COD totals match Sheet data
- [ ] Offline delivery queues and syncs after reconnect
- [x] Photo capture works on real Android device
- [ ] Remote photo URL is stored against correct order
- [ ] Oversized proof image is blocked before upload with clear message
- [ ] Cancelled parcel call recording URL is stored against correct order
- [ ] App handles bad network without crashing
- [~] App handles GAS API errors clearly
- [ ] App works on Android 8, 11, 13+, and one low-end device
- [x] Push token reaches `PUSH TOKENS` sheet on real APK
- [x] Test push notification reaches phone after FCM V1 credentials upload
- [ ] Auto push registration works after fresh install/login without pressing debug button
- [ ] Admin device receives COD settlement and overdue alerts
- [ ] Partner device receives order assignment, stock, and deadline reminders
- [ ] Maps button opens Google Maps or browser fallback on partner device
- [ ] Theme selector persists after app restart

## Production Launch Cleanup

- [x] Hide partner-facing `Register Push Token` button
- [x] Remove token preview and raw Firebase/Expo error text from partner Profile
- [x] Keep push retry tools admin-only or debug-build-only
- [x] Replace technical notification errors with simple user-safe copy
- [ ] Confirm push registration runs automatically after login
- [ ] Remove any temporary debug/testing functions from production GAS if not needed
- [ ] Re-check `.gitignore` before pushing secrets/build files

## Build Order

1. UI polish pass for core MVP screens.
2. Confirm Google Sheet schema and update GAS mapping.
3. Deploy GAS and connect `.env`.
4. Replace demo data with real order sync.
5. Complete delivery/photo/COD write flows.
6. Harden offline queue and visible sync state.
7. Add password login now; add real OTP after SMS provider selection.
8. Test on real Android phone and emulator.
9. Build preview APK.
10. Prepare Play internal testing release.

## Do Not Drift

- Do not delete the existing HTML prototype.
- Do not add a new backend unless we explicitly decide to move away from Google Sheets/GAS.
- Do not build non-MVP admin-heavy features before partner delivery flow works end to end.
- Do not mark a feature done until it is tested in the app preview or on Android.
- Do not force-fix npm audit warnings unless the dependency impact is reviewed first.
