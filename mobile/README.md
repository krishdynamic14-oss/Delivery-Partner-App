# Dynamic Bazar Delivery Mobile

React Native / Expo MVP for the Dynamic Bazar delivery partner Android app.

## Build Checklist

The implementation checklist lives in [`TODO.md`](./TODO.md). Keep it updated as the source of truth for what is done, pending, and intentionally out of scope.

## Run Locally

```bash
cd mobile
npm install
npm run android
```

For Expo Go or development server:

```bash
npm start
```

## Environment

Copy `.env.example` to `.env` and set:

```bash
EXPO_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

If the URL is not set, the app runs in demo mode with mock orders.

## Current MVP Coverage

- Team login with hidden admin/partner role mapping and secure local session storage.
- Admin dashboard and all-orders monitoring shell.
- Native dashboard with COD and order KPIs.
- Orders list with pending, delivered, failed, and all tabs.
- Order search by order number, customer, area, product, or masked phone.
- Order detail screen.
- Delivery confirmation with customer OTP field and camera proof capture.
- Failed delivery/RTO reason submission.
- COD tracker, UPI handover, payment screenshot proof, and settlement submission.
- Admin settlement approval/rejection with payment proof viewing.
- Admin quick order assignment to active delivery partners.
- Admin stock dispatch/update into Stock Master.
- Foreground partner live location upload with admin latest-location view and Google Maps handoff.
- Persisted local status changes plus offline queue for delivery, failed, and settlement actions.
- GAS-ready API client using a single Web App endpoint.

## Backend

Starter Google Apps Script lives at:

```text
../gas/DeliveryAppAPI.gs
```

Deploy it as a Web App and set `DB_SHEET_ID` in Script Properties. The mobile client currently calls actions through POST JSON:

- `auth.demoLogin`
- `orders.all`
- `orders.byDistrict`
- `orders.deliver`
- `orders.fail`
- `cod.settle`
- `cod.summary`
- `cod.settlements`
- `cod.approveSettlement`
- `admin.partners`
- `orders.assign`
- `location.update`
- `location.latest`
- `stock.master`
- `stock.dispatch`

Recommended GAS Script Properties:

- `DB_SHEET_ID`: Google Sheet ID
- `DB_ORDERS_SHEET`: orders sheet name (default `Sheet1`)
- `DB_PAYMENT_LOG_SHEET`: settlement sheet name (default `PAYMENT LOG`)
- `DB_DELIVERY_LOG_SHEET`: delivered-order audit sheet name (default `DELIVERY LOG`)
- `DB_STOCK_MASTER_SHEET`: stock dispatch sheet name (default `Stock Master`)
- `DB_DP_MASTER_SHEET`: delivery partner master sheet name (default `DP MASTER`)
- `DB_LOCATION_LOG_SHEET`: live location log sheet name (default `LOCATION LOG`)
- `DB_PROOF_FOLDER_ID`: Drive folder ID for delivery/payment proof uploads
- `DB_COLUMN_ALIASES_JSON`: optional JSON override for logical column aliases

Current project setup values are documented in `../gas/SETUP.md`.

Example `DB_COLUMN_ALIASES_JSON`:

```json
{
  "ORDER_NO": ["ORDER NO"],
  "CUSTOMER_NAME": ["CUSTOMER NAME"],
  "MOBILE": ["MOBILE"],
  "DISTRICT": ["DISTRICT"],
  "POSTMAN": ["POSTMAN"],
  "DELIVERY_COUNTED": ["DELIVERY_COUNTED"],
  "DELIVERY_DATE": ["DELIVERY DATE"],
  "PROCESSED": ["PROCESSED"],
  "REMARKS": ["REMARKS"]
}
```

Column mapping inspection action:

- `meta.columns` returns current sheet headers and resolved logical mapping.

## Build

Detailed APK build steps are in [`APK_BUILD.md`](./APK_BUILD.md).
Play Store internal testing release gates are in [`PLAY_STORE_RELEASE.md`](./PLAY_STORE_RELEASE.md).
Draft Play policy inputs are in [`PRIVACY_POLICY_DRAFT.md`](./PRIVACY_POLICY_DRAFT.md) and [`PLAY_DATA_SAFETY.md`](./PLAY_DATA_SAFETY.md).

Preview APK:

```bash
npm run build:apk
```

Production AAB:

```bash
npm run build:aab
```
