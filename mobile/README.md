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

- Partner login placeholder with secure local session storage.
- Native dashboard with COD and order KPIs.
- Orders list with pending, delivered, failed, and all tabs.
- Order search by order number, customer, area, product, or masked phone.
- Order detail screen.
- Masked-call placeholder action for Bonvoice integration.
- Delivery confirmation with customer OTP field and camera proof capture.
- Failed delivery/RTO reason submission.
- COD tracker and settlement submission.
- Persisted local status changes plus offline queue for delivery, failed, and settlement actions.
- GAS-ready API client using a single Web App endpoint.

## Backend

Starter Google Apps Script lives at:

```text
../gas/DeliveryAppAPI.gs
```

Deploy it as a Web App and set `DB_SHEET_ID` in Script Properties. The mobile client currently calls actions through POST JSON:

- `auth.demoLogin`
- `orders.byDistrict`
- `orders.deliver`
- `orders.fail`
- `cod.settle`

Recommended GAS Script Properties:

- `DB_SHEET_ID`: Google Sheet ID
- `DB_ORDERS_SHEET`: orders sheet name (default `Sheet1`)
- `DB_PAYMENT_LOG_SHEET`: settlement sheet name (default `PAYMENT LOG`)
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

Preview APK:

```bash
npx eas build --platform android --profile preview
```

Production AAB:

```bash
npx eas build --platform android --profile production
```
