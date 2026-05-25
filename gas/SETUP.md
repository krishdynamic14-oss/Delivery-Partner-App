# Google Apps Script Setup

Use this for the current Dynamic Bazar order sheet.

## Script Properties

Set these in Apps Script: Project Settings -> Script Properties.

```text
DB_SHEET_ID=1ju3wdk_i-n9UHwXOcwJn6_ytw7Qj4_LbY4T0jq5Py2k
DB_ORDERS_SHEET=Sheet1
DB_PAYMENT_LOG_SHEET=PAYMENT LOG
DB_DELIVERY_LOG_SHEET=DELIVERY LOG
DB_STOCK_MASTER_SHEET=Stock Master
DB_DP_MASTER_SHEET=DP MASTER
DB_PASSWORD_RESET_SHEET=PASSWORD RESET
DB_LOCATION_LOG_SHEET=LOCATION LOG
DB_PROOF_FOLDER_ID=<optional Google Drive folder ID for delivery proof photos>
DB_BILL_TEMPLATE_ID=<Google Slides bill template ID>
DB_BILL_FOLDER_ID=<Google Drive folder ID for bill PDFs>
DB_AISENSY_API_KEY=<AiSensy API key>
DB_AISENSY_CAMPAIGN_NAME=BILL2
DB_AISENSY_DELIVERY_OTP_CAMPAIGN_NAME=OTP
DB_AISENSY_API_URL=https://backend.aisensy.com/campaign/t1/api/v2
DB_ADMIN_PHONES=9876543210,9123456780
DB_ADMIN_PASSWORD=<fallback admin password>
DB_ADMIN_CREDENTIALS_JSON=[{"phone":"9876543210","password":"secret"}]
```

If your orders tab is not named `Sheet1`, change `DB_ORDERS_SHEET` to the exact tab name.
If your stock or delivery partner tabs use different names, change `DB_STOCK_MASTER_SHEET` and `DB_DP_MASTER_SHEET`.
`DB_PROOF_FOLDER_ID` is needed for Drive proof upload. Delivery and failed-delivery photo proofs are uploaded to this folder.
`DB_BILL_TEMPLATE_ID` is the Google Slides bill template. `DB_BILL_FOLDER_ID` is where generated bill PDFs are saved.
`DB_AISENSY_API_KEY` enables bill WhatsApp sending. `DB_AISENSY_CAMPAIGN_NAME` should be `BILL2` for the current template.
`DB_AISENSY_DELIVERY_OTP_CAMPAIGN_NAME` should be `OTP` for the customer delivery confirmation message.
`DB_ADMIN_PHONES` is a comma-separated hidden admin allowlist. The mobile app does not show an admin login option; admin role is returned only when the entered mobile number matches this list.
Admin login now requires password. Use either global `DB_ADMIN_PASSWORD`, or per-admin `DB_ADMIN_CREDENTIALS_JSON`.

## Live Location

Partner devices submit foreground GPS location through the mobile app action `location.update`. Admin devices read the latest location per partner through `location.latest`.

The script creates `LOCATION LOG` automatically unless you override it with `DB_LOCATION_LOG_SHEET`. Columns are:

```text
TIMESTAMP, USER ID, ROLE, PHONE, PARTNER NAME, DISTRICT, LATITUDE, LONGITUDE, ACCURACY, SPEED, HEADING, APP VERSION, SOURCE
```

The app only tracks while the partner is signed in and the app is open. Android location permission must be accepted on the partner phone, and the APK must be rebuilt after adding the location permission.

## Stock Master Sheet

The admin Stock tab reads and can append dispatch rows to `Stock Master`. This sheet is treated as stock sent to delivery partners or locations.

Your existing compact layout is supported and recommended if the sheet already uses dropdowns/formulas in A-D:

```text
PRODUCT, QUANTITY, DATE, LOCATION
```

Optional columns can be added after these if you want partner-level dispatch tracking:

```text
SKU, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, DISTRICT, NOTES
```

Flexible aliases are supported, for example `PRODUCT NAME`, `ITEM`, `QTY`, `QTY SENT`, `STOCK SENT`, `DISTRICT`, and `AREA`.

Admin app action:

- `stock.master` reads current inventory summary.
- `stock.dispatch` appends a new stock dispatch row using the existing header order. If `Stock Master` is empty, the script creates `PRODUCT, QUANTITY, DATE, LOCATION`; it does not rewrite an existing stock sheet layout.

Stock calculation:

- `sentQty` comes from the stock quantity column.
- If `Stock Master` has no partner column, stock is matched by `PRODUCT + LOCATION/DISTRICT`.
- `deliveredQty`, `pendingQty`, and `failedQty` come from the orders sheet, matched by product + district/location.
- `remainingQty = sentQty - deliveredQty`.

## DP MASTER Sheet

Partner login, admin partner list, and quick order assignment prefer `DP MASTER`. Only delivery partners listed here should be able to login as partners.

Your current supported header names:

```text
DISTRICT, PARTNER NAME, MOBILE NUMBER, STATUS
```

Flexible aliases are also supported, for example `DELIVERY PARTNER NAME`, `POSTMAN`, `DP NAME`, `PHONE`, and `ASSIGNED DISTRICT`.

Add this login credential column:

```text
PASSWORD
```

Supported aliases include `APP PASSWORD` and `LOGIN PASSWORD`.

If `STATUS` contains `CANCEL`, `INACTIVE`, `REMOVED`, or `NO`, that mobile number is blocked from partner login.

Admin app action:

- `admin.partners` returns active partner names, full phone numbers, districts, status, and current order counts for admin-only assignment/update flows.
- `orders.assign` writes `DELIVERY PARTNER NAME`, `DELIVERY PARTNER NUMBER`, `DISTRICT` if provided, and `GIVE TO PARTNER=DONE` on the selected order.

## Password Reset

The login screen has **Forgot password?**. This does not reset automatically. It writes a row to `PASSWORD RESET` with:

```text
TIMESTAMP, PHONE, NAME, STATUS, ROLE, DISTRICT, NOTES
```

Admin should update the partner's `PASSWORD` in `DP MASTER`, then mark the request row `DONE`.

## Bill Generator

Bills are generated from a Google Slides template and saved as PDFs in Drive.

Required template placeholders:

```text
{{BILL NUMBER}}, {{DATE}}, {{NAME}}, {{P. MODE}}, {{ITEM}}, {{QTY}}, {{AMT1}}
```

Auto trigger behavior:

- When the app marks delivery `DONE`, the backend generates the bill automatically.
- If editing the sheet manually, fill `DELIVERY DATE` or set `DELIVERY_COUNTED` to `DONE`.
- Script creates bill PDF.
- PDF link is written to `BILL LINK`.
- If `DB_AISENSY_API_KEY` is configured, the bill PDF is sent to the customer on WhatsApp through AiSensy campaign `BILL2`.
- AiSensy template variable `{{1}}` receives the order `PRODUCT`.
- WhatsApp send status is written to `BILL WHATSAPP STATUS` and response/error to `BILL WHATSAPP RESPONSE`.
- Existing Drive bill links are not overwritten.
- Existing `BILL WHATSAPP STATUS=SENT` rows are not sent again.

Setup:

1. Set `DB_BILL_TEMPLATE_ID`.
2. Set `DB_BILL_FOLDER_ID`.
3. Set `DB_AISENSY_API_KEY`.
4. Confirm OAuth scopes include `spreadsheets`, `drive`, `presentations`, `script.scriptapp`, and `script.external_request`.
5. Run `setupBillTrigger` once from Apps Script editor.
6. Approve permissions.
7. Deploy a new Web App version.

## Delivery OTP

Delivery confirmation OTP is order-level and does not expire. The same OTP is reused if the customer message is resent.

AiSensy campaign:

```text
OTP
```

Template variable mapping:

```text
{{1}} = DELIVERY PARTNER NAME
{{2}} = DELIVERY PARTNER NUMBER
{{3}} = PRODUCT
{{4}} = AMOUNT
{{5}} = DELIVERY OTP
```

Columns are created automatically when needed:

```text
DELIVERY OTP
DELIVERY OTP SENT STATUS
DELIVERY OTP SENT RESPONSE
DELIVERY OTP VERIFIED
```

Flow:

- Partner taps **Send OTP to Customer** in the delivery screen.
- Script generates a 6-digit OTP if the order does not already have one.
- Script sends campaign `OTP` through AiSensy.
- Partner enters the OTP given by customer.
- `orders.deliver` verifies OTP before marking delivery `DONE`.

## Doorstep Payment QR

The mobile app can show a dynamic UPI QR on the delivery screen. Configure these in `mobile/.env`:

```text
EXPO_PUBLIC_UPI_ID=yourupi@bank
EXPO_PUBLIC_UPI_NAME=Dynamic Bazar
```

Delivery partner can choose:

```text
Cash
UPI QR
Prepaid
```

For `UPI QR`, the app shows a QR with the order amount and requires a UPI reference/UTR before delivery submit.

The backend writes these columns automatically when delivery is confirmed:

```text
PAYMENT RECEIVED MODE
PAYMENT RECEIVED REF
PAYMENT RECEIVED AMOUNT
PAYMENT RECEIVED AT
```

It also fills existing `RCVD AMOUNT` if available.

## Delivery Log Sheet

After successful delivery, the script appends a final snapshot row to:

```text
DELIVERY LOG
```

Override name if needed:

```text
DB_DELIVERY_LOG_SHEET=DELIVERY LOG
```

Columns are created automatically:

```text
TIMESTAMP, ORDER NO, CUSTOMER NAME, MOBILE NUMBER, WHATSAPP NUMBER, ADDRESS, PIN CODE, DISTRICT, PRODUCT, QUANTITY, ORDER AMOUNT, ORDER PAYMENT MODE, PAYMENT RECEIVED MODE, PAYMENT RECEIVED AMOUNT, PAYMENT RECEIVED REF, DELIVERY DATE, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, DELIVERY STATUS, DELIVERY OTP, DELIVERY OTP VERIFIED, DELIVERY PHOTO, BILL LINK, BILL WHATSAPP STATUS, REMARKS, SOURCE
```

The log is append-only and skips duplicate delivered log rows for the same order number.

## Drive Authorization

Drive is required for proof photos and bill PDFs.

1. Open the Apps Script editor.
2. Click Project Settings and enable **Show "appsscript.json" manifest file in editor**.
3. Open `appsscript.json`.
4. Add these OAuth scopes. You can copy the full example from `gas/appsscript.example.json` in this repo:

```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/script.scriptapp",
  "https://www.googleapis.com/auth/script.external_request"
]
```

5. Confirm `DB_PROOF_FOLDER_ID` is saved in Script Properties.
6. In the function dropdown, select `authorizeRequiredServices`.
7. Click **Run**.
8. Approve the Google permissions, including Drive access.
9. Deploy -> Manage deployments -> edit deployment -> Version: **New version** -> Deploy.

When deploying the Web App, use:

- **Execute as**: Me
- **Who has access**: Anyone

This authorization is required only for the optional Drive proof upload path.

## Current Header Row

```text
ORDER NUMBER, NAME, ADDRESS, PIN CODE, DISTRICT, WHATSAPP NUMBER, MOBILE NUMBER, PRODUCT, QUANTITY, AMOUNT, PAYMENT MODE, ORDER DATE, ORDER BY, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, GIVE TO PARTNER, SENT IN GROUP, DELIVERY DATE, REMARKS, PROCESSED, ORDER_COUNTED, DELIVERY_COUNTED, BILL LINK, REMARK2, PAYMENT DATE, RCVD AMOUNT
```

The default aliases in `DeliveryAppAPI.gs` now support this header row directly, so `DB_COLUMN_ALIASES_JSON` is optional for this sheet.

## Bonvoice Masked Calling

Partner app does not expose the full customer mobile number. The **Call via Masked Number** button calls Apps Script action `calls.startMaskedCall`, which starts a Bonvoice Click2Call bridge:

- Leg A: delivery partner number
- Leg B: customer number
- Caller ID for both legs: configured DID number
- Audit sheet: `CALL LOG`

Required Script Properties:

```text
DB_BONVOICE_AUTH_TOKEN = your Bonvoice token without "Token " prefix
DB_BONVOICE_DID_NUMBER = your DID / masked caller ID number
```

Optional Script Properties:

```text
DB_BONVOICE_API_URL = https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/
DB_BONVOICE_LEG_A_CHANNEL_ID = 1
DB_BONVOICE_LEG_B_CHANNEL_ID = 1
DB_BONVOICE_DIAL_ATTEMPTS = 1
DB_BONVOICE_NUMBER_FORMAT = 91
DB_CALL_LOG_SHEET = CALL LOG
DB_BONVOICE_FALLBACK_NUMBER = admin/fallback number for inbound dynamic routing
```

`DB_BONVOICE_NUMBER_FORMAT` controls the phone format sent to Bonvoice Click2Call:

- `91` sends `919876543210` and is the default.
- `10` sends `9876543210`.
- `0` sends `09876543210`.
- `+91` sends `+919876543210`.

Bonvoice callback/log endpoint can point to the same Apps Script Web App URL. The script accepts both JSON and x-www-form-urlencoded call log payloads and writes them to `CALL LOG`.

Dynamic routing for inbound DID calls is also supported. Bonvoice can POST:

```json
{
  "did": "8037281733",
  "from": "9567855562"
}
```

The response shape is:

```json
{
  "status": "1",
  "destination": "9846098460"
}
```

## Smoke Test

After deploying the Apps Script Web App, call the mobile client action:

```json
{
  "action": "meta.columns",
  "body": {},
  "__token": "demo-token"
}
```

Expected result:

- `ok` is `true`
- `headers` includes the real header row
- `resolved.ORDER_NO` is `ORDER NUMBER`
- `resolved.POSTMAN` is `DELIVERY PARTNER NAME`
- `resolved.MOBILE` is `MOBILE NUMBER`

Diagnostics action:

- `meta.partners` returns delivery partner name, masked number, district, and assigned order count.

## Payment Log Columns

`cod.settle` now creates a header row automatically in `PAYMENT LOG`:

```text
TIMESTAMP, SETTLEMENT ID, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, DISTRICT, SETTLEMENT AMOUNT, METHOD, REFERENCE, PAYMENT PROOF, ASSIGNED COD, COLLECTED COD, COMMISSION AMOUNT, PAYABLE AMOUNT, REMAINING COD, COD ORDER COUNT, DELIVERED COD COUNT, PENDING COD COUNT, SOURCE, STATUS, REQUESTED AMOUNT, APPROVED AMOUNT, APPROVED BY, APPROVED AT, ADMIN NOTES
```

If old rows already exist without headers, the script inserts the header row above them.

Settlement flow:

- Partner opens the UPI app from COD Tracker, completes payment, attaches a payment screenshot, and submits proof.
- `cod.settle` uploads the payment screenshot to Drive and writes a `PENDING` settlement request.
- Admin opens the Earnings tab, views the payment screenshot, and approves or rejects through `cod.approveSettlement`.
- Approved settlements reduce future Pay to Company / cash-in-hand calculations.

## Delivery Proof Upload

Current behavior:

- Delivery and failed-delivery screens capture proof photos.
- When `uploadProof: true` and `photoBase64` are sent, Apps Script uploads the image to Drive and writes the Drive URL to the configured proof/photo column.
- COD settlement proof uses the same Drive folder through `cod.settle`.

`orders.deliver`, `orders.fail`, and `cod.settle` can accept proof image fields:

```json
{
  "orderId": "DP240",
  "uploadProof": true,
  "photoBase64": "<base64 image data>",
  "photoMimeType": "image/jpeg",
  "photoFileName": "delivery-proof-DP240.jpg"
}
```

The script uploads the image to `DB_PROOF_FOLDER_ID` if configured, otherwise the script root Drive folder, makes it viewable by link, and writes the Drive file URL to the configured delivery/payment proof column.
If the orders sheet does not already have a `DELIVERY_PHOTO` column, the script creates it at the end of the header row on first successful proof upload.
