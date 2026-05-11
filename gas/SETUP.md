# Google Apps Script Setup

Use this for the current Dynamic Bazar order sheet.

## Script Properties

Set these in Apps Script: Project Settings -> Script Properties.

```text
DB_SHEET_ID=1ju3wdk_i-n9UHwXOcwJn6_ytw7Qj4_LbY4T0jq5Py2k
DB_ORDERS_SHEET=Sheet1
DB_PAYMENT_LOG_SHEET=PAYMENT LOG
DB_PROOF_FOLDER_ID=<Google Drive folder ID for delivery proof photos>
```

If your orders tab is not named `Sheet1`, change `DB_ORDERS_SHEET` to the exact tab name.
If `DB_PROOF_FOLDER_ID` is not set, proof photos are uploaded to the script owner's Drive root folder. Use a dedicated folder before real partner rollout.

## First-Time Authorization

After adding photo proof support, Apps Script needs new Google Drive permission. If the app shows an error like `You do not have permission to call DriveApp.getFolderById`, do this once:

1. Open the Apps Script editor.
2. Confirm `DB_PROOF_FOLDER_ID` is saved in Script Properties.
3. In the function dropdown, select `authorizeRequiredServices`.
4. Click **Run**.
5. Approve the Google permissions, including Drive access.
6. Deploy -> Manage deployments -> edit deployment -> Version: **New version** -> Deploy.

This authorization is required because delivery proof upload uses `DriveApp`.

## Current Header Row

```text
ORDER NUMBER, NAME, ADDRESS, PIN CODE, DISTRICT, WHATSAPP NUMBER, MOBILE NUMBER, PRODUCT, QUANTITY, AMOUNT, PAYMENT MODE, ORDER DATE, ORDER BY, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, GIVE TO PARTNER, SENT IN GROUP, DELIVERY DATE, REMARKS, PROCESSED, ORDER_COUNTED, DELIVERY_COUNTED, BILL LINK, REMARK2, PAYMENT DATE, RCVD AMOUNT
```

The default aliases in `DeliveryAppAPI.gs` now support this header row directly, so `DB_COLUMN_ALIASES_JSON` is optional for this sheet.

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
TIMESTAMP, SETTLEMENT ID, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, DISTRICT, SETTLEMENT AMOUNT, METHOD, REFERENCE, ASSIGNED COD, COLLECTED COD, REMAINING COD, COD ORDER COUNT, DELIVERED COD COUNT, PENDING COD COUNT, SOURCE
```

If old rows already exist without headers, the script inserts the header row above them.

## Delivery Proof Upload

`orders.deliver` accepts proof image fields from the mobile app:

```json
{
  "orderId": "DP240",
  "photoBase64": "<base64 image data>",
  "photoMimeType": "image/jpeg",
  "photoFileName": "delivery-proof-DP240.jpg"
}
```

The script uploads the image to `DB_PROOF_FOLDER_ID`, makes it viewable by link, and writes the Drive file URL to the configured delivery photo column.
If the orders sheet does not already have a `DELIVERY_PHOTO` column, the script creates it at the end of the header row on first successful proof upload.
