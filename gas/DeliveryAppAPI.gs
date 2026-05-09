const SHEET_ID = PropertiesService.getScriptProperties().getProperty('DB_SHEET_ID');

function doPost(e) {
  try {
    const input = JSON.parse(e.postData.contents || '{}');
    const action = input.action;
    const body = input.body || {};
    const token = getBearerToken_(e);

    const routes = {
      'auth.demoLogin': () => demoLogin_(body),
      'orders.byDistrict': () => getOrdersByDistrict_(body.district, token),
      'orders.deliver': () => markOrderDelivered_(body, token),
      'orders.fail': () => markOrderFailed_(body, token),
      'cod.settle': () => submitCodSettlement_(body, token),
    };

    if (!routes[action]) return json_({ ok: false, error: 'Unknown action: ' + action });
    return json_({ ok: true, data: routes[action]() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function demoLogin_(body) {
  return {
    id: 'partner_ahmedabad',
    name: 'SURESHBHAI',
    phone: body.phone,
    district: 'AHMEDABAD',
    role: 'partner',
    token: 'demo-token',
  };
}

function getOrdersByDistrict_(district, token) {
  assertToken_(token);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values
    .map((row) => rowToOrder_(headers, row))
    .filter((order) => String(order.district).toUpperCase() === String(district).toUpperCase());
}

function markOrderDelivered_(body, token) {
  assertToken_(token);
  updateOrderRow_(body.orderId, {
    DELIVERY_COUNTED: 'DONE',
    'DELIVERY DATE': Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy'),
    PROCESSED: 'DONE',
    DELIVERY_PHOTO: body.photoUri || body.photoUrl || '',
  });
  return { updated: true };
}

function markOrderFailed_(body, token) {
  assertToken_(token);
  updateOrderRow_(body.orderId, {
    REMARKS: 'FAILED: ' + body.reason + (body.notes ? ' | ' + body.notes : ''),
  });
  return { updated: true };
}

function submitCodSettlement_(body, token) {
  assertToken_(token);
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('PAYMENT LOG') || ss.insertSheet('PAYMENT LOG');
  const settlementId = 'SET-' + Date.now();
  sheet.appendRow([new Date(), settlementId, body.amount, body.method, body.reference || '']);
  return { settlementId: settlementId };
}

function updateOrderRow_(orderId, updates) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const orderCol = headers.indexOf('ORDER NO') + 1;
  if (!orderCol) throw new Error('ORDER NO column missing');

  for (let r = 2; r <= values.length; r++) {
    if (String(sheet.getRange(r, orderCol).getValue()).replace('#', '') === String(orderId).replace('#', '')) {
      Object.keys(updates).forEach((key) => {
        const col = headers.indexOf(key) + 1;
        if (col) sheet.getRange(r, col).setValue(updates[key]);
      });
      return;
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function rowToOrder_(headers, row) {
  const get = (name) => row[headers.indexOf(name)];
  const orderNo = String(get('ORDER NO') || get('ORDER') || '');
  const status = String(get('DELIVERY_COUNTED') || '').toUpperCase() === 'DONE'
    ? 'delivered'
    : String(get('REMARKS') || '').indexOf('FAILED:') === 0
      ? 'failed'
      : 'pending';
  return {
    id: orderNo.replace('#', ''),
    orderNo: orderNo.replace('#', ''),
    customerName: String(get('CUSTOMER NAME') || get('NAME') || ''),
    phoneMasked: maskPhone_(String(get('MOBILE') || get('PHONE') || '')),
    address: String(get('ADDRESS') || ''),
    area: String(get('AREA') || get('CITY') || ''),
    district: String(get('DISTRICT') || ''),
    product: String(get('PRODUCT') || ''),
    quantity: Number(get('QTY') || 1),
    amount: Number(get('AMOUNT') || get('COD') || 0),
    paymentType: Number(get('AMOUNT') || get('COD') || 0) > 0 ? 'COD' : 'Prepaid',
    status: status,
    attempts: Number(get('ATTEMPT') || 1),
    assignedTo: String(get('POSTMAN') || ''),
    updatedAt: new Date().toISOString(),
    remarks: String(get('REMARKS') || ''),
  };
}

function assertToken_(token) {
  if (!token) throw new Error('Missing token');
}

function getBearerToken_(e) {
  const header = (e.parameter && e.parameter.authorization) || '';
  return String(header).replace('Bearer ', '') || 'demo-token';
}

function maskPhone_(phone) {
  return phone.length >= 4 ? 'XXXXXX' + phone.slice(-4) : phone;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
