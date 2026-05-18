# Play Console Data Safety Draft

Use this as the working draft when filling Google Play Data safety. Keep the final Play Console answers consistent with the app and privacy policy.

## Data Collected

- Personal info: partner/admin name and phone number for login, role mapping, order assignment, and support.
- App activity: order status changes, delivery attempts, sync timestamps, and pending/offline action status.
- Photos and videos: delivery proof photos, house/refused/cancel proof photos, payment proof screenshots.
- Audio files: customer call recording attachment only for cancelled parcel proof.
- Financial info: COD amount, payment received mode, UPI reference/UTR, settlement amount, settlement proof.
- Device or other IDs: Expo push token, platform, device name, app version for push notifications.
- Location-like delivery information: customer address, district, area, and pin code from order data.

## Purpose

- App functionality: delivery tracking, COD settlement, proof upload, stock/order notifications, offline sync.
- Account management: admin/partner role access and password reset requests.
- Fraud prevention and audit: delivery proof, call recording proof, settlement proof, delivery logs.

## Sharing

- Data is stored in Dynamic Bazar controlled Google Sheets, Google Drive, Firebase/Expo push services, and Apps Script.
- Customer bill/OTP WhatsApp messages are sent through configured WhatsApp provider when enabled.
- Do not declare advertising or analytics data sharing unless a future SDK is added.

## Security Practices

- Secrets are not bundled in git.
- App uses HTTPS requests to Apps Script and Expo/Firebase services.
- Session data is stored locally with secure storage.
- Admin/partner access is enforced by Apps Script token and partner scope checks.

## Notes Before Production

- Privacy policy URL must mention proof photos, call recordings, push tokens, order/customer delivery data, COD payment proof, and Google/Expo/Firebase/WhatsApp processors.
- If any analytics/ad SDK is added later, update this document and Play Console before release.
