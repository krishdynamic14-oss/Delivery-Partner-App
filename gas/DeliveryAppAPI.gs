const SHEET_ID = PropertiesService.getScriptProperties().getProperty('DB_SHEET_ID');
const ORDERS_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_ORDERS_SHEET') || 'Sheet1';
const PAYMENT_LOG_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_PAYMENT_LOG_SHEET') || 'PAYMENT LOG';

const DEFAULT_COLUMN_ALIASES = {
  ORDER_NO: ['ORDER NO', 'ORDER', 'ORDER_NO', 'ORDER NUMBER'],
  CUSTOMER_NAME: ['CUSTOMER NAME', 'NAME', 'CUSTOMER'],
  MOBILE: ['MOBILE NUMBER', 'MOBILE', 'PHONE', 'PHONE NO', 'CUSTOMER MOBILE'],
  WHATSAPP: ['WHATSAPP NUMBER', 'WHATSAPP', 'WA NUMBER'],
  ADDRESS: ['ADDRESS', 'FULL ADDRESS'],
  AREA: ['AREA', 'CITY', 'LOCALITY'],
  PIN_CODE: ['PIN CODE', 'PIN', 'PINCODE'],
  DISTRICT: ['DISTRICT'],
  PRODUCT: ['PRODUCT', 'PRODUCT NAME', 'ITEM'],
  QTY: ['QUANTITY', 'QTY'],
  AMOUNT: ['AMOUNT', 'COD', 'TOTAL AMOUNT'],
  PAYMENT_MODE: ['PAYMENT MODE', 'PAYMENT TYPE'],
  ORDER_DATE: ['ORDER DATE'],
  ORDER_BY: ['ORDER BY'],
  ATTEMPT: ['ATTEMPT', 'ATTEMPTS'],
  POSTMAN: ['DELIVERY PARTNER NAME', 'POSTMAN', 'PARTNER', 'DELIVERY PARTNER'],
  POSTMAN_NUMBER: ['DELIVERY PARTNER NUMBER', 'PARTNER NUMBER', 'POSTMAN NUMBER'],
  GIVE_TO_PARTNER: ['GIVE TO PARTNER'],
  SENT_IN_GROUP: ['SENT IN GROUP'],
  REMARKS: ['REMARKS', 'NOTE', 'NOTES'],
  REMARK2: ['REMARK2', 'REMARK 2'],
  ORDER_COUNTED: ['ORDER_COUNTED', 'ORDER COUNTED'],
  DELIVERY_COUNTED: ['DELIVERY_COUNTED', 'DELIVERY COUNTED', 'DELIVERY STATUS'],
  DELIVERY_DATE: ['DELIVERY DATE', 'DELIVERY_DATE'],
  PROCESSED: ['PROCESSED'],
  BILL_LINK: ['BILL LINK'],
  PAYMENT_DATE: ['PAYMENT DATE'],
  RCVD_AMOUNT: ['RCVD AMOUNT', 'RECEIVED AMOUNT'],
  DELIVERY_PHOTO: ['DELIVERY_PHOTO', 'DELIVERY PHOTO', 'PHOTO URL'],
};

function doPost(e) {
  try {
    const input = JSON.parse(e.postData.contents || '{}');
    const action = input.action;
    const body = input.body || {};
    const token = getToken_(e, input);

    const routes = {
      'auth.demoLogin': () => demoLogin_(body),
      'orders.byDistrict': () => getOrdersByDistrict_(body.district, token),
      'orders.byDistrictAndPartner': () => getOrdersByDistrictAndPartner_(body.district, body.partnerName, token),
      'orders.deliver': () => markOrderDelivered_(body, token),
      'orders.fail': () => markOrderFailed_(body, token),
      'cod.settle': () => submitCodSettlement_(body, token),
      'meta.columns': () => inspectColumns_(),
    };

    if (!routes[action]) return json_({ ok: false, error: 'Unknown action: ' + action });
    return json_({ ok: true, data: routes[action]() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function demoLogin_(body) {
  const partner = findPartnerByPhone_(body.phone);
  if (partner) return partner;
  if (SHEET_ID) throw new Error('Partner not found for this mobile number');
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
  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  return values
    .map((row) => rowToOrder_(accessor, row))
    .filter((order) => String(order.district).toUpperCase() === String(district).toUpperCase());
}

function getOrdersByDistrictAndPartner_(district, partnerName, token) {
  assertToken_(token);
  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  const districtUpper = String(district || '').toUpperCase();
  const partnerUpper = String(partnerName || '').toUpperCase();
  return values
    .map((row) => rowToOrder_(accessor, row))
    .filter((order) => {
      const districtOk = !districtUpper || String(order.district).toUpperCase() === districtUpper;
      const partnerOk = !partnerUpper || String(order.assignedTo).toUpperCase() === partnerUpper;
      return districtOk && partnerOk;
    });
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
  const sheet = ss.getSheetByName(PAYMENT_LOG_SHEET_NAME) || ss.insertSheet(PAYMENT_LOG_SHEET_NAME);
  const settlementId = 'SET-' + Date.now();
  sheet.appendRow([new Date(), settlementId, body.amount, body.method, body.reference || '']);
  return { settlementId: settlementId };
}

function updateOrderRow_(orderId, updates) {
  const sheet = getOrderSheet_();
  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('Orders sheet is empty');
  const headers = values[0];
  const accessor = buildAccessor_(headers);
  const orderKey = accessor.resolve('ORDER_NO');
  const orderCol = orderKey ? headers.indexOf(orderKey) + 1 : 0;
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

function rowToOrder_(accessor, row) {
  const orderNo = String(accessor.read(row, 'ORDER_NO') || '');
  const status = String(accessor.read(row, 'DELIVERY_COUNTED') || '').toUpperCase() === 'DONE'
    ? 'delivered'
    : String(accessor.read(row, 'REMARKS') || '').indexOf('FAILED:') === 0
      ? 'failed'
      : 'pending';
  return {
    id: orderNo.replace('#', ''),
    orderNo: orderNo.replace('#', ''),
    customerName: String(accessor.read(row, 'CUSTOMER_NAME') || ''),
    phoneMasked: maskPhone_(String(accessor.read(row, 'MOBILE') || '')),
    address: String(accessor.read(row, 'ADDRESS') || ''),
    area: String(accessor.read(row, 'AREA') || ''),
    district: String(accessor.read(row, 'DISTRICT') || ''),
    product: String(accessor.read(row, 'PRODUCT') || ''),
    quantity: Number(accessor.read(row, 'QTY') || 1),
    amount: Number(accessor.read(row, 'AMOUNT') || 0),
    paymentType: normalizePaymentMode_(accessor.read(row, 'PAYMENT_MODE'), accessor.read(row, 'AMOUNT')),
    status: status,
    attempts: Number(accessor.read(row, 'ATTEMPT') || 1),
    assignedTo: String(accessor.read(row, 'POSTMAN') || ''),
    updatedAt: new Date().toISOString(),
    remarks: String(accessor.read(row, 'REMARKS') || ''),
  };
}

function assertToken_(token) {
  if (!token) throw new Error('Missing token');
}

function getToken_(e, input) {
  const fromBody = (input && input.__token) || (input && input.body && input.body.__token) || '';
  const fromParam = (e.parameter && (e.parameter.token || e.parameter.authorization)) || '';
  const merged = String(fromBody || fromParam || '').replace('Bearer ', '').trim();
  return merged || 'demo-token';
}

function maskPhone_(phone) {
  return phone.length >= 4 ? 'XXXXXX' + phone.slice(-4) : phone;
}

function normalizePaymentMode_(paymentMode, amount) {
  const mode = String(paymentMode || '').toUpperCase();
  if (mode.indexOf('PREPAID') !== -1 || mode.indexOf('PAID') !== -1) return 'Prepaid';
  if (mode.indexOf('COD') !== -1 || mode.indexOf('CASH') !== -1) return 'COD';
  return Number(amount || 0) > 0 ? 'COD' : 'Prepaid';
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getOrderSheet_() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(ORDERS_SHEET_NAME);
  if (!sheet) throw new Error('Orders sheet not found: ' + ORDERS_SHEET_NAME);
  return sheet;
}

function getColumnOverrides_() {
  const raw = PropertiesService.getScriptProperties().getProperty('DB_COLUMN_ALIASES_JSON');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error('Invalid DB_COLUMN_ALIASES_JSON: ' + err.message);
  }
}

function buildAccessor_(headers) {
  const overrides = getColumnOverrides_();
  const aliases = mergeAliases_(DEFAULT_COLUMN_ALIASES, overrides);
  const indexByHeader = {};
  headers.forEach((name, idx) => { indexByHeader[String(name).trim().toUpperCase()] = idx; });

  const resolved = {};
  Object.keys(aliases).forEach((logical) => {
    const candidates = aliases[logical].map((c) => String(c).trim().toUpperCase());
    const matched = candidates.find((key) => key in indexByHeader);
    if (matched) {
      resolved[logical] = headers[indexByHeader[matched]];
    }
  });

  return {
    resolve: function resolve(logical) {
      return resolved[logical] || '';
    },
    read: function read(row, logical) {
      const headerName = resolved[logical];
      if (!headerName) return '';
      return row[indexByHeader[String(headerName).trim().toUpperCase()]];
    },
    headers: headers,
    resolved: resolved,
    aliases: aliases,
  };
}

function mergeAliases_(defaults, overrides) {
  const merged = {};
  Object.keys(defaults).forEach((key) => {
    const fromOverride = overrides[key];
    if (Array.isArray(fromOverride) && fromOverride.length > 0) {
      merged[key] = fromOverride;
    } else {
      merged[key] = defaults[key];
    }
  });
  return merged;
}

function inspectColumns_() {
  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return { headers: [], resolved: {}, aliases: DEFAULT_COLUMN_ALIASES };
  const headers = values[0];
  const accessor = buildAccessor_(headers);
  return {
    headers: headers,
    resolved: accessor.resolved,
    aliases: accessor.aliases,
  };
}

function findPartnerByPhone_(phone) {
  if (!phone) return null;
  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return null;
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  const normalizedPhone = onlyDigits_(phone);

  for (let i = 0; i < values.length; i += 1) {
    const row = values[i];
    const partnerPhone = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER'));
    if (partnerPhone && partnerPhone.slice(-10) === normalizedPhone.slice(-10)) {
      const name = String(accessor.read(row, 'POSTMAN') || 'Delivery Partner');
      const district = String(accessor.read(row, 'DISTRICT') || '');
      return {
        id: 'partner_' + normalizedPhone.slice(-10),
        name: name,
        phone: normalizedPhone.slice(-10),
        district: district,
        role: 'partner',
        token: 'partner-' + normalizedPhone.slice(-10),
      };
    }
  }
  return null;
}

function onlyDigits_(value) {
  return String(value || '').replace(/\D/g, '');
}
