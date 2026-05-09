# Google Apps Script Setup

Use this for the current Dynamic Bazar order sheet.

## Script Properties

Set these in Apps Script: Project Settings -> Script Properties.

```text
DB_SHEET_ID=1ju3wdk_i-n9UHwXOcwJn6_ytw7Qj4_LbY4T0jq5Py2k
DB_ORDERS_SHEET=Sheet1
DB_PAYMENT_LOG_SHEET=PAYMENT LOG
```

If your orders tab is not named `Sheet1`, change `DB_ORDERS_SHEET` to the exact tab name.

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

## Payment Log Columns

`cod.settle` now creates a header row automatically in `PAYMENT LOG`:

```text
TIMESTAMP, SETTLEMENT ID, DELIVERY PARTNER NAME, DELIVERY PARTNER NUMBER, DISTRICT, SETTLEMENT AMOUNT, METHOD, REFERENCE, ASSIGNED COD, COLLECTED COD, REMAINING COD, COD ORDER COUNT, DELIVERED COD COUNT, PENDING COD COUNT, SOURCE
```

If old rows already exist without headers, the script inserts the header row above them.
