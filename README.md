# Dynamic Bazar — Delivery Partner App

A mobile-first delivery management web app for managing festive-season COD deliveries. Supports three roles: **Admin**, **Postman**, and **Caller**.

> Built with plain HTML, CSS, and Vanilla JS — no framework, no build step.

## React Native MVP

The React Native Android MVP has been started under `mobile/` on the `feature-react-native-mvp` branch. The existing HTML prototype remains in this repo as the design/reference implementation.

Native app status:
- Expo + TypeScript scaffold complete.
- Partner login placeholder with secure local session.
- Dashboard, orders, order detail, delivery confirmation, failed delivery, COD tracker, and profile screens added.
- Offline queue and cached orders foundation added.
- GAS-ready API client added with demo fallback data.
- Starter Google Apps Script API added under `gas/DeliveryAppAPI.gs`.

Run it:

```bash
cd mobile
npm install
npm run android
```

Connect Google Apps Script:

```bash
cp .env.example .env
# set EXPO_PUBLIC_GAS_API_URL to the deployed GAS Web App URL
```

---

## Live Preview

Open `login.html` in a browser, or serve with:
```bash
python -m http.server 8080
# then visit http://localhost:8080/login.html
```

---

## Roles & Entry Points

| Role | Entry Page | Purpose |
|------|-----------|---------|
| Admin | `admin-dashboard.html` | Oversee all deliveries, earnings, stock |
| Postman | `delivery-flow.html` | Manage daily deliveries, collect COD |
| Caller | `caller-panel.html` | Handle inbound customer calls |

---

## ✅ Completed

### Core Infrastructure
- [x] Shared design system — `app.css` (dark theme, CSS variables, all components)
- [x] Shared logic — `app.js` (auth, toast, drawer, bottom sheet, swipe gestures)
- [x] Login screen with role selector (Admin / Postman / Caller)
- [x] Session management via `localStorage` (login / logout)
- [x] Profile drawer with logout on all screens
- [x] Bottom navigation bar per role
- [x] Toast notification system (success / error / info + undo)

### Admin Screens
- [x] **Dashboard** (`admin-dashboard.html`) — KPI hero card, activity feed, quick actions, floating stock alert, WhatsApp tracking
- [x] **Orders** (`orders.html`) — order list with swipe-to-deliver / swipe-to-RTO, order detail bottom sheet with timeline
- [x] **Assign Orders** (`assign-orders.html`) — assign pending orders to postmen
- [x] **Earnings** (`earnings.html`) — COD KPIs, 7-day bar chart, monthly target, settlements table, top postmen
- [x] **Stock / Inventory** (`stock.html`) — low stock alerts, inventory forecast (days remaining), auto-reorder button
- [x] **Live Map** (`live-map.html`) — animated postmen dots, zone overlays, order clusters, live field team list
- [x] **Event Logs** (`event-logs.html`) — activity history timeline

### Postman Screens
- [x] **Delivery Flow** (`delivery-flow.html`) — 5-step progress tracker, delivery status selector, smart reschedule hint, photo proof capture
- [x] **OTP Confirm** (`otp-confirm.html`) — 6-digit keypad, OTP verification, animated success screen
- [x] **Cash Settlement** (`settlement.html`) — end-of-day COD handover, receipt breakdown, deposit method selector (Cash / UPI / Bank)
- [x] **Postman Profile** (`postman-profile.html`) — on-time % donut chart, earnings breakdown, 7-day chart, achievements / badges, today's activity timeline

### Caller Screens
- [x] **Caller Panel** (`caller-panel.html`) — live call timer, mute control, order info, customer history, smart hint (preferred delivery time), reschedule, call remarks

---

## 🔲 To Do

### Features
- [ ] **Push Notifications** — alert admin when a postman is delayed or RTO threshold exceeded
- [ ] **Search & Filter** — search orders by name, phone, or order ID across all order lists
- [ ] **Bulk Assign** — select multiple orders and assign to a postman in one tap
- [ ] **Customer Feedback Screen** — post-delivery rating collection (1–5 stars + remarks)
- [ ] **Expense Tracker** — postman submits daily fuel/misc expenses with photo proof
- [ ] **Zone Manager Screen** — admin reassigns zones, views zone-wise delivery density
- [ ] **RTO Flow** — dedicated RTO screen: reason selection, photo of returned package, auto-deduct from COD
- [ ] **Salary / Payout Screen** — admin marks postman payout as done, postman sees monthly salary breakdown
- [ ] **Attendance Screen** — postman check-in / check-out with timestamp and location

### Backend / Data
- [ ] **Real API integration** — replace static dummy data with live backend (Node/Firebase/Supabase)
- [ ] **Google Sheets sync** — two-way sync for orders and settlements (Sheets API)
- [ ] **WhatsApp Business API** — real tracking message dispatch via Twilio / WABA
- [ ] **Real OTP** — SMS OTP via Twilio or MSG91 instead of hardcoded demo OTP
- [ ] **Authentication** — replace localStorage with JWT / Firebase Auth
- [ ] **Real GPS tracking** — replace animated fake dots with live GPS postman positions

### UI / Polish
- [ ] **Dark/Light mode toggle**
- [ ] **Onboarding screens** — first-time walkthrough for new postmen
- [ ] **Offline mode** — service worker to cache orders for areas with no signal
- [ ] **PWA manifest** — installable as home-screen app on Android/iOS

---

## File Structure

```
dynamic-bazar-app/
├── app.css               # Full design system (tokens, layout, components)
├── app.js                # Shared JS (auth, toast, drawer, sheet, swipe)
├── index.html            # Redirect to login
├── login.html            # Role-based login
│
├── admin-dashboard.html  # Admin home
├── orders.html           # Order management
├── assign-orders.html    # Order assignment
├── earnings.html         # COD & earnings dashboard
├── stock.html            # Inventory management
├── live-map.html         # Live postmen map
├── event-logs.html       # Activity log
│
├── delivery-flow.html    # Postman delivery screen
├── otp-confirm.html      # OTP verification
├── settlement.html       # Cash handover
├── postman-profile.html  # Postman stats & achievements
│
└── caller-panel.html     # Caller support screen
```

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--orange` | `#ff6b00` | Primary CTA, highlights |
| `--amber` | `#ffb347` | COD amounts, warnings |
| `--green` | `#00c896` | Success, delivered |
| `--red` | `#ff4b6e` | Error, RTO, critical |
| `--blue` | `#4e9cff` | Info, caller role |
| `--bg` | `#08080f` | Page background |
| `--muted` | `#7070a0` | Secondary text |

Fonts: **Plus Jakarta Sans** (headings) + **Inter** (body)  
Icons: **Google Material Symbols Rounded**
