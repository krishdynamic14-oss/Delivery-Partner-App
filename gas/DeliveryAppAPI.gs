const SHEET_ID = PropertiesService.getScriptProperties().getProperty('DB_SHEET_ID');
const ORDERS_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_ORDERS_SHEET') || 'Sheet1';
const PAYMENT_LOG_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_PAYMENT_LOG_SHEET') || 'PAYMENT LOG';
const STOCK_MASTER_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_STOCK_MASTER_SHEET') || 'Stock Master';
const DP_MASTER_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_DP_MASTER_SHEET') || 'DP MASTER';
const PROOF_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('DB_PROOF_FOLDER_ID');
const ADMIN_PHONES = PropertiesService.getScriptProperties().getProperty('DB_ADMIN_PHONES') || '';

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

const STOCK_COLUMN_ALIASES = {
  DATE: ['DATE', 'STOCK DATE', 'SENT DATE', 'DISPATCH DATE'],
  PRODUCT: ['PRODUCT', 'PRODUCT NAME', 'ITEM', 'ITEM NAME'],
  SKU: ['SKU', 'ITEM CODE', 'PRODUCT CODE', 'CODE'],
  QTY_SENT: ['QTY SENT', 'SENT QTY', 'STOCK SENT', 'QUANTITY', 'QTY', 'PCS', 'PIECES'],
  POSTMAN: ['DELIVERY PARTNER NAME', 'POSTMAN', 'PARTNER', 'DELIVERY PARTNER', 'DP NAME'],
  POSTMAN_NUMBER: ['DELIVERY PARTNER NUMBER', 'PARTNER NUMBER', 'POSTMAN NUMBER', 'DP NUMBER', 'MOBILE NUMBER', 'MOBILE'],
  DISTRICT: ['DISTRICT', 'ASSIGNED DISTRICT', 'AREA'],
  NOTES: ['NOTES', 'REMARKS', 'NOTE'],
};

const DP_COLUMN_ALIASES = {
  POSTMAN: ['DELIVERY PARTNER NAME', 'POSTMAN', 'PARTNER', 'DELIVERY PARTNER', 'DP NAME', 'NAME'],
  POSTMAN_NUMBER: ['DELIVERY PARTNER NUMBER', 'PARTNER NUMBER', 'POSTMAN NUMBER', 'DP NUMBER', 'MOBILE NUMBER', 'MOBILE', 'PHONE'],
  DISTRICT: ['DISTRICT', 'ASSIGNED DISTRICT', 'AREA', 'CITY'],
  STATUS: ['STATUS', 'ACTIVE', 'IS ACTIVE'],
};

function doPost(e) {
  try {
    const input = JSON.parse(e.postData.contents || '{}');
    const action = input.action;
    const body = input.body || {};
    const token = getToken_(e, input);

    const routes = {
      'auth.demoLogin': () => demoLogin_(body),
      'orders.all': () => getAllOrders_(token),
      'orders.byDistrict': () => getOrdersByDistrict_(body.district, token),
      'orders.byDistrictAndPartner': () => getOrdersByDistrictAndPartner_(body.district, body.partnerName, token),
      'orders.deliver': () => markOrderDelivered_(body, token),
      'orders.fail': () => markOrderFailed_(body, token),
      'cod.settle': () => submitCodSettlement_(body, token),
      'stock.master': () => getStockMaster_(token),
      'meta.columns': () => inspectColumns_(),
      'meta.partners': () => inspectPartners_(),
    };

    if (!routes[action]) return json_({ ok: false, error: 'Unknown action: ' + action });
    return json_({ ok: true, data: routes[action]() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function demoLogin_(body) {
  const admin = findAdminByPhone_(body.phone);
  if (admin) return admin;
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

function findAdminByPhone_(phone) {
  const normalizedPhone = onlyDigits_(phone).slice(-10);
  if (!normalizedPhone || !ADMIN_PHONES) return null;
  const adminPhones = ADMIN_PHONES
    .split(/[,\n]/)
    .map((value) => onlyDigits_(value).slice(-10))
    .filter(Boolean);
  if (adminPhones.indexOf(normalizedPhone) === -1) return null;
  return {
    id: 'admin_' + normalizedPhone,
    name: 'Dynamic Bazar Admin',
    phone: normalizedPhone,
    district: 'ALL',
    role: 'admin',
    token: 'admin-' + normalizedPhone,
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

function getAllOrders_(token) {
  assertToken_(token);
  if (String(token).indexOf('admin-') !== 0) throw new Error('Admin access required');
  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  return values.map((row) => rowToOrder_(accessor, row));
}

function getOrdersByDistrictAndPartner_(district, partnerName, token) {
  assertToken_(token);
  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  const districtUpper = String(district || '').toUpperCase();
  const partnerUpper = normalizeText_(partnerName);
  return values
    .map((row) => rowToOrder_(accessor, row))
    .filter((order) => {
      const districtOk = !districtUpper || String(order.district).toUpperCase() === districtUpper;
      const partnerOk = !partnerUpper || normalizeText_(order.assignedTo) === partnerUpper;
      return districtOk && partnerOk;
    });
}

function markOrderDelivered_(body, token) {
  assertToken_(token);
  const photoUrl = body.uploadProof === true ? (body.photoUrl || uploadDeliveryProof_(body)) : (body.photoUrl || '');
  const updates = {
    DELIVERY_COUNTED: 'DONE',
    DELIVERY_DATE: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy'),
    PROCESSED: 'DONE',
  };
  if (photoUrl) updates.DELIVERY_PHOTO = photoUrl;
  updateOrderRow_(body.orderId, updates);
  return { updated: true, photoUrl: photoUrl || '' };
}

function markOrderFailed_(body, token) {
  assertToken_(token);
  const reason = String(body.reason || 'Failed delivery').trim();
  const photoUrl = body.uploadProof === true ? (body.photoUrl || uploadDeliveryProof_(body)) : (body.photoUrl || '');
  const detail = [];
  if (body.notes) detail.push('Notes: ' + String(body.notes).trim());
  if (body.nextAttemptDate) detail.push('Next attempt: ' + String(body.nextAttemptDate).trim());
  if (body.photoUri || photoUrl) detail.push('House proof captured');

  const updates = {
    REMARKS: 'FAILED: ' + reason,
    DELIVERY_COUNTED: 'FAILED',
    PROCESSED: 'FAILED',
  };
  if (photoUrl) updates.DELIVERY_PHOTO = photoUrl;
  if (detail.length) updates.REMARK2 = detail.join(' | ');
  updateOrderRow_(body.orderId, updates);
  return { updated: true, photoUrl: photoUrl || '' };
}

function submitCodSettlement_(body, token) {
  assertToken_(token);
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(PAYMENT_LOG_SHEET_NAME) || ss.insertSheet(PAYMENT_LOG_SHEET_NAME);
  ensurePaymentLogHeader_(sheet);
  const settlementId = 'SET-' + Date.now();
  sheet.appendRow([
    new Date(),
    settlementId,
    String(body.partnerName || '').trim(),
    onlyDigits_(body.partnerPhone),
    String(body.district || '').trim(),
    Number(body.amount || 0),
    String(body.method || '').trim(),
    String(body.reference || '').trim(),
    Number(body.assignedCod || 0),
    Number(body.collectedCod || 0),
    Number(body.remainingCod || 0),
    Number(body.codOrderCount || 0),
    Number(body.deliveredCodCount || 0),
    Number(body.pendingCodCount || 0),
    'mobile-app',
  ]);
  return { settlementId: settlementId };
}

function authorizeRequiredServices() {
  const orderSheet = getOrderSheet_();
  const proofFolder = getProofFolder_();
  return {
    ok: true,
    ordersSheet: orderSheet.getName(),
    proofFolder: proofFolder.getName(),
  };
}

function uploadDeliveryProof_(body) {
  if (!body.photoBase64) return '';
  const folder = getProofFolder_();
  const mimeType = body.photoMimeType || 'image/jpeg';
  const extension = mimeType.indexOf('png') !== -1 ? 'png' : 'jpg';
  const safeOrderId = String(body.orderId || 'order').replace(/[^A-Za-z0-9_-]/g, '');
  const fileName = body.photoFileName || ('delivery-proof-' + safeOrderId + '-' + Date.now() + '.' + extension);
  const bytes = Utilities.base64Decode(String(body.photoBase64));
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getProofFolder_() {
  if (PROOF_FOLDER_ID) return DriveApp.getFolderById(PROOF_FOLDER_ID);
  return DriveApp.getRootFolder();
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
        const resolvedHeader = accessor.resolve(key);
        let col = headers.indexOf(key) + 1;
        if (!col && resolvedHeader) col = headers.indexOf(resolvedHeader) + 1;
        if (!col && key === 'DELIVERY_PHOTO') col = ensureColumn_(sheet, headers, 'DELIVERY_PHOTO');
        if (col) sheet.getRange(r, col).setValue(updates[key]);
      });
      return;
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function ensureColumn_(sheet, headers, columnName) {
  const col = headers.length + 1;
  sheet.getRange(1, col).setValue(columnName);
  headers.push(columnName);
  return col;
}

function rowToOrder_(accessor, row) {
  const orderNo = String(accessor.read(row, 'ORDER_NO') || '');
  const address = [accessor.read(row, 'ADDRESS'), accessor.read(row, 'PIN_CODE')]
    .filter(Boolean)
    .join(', ');
  const area = String(accessor.read(row, 'AREA') || accessor.read(row, 'PIN_CODE') || accessor.read(row, 'DISTRICT') || '');
  const remarks = String(accessor.read(row, 'REMARKS') || '');
  const remarksUpper = remarks.toUpperCase();
  const deliveryStatus = String(accessor.read(row, 'DELIVERY_COUNTED') || '').toUpperCase();
  const status = deliveryStatus === 'DONE'
    ? 'delivered'
    : deliveryStatus === 'FAILED' || remarksUpper.indexOf('FAILED:') === 0 || remarksUpper.indexOf('CANCEL') !== -1 || remarksUpper.indexOf('RTO') !== -1
      ? 'failed'
      : 'pending';
  return {
    id: orderNo.replace('#', ''),
    orderNo: orderNo.replace('#', ''),
    customerName: String(accessor.read(row, 'CUSTOMER_NAME') || ''),
    phoneMasked: maskPhone_(String(accessor.read(row, 'MOBILE') || '')),
    address: String(address || ''),
    area: area,
    district: String(accessor.read(row, 'DISTRICT') || ''),
    product: String(accessor.read(row, 'PRODUCT') || ''),
    quantity: Number(accessor.read(row, 'QTY') || 1),
    amount: Number(accessor.read(row, 'AMOUNT') || 0),
    paymentType: normalizePaymentMode_(accessor.read(row, 'PAYMENT_MODE'), accessor.read(row, 'AMOUNT')),
    status: status,
    attempts: Number(accessor.read(row, 'ATTEMPT') || 1),
    assignedTo: String(accessor.read(row, 'POSTMAN') || '').trim(),
    updatedAt: new Date().toISOString(),
    photoUrl: String(accessor.read(row, 'DELIVERY_PHOTO') || ''),
    remarks: remarks,
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

function inspectPartners_() {
  const fromMaster = getDpMasterPartners_();
  if (fromMaster.length) return fromMaster;

  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  const byPartner = {};

  values.forEach((row) => {
    const name = String(accessor.read(row, 'POSTMAN') || '').trim();
    const numberMasked = maskPhone_(onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER')));
    const district = String(accessor.read(row, 'DISTRICT') || '').trim();
    if (!name && !numberMasked) return;

    const key = [name, numberMasked, district].join('|');
    if (!byPartner[key]) {
      byPartner[key] = {
        name: name,
        numberMasked: numberMasked,
        district: district,
        orderCount: 0,
      };
    }
    byPartner[key].orderCount += 1;
  });

  return Object.keys(byPartner).map((key) => byPartner[key]);
}

function getStockMaster_(token) {
  assertToken_(token);
  if (String(token).indexOf('admin-') !== 0) throw new Error('Admin access required');
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const stockSheet = ss.getSheetByName(STOCK_MASTER_SHEET_NAME);
  if (!stockSheet) throw new Error('Stock Master sheet not found: ' + STOCK_MASTER_SHEET_NAME);

  const stockValues = stockSheet.getDataRange().getValues();
  if (!stockValues.length) return [];
  const stockHeaders = stockValues.shift();
  const stockAccessor = buildAccessorFromAliases_(stockHeaders, STOCK_COLUMN_ALIASES);

  const orderValues = getOrderSheet_().getDataRange().getValues();
  const orderHeaders = orderValues.length ? orderValues.shift() : [];
  const orderAccessor = orderHeaders.length ? buildAccessor_(orderHeaders) : null;
  const orderUsage = {};

  if (orderAccessor) {
    orderValues.forEach((row) => {
      const product = normalizeText_(orderAccessor.read(row, 'PRODUCT'));
      const partner = normalizeText_(orderAccessor.read(row, 'POSTMAN'));
      if (!product || !partner) return;
      const key = product + '|' + partner;
      if (!orderUsage[key]) orderUsage[key] = { deliveredQty: 0, pendingQty: 0, failedQty: 0 };
      const qty = Number(orderAccessor.read(row, 'QTY') || 1);
      const deliveryStatus = String(orderAccessor.read(row, 'DELIVERY_COUNTED') || '').toUpperCase();
      const remarks = String(orderAccessor.read(row, 'REMARKS') || '').toUpperCase();
      if (deliveryStatus === 'DONE') {
        orderUsage[key].deliveredQty += qty;
      } else if (deliveryStatus === 'FAILED' || remarks.indexOf('FAILED:') === 0 || remarks.indexOf('CANCEL') !== -1 || remarks.indexOf('RTO') !== -1) {
        orderUsage[key].failedQty += qty;
      } else {
        orderUsage[key].pendingQty += qty;
      }
    });
  }

  const stockByPartner = {};
  stockValues.forEach((row) => {
    const productName = String(stockAccessor.read(row, 'PRODUCT') || '').trim();
    const partnerName = String(stockAccessor.read(row, 'POSTMAN') || '').trim();
    if (!productName && !partnerName) return;
    const qtySent = Number(stockAccessor.read(row, 'QTY_SENT') || 0);
    if (!qtySent) return;
    const productKey = normalizeText_(productName || 'Unknown Product');
    const partnerKey = normalizeText_(partnerName || 'Unassigned');
    const stockKey = productKey + '|' + partnerKey;
    if (!stockByPartner[stockKey]) {
      stockByPartner[stockKey] = {
        productKey: productKey,
        partnerKey: partnerKey,
        productName: productName || 'Unknown Product',
        partnerName: partnerName || 'Unassigned',
        sku: String(stockAccessor.read(row, 'SKU') || makeSku_(productName)).trim(),
        phone: onlyDigits_(stockAccessor.read(row, 'POSTMAN_NUMBER')),
        district: String(stockAccessor.read(row, 'DISTRICT') || '').trim(),
        qtySent: 0,
      };
    }
    stockByPartner[stockKey].qtySent += qtySent;
  });

  const stockByProduct = {};
  Object.keys(stockByPartner).forEach((stockKey) => {
    const line = stockByPartner[stockKey];
    const usage = orderUsage[line.productKey + '|' + line.partnerKey] || { deliveredQty: 0, pendingQty: 0, failedQty: 0 };

    if (!stockByProduct[line.productKey]) {
      stockByProduct[line.productKey] = {
        product: line.productName,
        sku: line.sku,
        sentQty: 0,
        deliveredQty: 0,
        pendingQty: 0,
        failedQty: 0,
        remainingQty: 0,
        partners: [],
      };
    }

    const remainingQty = Math.max(0, line.qtySent - usage.deliveredQty);
    stockByProduct[line.productKey].sentQty += line.qtySent;
    stockByProduct[line.productKey].deliveredQty += usage.deliveredQty;
    stockByProduct[line.productKey].pendingQty += usage.pendingQty;
    stockByProduct[line.productKey].failedQty += usage.failedQty;
    stockByProduct[line.productKey].remainingQty += remainingQty;
    stockByProduct[line.productKey].partners.push({
      name: line.partnerName,
      numberMasked: maskPhone_(line.phone),
      district: line.district,
      sentQty: line.qtySent,
      deliveredQty: usage.deliveredQty,
      pendingQty: usage.pendingQty,
      failedQty: usage.failedQty,
      remainingQty: remainingQty,
    });
  });

  return Object.keys(stockByProduct).map((key) => {
    const item = stockByProduct[key];
    const sellRate = Math.max(1, Math.ceil(item.deliveredQty / 7));
    const daysLeft = item.remainingQty > 0 ? Math.ceil(item.remainingQty / sellRate) : 0;
    const stockPercent = item.sentQty > 0 ? Math.max(0, Math.min(100, Math.round((item.remainingQty / item.sentQty) * 100))) : 0;
    const status = item.remainingQty <= 5 || daysLeft <= 2 ? 'critical' : item.remainingQty <= 15 || daysLeft <= 5 ? 'low' : 'ok';
    return {
      product: item.product,
      sku: item.sku || makeSku_(item.product),
      sentQty: item.sentQty,
      deliveredQty: item.deliveredQty,
      pendingQty: item.pendingQty,
      failedQty: item.failedQty,
      remainingQty: item.remainingQty,
      sellRate: sellRate,
      daysLeft: daysLeft,
      stockPercent: stockPercent,
      status: status,
      partners: item.partners,
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft || a.remainingQty - b.remainingQty);
}

function getDpMasterPartners_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(DP_MASTER_SHEET_NAME);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  const accessor = buildAccessorFromAliases_(headers, DP_COLUMN_ALIASES);
  return values.map((row) => {
    const name = String(accessor.read(row, 'POSTMAN') || '').trim();
    const phone = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER'));
    const district = String(accessor.read(row, 'DISTRICT') || '').trim();
    const status = String(accessor.read(row, 'STATUS') || 'ACTIVE').trim();
    if (!name && !phone) return null;
    return {
      name: name,
      numberMasked: maskPhone_(phone),
      district: district,
      status: status,
      orderCount: 0,
    };
  }).filter(Boolean);
}

function ensurePaymentLogHeader_(sheet) {
  const headers = [
    'TIMESTAMP',
    'SETTLEMENT ID',
    'DELIVERY PARTNER NAME',
    'DELIVERY PARTNER NUMBER',
    'DISTRICT',
    'SETTLEMENT AMOUNT',
    'METHOD',
    'REFERENCE',
    'ASSIGNED COD',
    'COLLECTED COD',
    'REMAINING COD',
    'COD ORDER COUNT',
    'DELIVERED COD COUNT',
    'PENDING COD COUNT',
    'SOURCE',
  ];

  const currentFirstCell = String(sheet.getRange(1, 1).getValue() || '').trim().toUpperCase();
  if (currentFirstCell === 'TIMESTAMP') return;

  if (sheet.getLastRow() > 0 && currentFirstCell) {
    sheet.insertRowBefore(1);
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function findPartnerByPhone_(phone) {
  if (!phone) return null;
  const fromMaster = findPartnerByPhoneInMaster_(phone);
  if (fromMaster) return fromMaster;

  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return null;
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  const normalizedPhone = onlyDigits_(phone);

  for (let i = 0; i < values.length; i += 1) {
    const row = values[i];
    const partnerPhone = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER'));
    if (partnerPhone && partnerPhone.slice(-10) === normalizedPhone.slice(-10)) {
      const name = String(accessor.read(row, 'POSTMAN') || 'Delivery Partner').trim();
      const district = String(accessor.read(row, 'DISTRICT') || '').trim();
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

function findPartnerByPhoneInMaster_(phone) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(DP_MASTER_SHEET_NAME);
  if (!sheet) return null;
  const values = sheet.getDataRange().getValues();
  if (!values.length) return null;
  const headers = values.shift();
  const accessor = buildAccessorFromAliases_(headers, DP_COLUMN_ALIASES);
  const normalizedPhone = onlyDigits_(phone);

  for (let i = 0; i < values.length; i += 1) {
    const row = values[i];
    const partnerPhone = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER'));
    if (partnerPhone && partnerPhone.slice(-10) === normalizedPhone.slice(-10)) {
      const name = String(accessor.read(row, 'POSTMAN') || 'Delivery Partner').trim();
      const district = String(accessor.read(row, 'DISTRICT') || '').trim();
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

function normalizeText_(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toUpperCase();
}

function buildAccessorFromAliases_(headers, aliases) {
  const indexByHeader = {};
  headers.forEach((name, idx) => { indexByHeader[String(name).trim().toUpperCase()] = idx; });
  const resolved = {};
  Object.keys(aliases).forEach((logical) => {
    const candidates = aliases[logical].map((c) => String(c).trim().toUpperCase());
    const matched = candidates.find((key) => key in indexByHeader);
    if (matched) resolved[logical] = headers[indexByHeader[matched]];
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

function makeSku_(name) {
  const code = String(name || 'ITEM').replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 3).map((part) => part.slice(0, 2).toUpperCase()).join('-');
  return 'DB-' + (code || 'ITEM');
}
