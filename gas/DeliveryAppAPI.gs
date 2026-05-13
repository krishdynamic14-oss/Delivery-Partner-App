const SHEET_ID = PropertiesService.getScriptProperties().getProperty('DB_SHEET_ID');
const ORDERS_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_ORDERS_SHEET') || 'Sheet1';
const PAYMENT_LOG_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_PAYMENT_LOG_SHEET') || 'PAYMENT LOG';
const DELIVERY_LOG_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_DELIVERY_LOG_SHEET') || 'DELIVERY LOG';
const STOCK_MASTER_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_STOCK_MASTER_SHEET') || 'Stock Master';
const DP_MASTER_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_DP_MASTER_SHEET') || 'DP MASTER';
const PASSWORD_RESET_SHEET_NAME = PropertiesService.getScriptProperties().getProperty('DB_PASSWORD_RESET_SHEET') || 'PASSWORD RESET';
const PROOF_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('DB_PROOF_FOLDER_ID');
const BILL_TEMPLATE_ID = PropertiesService.getScriptProperties().getProperty('DB_BILL_TEMPLATE_ID') || '';
const BILL_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('DB_BILL_FOLDER_ID') || '';
const AISENSY_API_KEY = PropertiesService.getScriptProperties().getProperty('DB_AISENSY_API_KEY') || '';
const AISENSY_CAMPAIGN_NAME = PropertiesService.getScriptProperties().getProperty('DB_AISENSY_CAMPAIGN_NAME') || 'BILL2';
const AISENSY_DELIVERY_OTP_CAMPAIGN_NAME = PropertiesService.getScriptProperties().getProperty('DB_AISENSY_DELIVERY_OTP_CAMPAIGN_NAME') || 'OTP';
const AISENSY_API_URL = PropertiesService.getScriptProperties().getProperty('DB_AISENSY_API_URL') || 'https://backend.aisensy.com/campaign/t1/api/v2';
const ADMIN_PHONES = PropertiesService.getScriptProperties().getProperty('DB_ADMIN_PHONES') || '';
const ADMIN_CREDENTIALS_JSON = PropertiesService.getScriptProperties().getProperty('DB_ADMIN_CREDENTIALS_JSON') || '';
const ADMIN_PASSWORD = PropertiesService.getScriptProperties().getProperty('DB_ADMIN_PASSWORD') || '';
const COD_COMMISSION_SLABS_JSON = PropertiesService.getScriptProperties().getProperty('DB_COD_COMMISSION_SLABS_JSON') || '';

const DEFAULT_COD_COMMISSION_SLABS = [
  { min: 0, max: 1199, commission: 150 },
  { min: 1200, max: 2000, commission: 200 },
  { min: 2001, max: 3000, commission: 250 },
  { min: 3001, max: 10000, commission: 300 },
];

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
  BILL_WHATSAPP_STATUS: ['BILL WHATSAPP STATUS', 'BILL WA STATUS'],
  BILL_WHATSAPP_RESPONSE: ['BILL WHATSAPP RESPONSE', 'BILL WA RESPONSE'],
  DELIVERY_OTP: ['DELIVERY OTP', 'DELIVERY_OTP', 'CUSTOMER OTP', 'OTP'],
  DELIVERY_OTP_SENT_STATUS: ['DELIVERY OTP SENT STATUS', 'OTP SENT STATUS'],
  DELIVERY_OTP_SENT_RESPONSE: ['DELIVERY OTP SENT RESPONSE', 'OTP SENT RESPONSE'],
  DELIVERY_OTP_VERIFIED: ['DELIVERY OTP VERIFIED', 'OTP VERIFIED'],
  PAYMENT_RECEIVED_MODE: ['PAYMENT RECEIVED MODE', 'RCVD PAYMENT MODE', 'RECEIVED PAYMENT MODE'],
  PAYMENT_RECEIVED_REF: ['PAYMENT RECEIVED REF', 'PAYMENT REF', 'UPI REF', 'UTR'],
  PAYMENT_RECEIVED_AMOUNT: ['PAYMENT RECEIVED AMOUNT', 'RCVD AMOUNT', 'RECEIVED AMOUNT'],
  PAYMENT_RECEIVED_AT: ['PAYMENT RECEIVED AT', 'PAYMENT RCVD AT'],
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
  DISTRICT: ['DISTRICT', 'ASSIGNED DISTRICT', 'AREA', 'LOCATION'],
  LOCATION: ['LOCATION', 'DISTRICT', 'AREA', 'ASSIGNED DISTRICT'],
  NOTES: ['NOTES', 'REMARKS', 'NOTE'],
};

const DP_COLUMN_ALIASES = {
  POSTMAN: ['PARTNER NAME', 'DELIVERY PARTNER NAME', 'POSTMAN', 'PARTNER', 'DELIVERY PARTNER', 'DP NAME', 'NAME'],
  POSTMAN_NUMBER: ['DELIVERY PARTNER NUMBER', 'PARTNER NUMBER', 'POSTMAN NUMBER', 'DP NUMBER', 'MOBILE NUMBER', 'MOBILE', 'PHONE'],
  DISTRICT: ['DISTRICT', 'ASSIGNED DISTRICT', 'AREA', 'CITY'],
  STATUS: ['STATUS', 'ACTIVE', 'IS ACTIVE'],
  PASSWORD: ['PASSWORD', 'APP PASSWORD', 'LOGIN PASSWORD'],
};

function doPost(e) {
  try {
    const input = JSON.parse(e.postData.contents || '{}');
    const action = input.action;
    const body = input.body || {};
    const token = getToken_(e, input);

    const routes = {
      'auth.login': () => demoLogin_(body),
      'auth.demoLogin': () => demoLogin_(body),
      'auth.passwordResetRequest': () => requestPasswordReset_(body),
      'orders.all': () => getAllOrders_(token),
      'orders.byDistrict': () => getOrdersByDistrict_(body.district, token),
      'orders.byDistrictAndPartner': () => getOrdersByDistrictAndPartner_(body.district, body.partnerName, token),
      'orders.sendDeliveryOtp': () => sendDeliveryOtpByOrderId_(body.orderId, token),
      'orders.deliver': () => markOrderDelivered_(body, token),
      'orders.fail': () => markOrderFailed_(body, token),
      'cod.summary': () => getCodSettlementSummary_(body, token),
      'cod.settle': () => submitCodSettlement_(body, token),
      'cod.settlements': () => getCodSettlements_(token),
      'cod.approveSettlement': () => approveCodSettlement_(body, token),
      'bills.generate': () => generateBillByOrderId_(body.orderId, token),
      'stock.master': () => getStockMaster_(token),
      'stock.dispatch': () => addStockDispatch_(body, token),
      'admin.partners': () => getAdminPartners_(token),
      'orders.assign': () => assignOrderToPartner_(body, token),
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
  const admin = findAdminByPhone_(body.phone, body);
  if (admin) return admin;
  const partner = findPartnerByPhone_(body.phone, body);
  if (partner) return partner;
  if (SHEET_ID) throw new Error('Partner not found for this mobile number');
  verifyLoginCredential_(body, 'demo123');
  return {
    id: 'partner_ahmedabad',
    name: 'SURESHBHAI',
    phone: body.phone,
    district: 'AHMEDABAD',
    role: 'partner',
    token: 'demo-token',
  };
}

function findAdminByPhone_(phone, body) {
  const normalizedPhone = onlyDigits_(phone).slice(-10);
  if (!normalizedPhone || !ADMIN_PHONES) return null;
  const adminPhones = ADMIN_PHONES
    .split(/[,\n]/)
    .map((value) => onlyDigits_(value).slice(-10))
    .filter(Boolean);
  if (adminPhones.indexOf(normalizedPhone) === -1) return null;
  const credential = getAdminCredential_(normalizedPhone);
  verifyLoginCredential_(body || {}, credential.password);
  return {
    id: 'admin_' + normalizedPhone,
    name: 'Dynamic Bazar Admin',
    phone: normalizedPhone,
    district: 'ALL',
    role: 'admin',
    token: 'admin-' + normalizedPhone,
  };
}

function getAdminCredential_(phone) {
  const normalizedPhone = onlyDigits_(phone).slice(-10);
  if (ADMIN_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(ADMIN_CREDENTIALS_JSON);
      if (Array.isArray(credentials)) {
        const matched = credentials.find((entry) => onlyDigits_(entry.phone).slice(-10) === normalizedPhone);
        if (matched) {
          return {
            password: String(matched.password || ''),
          };
        }
      }
    } catch (err) {
      throw new Error('Invalid DB_ADMIN_CREDENTIALS_JSON: ' + err.message);
    }
  }
  return {
    password: ADMIN_PASSWORD,
  };
}

function verifyLoginCredential_(body, storedPassword) {
  const inputPassword = String(body.password || '').trim();
  const password = String(storedPassword || '').trim();

  if (!password) throw new Error('Password is not configured for this login');
  if (!inputPassword) throw new Error('Password required');
  if (inputPassword !== password) throw new Error('Invalid password');
}

function requestPasswordReset_(body) {
  const phone = onlyDigits_(body.phone).slice(-10);
  if (!phone || phone.length !== 10) throw new Error('Registered mobile number required');

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(PASSWORD_RESET_SHEET_NAME) || ss.insertSheet(PASSWORD_RESET_SHEET_NAME);
  ensurePasswordResetHeader_(sheet);

  const existingValues = sheet.getDataRange().getValues();
  for (let r = existingValues.length; r >= 2; r -= 1) {
    const row = existingValues[r - 1];
    const existingPhone = onlyDigits_(row[1]).slice(-10);
    const status = normalizeText_(row[3]);
    if (existingPhone === phone && status === 'PENDING') {
      sheet.getRange(r, 1).setValue(new Date());
      return { requested: true, message: 'Password reset request already pending' };
    }
  }

  const partner = lookupPartnerSummaryByPhone_(phone);
  sheet.appendRow([
    new Date(),
    phone,
    partner.name || '',
    'PENDING',
    partner.role || '',
    partner.district || '',
    '',
  ]);
  return { requested: true, message: 'Password reset request saved' };
}

function ensurePasswordResetHeader_(sheet) {
  const headers = ['TIMESTAMP', 'PHONE', 'NAME', 'STATUS', 'ROLE', 'DISTRICT', 'NOTES'];
  const currentFirstCell = String(sheet.getRange(1, 1).getValue() || '').trim().toUpperCase();
  if (currentFirstCell === 'TIMESTAMP') return;
  if (sheet.getLastRow() > 0 && currentFirstCell) sheet.insertRowBefore(1);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function lookupPartnerSummaryByPhone_(phone) {
  const normalizedPhone = onlyDigits_(phone).slice(-10);
  if (ADMIN_PHONES) {
    const isAdmin = ADMIN_PHONES
      .split(/[,\n]/)
      .map((value) => onlyDigits_(value).slice(-10))
      .filter(Boolean)
      .indexOf(normalizedPhone) !== -1;
    if (isAdmin) return { name: 'Dynamic Bazar Admin', role: 'admin', district: 'ALL' };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(DP_MASTER_SHEET_NAME);
  if (sheet) {
    const values = sheet.getDataRange().getValues();
    if (values.length) {
      const headers = values.shift();
      const accessor = buildAccessorFromAliases_(headers, DP_COLUMN_ALIASES);
      for (let i = 0; i < values.length; i += 1) {
        const row = values[i];
        const partnerPhone = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER')).slice(-10);
        if (partnerPhone === normalizedPhone) {
          return {
            name: String(accessor.read(row, 'POSTMAN') || '').trim(),
            role: 'partner',
            district: String(accessor.read(row, 'DISTRICT') || '').trim(),
          };
        }
      }
    }
  }
  return { name: '', role: '', district: '' };
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
  verifyDeliveryOtpByOrderId_(body.orderId, body.otp);
  const photoUrl = body.uploadProof === true ? (body.photoUrl || uploadDeliveryProof_(body)) : (body.photoUrl || '');
  const updates = {
    DELIVERY_COUNTED: 'DONE',
    DELIVERY_DATE: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy'),
    PROCESSED: 'DONE',
    DELIVERY_OTP_VERIFIED: 'DONE',
    PAYMENT_RECEIVED_MODE: normalizeReceivedPaymentMode_(body.paymentReceivedMode, body.codCollected),
    PAYMENT_RECEIVED_AMOUNT: Number(body.paymentReceivedAmount || body.codCollected || 0),
    PAYMENT_RECEIVED_AT: new Date(),
  };
  if (body.paymentReference) updates.PAYMENT_RECEIVED_REF = String(body.paymentReference).trim();
  if (updates.PAYMENT_RECEIVED_AMOUNT) updates.RCVD_AMOUNT = updates.PAYMENT_RECEIVED_AMOUNT;
  if (photoUrl) updates.DELIVERY_PHOTO = photoUrl;
  updateOrderRow_(body.orderId, updates);
  const billResult = tryGenerateBillByOrderId_(body.orderId);
  logDeliveredOrder_(body.orderId, body, updates, photoUrl, billResult);
  return {
    updated: true,
    photoUrl: photoUrl || '',
    billUrl: billResult.billUrl || '',
    billError: billResult.error || '',
    billWhatsApp: billResult.whatsApp || null,
  };
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
  const sheet = getPaymentLogSheet_();
  ensurePaymentLogHeader_(sheet);
  const settlementId = 'SET-' + Date.now();
  const amount = Number(body.amount || 0);
  const proofUrl = uploadSettlementProof_(settlementId, body);
  const summary = calculateCodSettlementSummary_({
    partnerName: body.partnerName,
    partnerPhone: body.partnerPhone,
    district: body.district,
  });
  if (!amount || amount <= 0) throw new Error('Settlement amount required');
  if (amount > summary.cashInHand) {
    throw new Error('Settlement amount cannot be greater than Payable to Company: ' + summary.cashInHand);
  }

  appendPaymentLogRow_(sheet, {
    'TIMESTAMP': new Date(),
    'SETTLEMENT ID': settlementId,
    'DELIVERY PARTNER NAME': String(body.partnerName || '').trim(),
    'DELIVERY PARTNER NUMBER': onlyDigits_(body.partnerPhone),
    'DISTRICT': String(body.district || '').trim(),
    'SETTLEMENT AMOUNT': 0,
    'METHOD': String(body.method || 'Cash').trim(),
    'REFERENCE': String(body.reference || '').trim(),
    'PAYMENT PROOF': proofUrl,
    'ASSIGNED COD': summary.assignedCod,
    'COLLECTED COD': summary.cashCollected,
    'COMMISSION AMOUNT': summary.commissionEarned,
    'PAYABLE AMOUNT': summary.payableBeforeSettlement,
    'REMAINING COD': summary.cashInHand,
    'COD ORDER COUNT': summary.codOrderCount,
    'DELIVERED COD COUNT': summary.deliveredCodCount,
    'PENDING COD COUNT': summary.pendingCodCount,
    'SOURCE': 'mobile-app',
    'STATUS': 'PENDING',
    'REQUESTED AMOUNT': amount,
    'APPROVED AMOUNT': 0,
    'APPROVED BY': '',
    'APPROVED AT': '',
    'ADMIN NOTES': String(body.notes || '').trim(),
  });
  return { settlementId: settlementId, status: 'PENDING', cashInHand: summary.cashInHand };
}

function getCodSettlementSummary_(body, token) {
  assertToken_(token);
  return calculateCodSettlementSummary_(body || {});
}

function getCodSettlements_(token) {
  assertAdminToken_(token);
  const data = getPaymentLogData_();
  return data.values
    .slice(1)
    .map((row) => paymentLogRowToSettlement_(row, data.indexByHeader))
    .filter(Boolean)
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, 100);
}

function approveCodSettlement_(body, token) {
  assertAdminToken_(token);
  const settlementId = String(body.settlementId || '').trim();
  const decision = normalizeSettlementStatus_(body.status);
  if (!settlementId) throw new Error('Settlement ID required');
  if (decision !== 'APPROVED' && decision !== 'REJECTED') throw new Error('Status must be APPROVED or REJECTED');

  const data = getPaymentLogData_();
  const idCol = data.indexByHeader['SETTLEMENT ID'];
  const statusCol = data.indexByHeader['STATUS'];
  if (idCol === undefined) throw new Error('SETTLEMENT ID column missing');

  for (let r = 2; r <= data.values.length; r += 1) {
    const row = data.values[r - 1];
    if (String(row[idCol] || '').trim() !== settlementId) continue;

    const currentStatus = normalizeSettlementStatus_(statusCol === undefined ? '' : row[statusCol]);
    if (currentStatus && currentStatus !== 'PENDING') {
      throw new Error('Settlement already ' + currentStatus);
    }

    const requested = Number(readLogValue_(row, data.indexByHeader, 'REQUESTED AMOUNT') || readLogValue_(row, data.indexByHeader, 'SETTLEMENT AMOUNT') || 0);
    const approvedAmount = decision === 'APPROVED' ? Number(body.approvedAmount || requested || 0) : 0;
    if (decision === 'APPROVED' && (!approvedAmount || approvedAmount <= 0)) throw new Error('Approved amount required');
    if (decision === 'APPROVED' && requested && approvedAmount > requested) {
      throw new Error('Approved amount cannot be greater than requested amount');
    }

    const updates = {
      'STATUS': decision,
      'SETTLEMENT AMOUNT': approvedAmount,
      'APPROVED AMOUNT': approvedAmount,
      'METHOD': decision === 'APPROVED' ? String(body.method || 'Cash').trim() : '',
      'REFERENCE': String(body.reference || '').trim(),
      'APPROVED BY': getApproverFromToken_(token),
      'APPROVED AT': new Date(),
      'ADMIN NOTES': String(body.adminNotes || '').trim(),
    };
    Object.keys(updates).forEach((header) => {
      const col = ensureLogColumn_(data.sheet, data.headers, data.indexByHeader, header);
      data.sheet.getRange(r, col + 1).setValue(updates[header]);
    });
    return { updated: true };
  }
  throw new Error('Settlement not found: ' + settlementId);
}

function getAdminPartners_(token) {
  assertAdminToken_(token);
  const fromMaster = getDpMasterPartners_(true);
  if (fromMaster.length) return fromMaster;

  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return [];
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  const byPartner = {};

  values.forEach((row) => {
    const name = String(accessor.read(row, 'POSTMAN') || '').trim();
    const phone = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER')).slice(-10);
    const district = String(accessor.read(row, 'DISTRICT') || '').trim();
    if (!name && !phone) return;

    const key = [name, phone, district].join('|');
    if (!byPartner[key]) {
      byPartner[key] = {
        name: name,
        phone: phone,
        numberMasked: maskPhone_(phone),
        district: district,
        status: 'ACTIVE',
        orderCount: 0,
      };
    }
    byPartner[key].orderCount += 1;
  });

  return Object.keys(byPartner).map((key) => byPartner[key]);
}

function assignOrderToPartner_(body, token) {
  assertAdminToken_(token);
  const orderId = String(body.orderId || '').replace('#', '').trim();
  const partnerName = String(body.partnerName || '').trim();
  const partnerPhone = onlyDigits_(body.partnerPhone).slice(-10);
  const district = String(body.district || '').trim();
  if (!orderId) throw new Error('Order ID required');
  if (!partnerName) throw new Error('Partner name required');

  const updates = {
    POSTMAN: partnerName,
    GIVE_TO_PARTNER: 'DONE',
  };
  if (partnerPhone) updates.POSTMAN_NUMBER = partnerPhone;
  if (district) updates.DISTRICT = district;
  updateOrderRow_(orderId, updates);
  return { updated: true };
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

function uploadSettlementProof_(settlementId, body) {
  if (body.photoUrl) return String(body.photoUrl || '').trim();
  if (!body.photoBase64) return '';
  const folder = getProofFolder_();
  const mimeType = body.photoMimeType || 'image/jpeg';
  const extension = mimeType.indexOf('png') !== -1 ? 'png' : 'jpg';
  const safeSettlementId = String(settlementId || 'settlement').replace(/[^A-Za-z0-9_-]/g, '');
  const fileName = body.photoFileName || ('payment-proof-' + safeSettlementId + '-' + Date.now() + '.' + extension);
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
        if (!col && key === 'DELIVERY_OTP_VERIFIED') col = ensureColumn_(sheet, headers, 'DELIVERY OTP VERIFIED');
        if (!col && key === 'PAYMENT_RECEIVED_MODE') col = ensureColumn_(sheet, headers, 'PAYMENT RECEIVED MODE');
        if (!col && key === 'PAYMENT_RECEIVED_REF') col = ensureColumn_(sheet, headers, 'PAYMENT RECEIVED REF');
        if (!col && key === 'PAYMENT_RECEIVED_AMOUNT') col = ensureColumn_(sheet, headers, 'PAYMENT RECEIVED AMOUNT');
        if (!col && key === 'PAYMENT_RECEIVED_AT') col = ensureColumn_(sheet, headers, 'PAYMENT RECEIVED AT');
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
    customerPhone: onlyDigits_(accessor.read(row, 'MOBILE') || accessor.read(row, 'WHATSAPP')).slice(-10),
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
    orderDate: String(accessor.read(row, 'ORDER_DATE') || ''),
    deliveryDate: String(accessor.read(row, 'DELIVERY_DATE') || ''),
    updatedAt: new Date().toISOString(),
    photoUrl: String(accessor.read(row, 'DELIVERY_PHOTO') || ''),
    deliveryOtpSentStatus: String(accessor.read(row, 'DELIVERY_OTP_SENT_STATUS') || ''),
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

function normalizeReceivedPaymentMode_(mode, amount) {
  const normalized = normalizeText_(mode);
  if (normalized.indexOf('UPI') !== -1) return 'UPI QR';
  if (normalized.indexOf('PREPAID') !== -1 || normalized.indexOf('PAID') !== -1) return 'Prepaid';
  if (normalized.indexOf('CASH') !== -1) return 'Cash';
  return Number(amount || 0) > 0 ? 'Cash' : 'Prepaid';
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getOrderSheet_() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(ORDERS_SHEET_NAME);
  if (!sheet) throw new Error('Orders sheet not found: ' + ORDERS_SHEET_NAME);
  return sheet;
}

function getOrderRowContextById_(orderId) {
  const sheet = getOrderSheet_();
  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('Orders sheet is empty');
  const headers = values[0];
  const accessor = buildAccessor_(headers);
  const orderHeader = accessor.resolve('ORDER_NO');
  const orderCol = orderHeader ? headers.indexOf(orderHeader) : -1;
  if (orderCol === -1) throw new Error('ORDER NO column missing');

  const targetOrder = String(orderId || '').replace('#', '').trim();
  for (let i = 1; i < values.length; i += 1) {
    const rowOrder = String(values[i][orderCol] || '').replace('#', '').trim();
    if (rowOrder === targetOrder) {
      return {
        sheet: sheet,
        headers: headers,
        accessor: accessor,
        row: values[i],
        rowNumber: i + 1,
      };
    }
  }
  throw new Error('Order not found: ' + orderId);
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
      const district = normalizeText_(orderAccessor.read(row, 'DISTRICT'));
      if (!product) return;
      const keys = [];
      if (partner) keys.push(product + '|PARTNER|' + partner);
      if (district) keys.push(product + '|LOCATION|' + district);
      if (!keys.length) return;
      const qty = Number(orderAccessor.read(row, 'QTY') || 1);
      const deliveryStatus = String(orderAccessor.read(row, 'DELIVERY_COUNTED') || '').toUpperCase();
      const remarks = String(orderAccessor.read(row, 'REMARKS') || '').toUpperCase();
      keys.forEach((key) => {
        if (!orderUsage[key]) orderUsage[key] = { deliveredQty: 0, pendingQty: 0, failedQty: 0 };
        if (deliveryStatus === 'DONE') {
          orderUsage[key].deliveredQty += qty;
        } else if (deliveryStatus === 'FAILED' || remarks.indexOf('FAILED:') === 0 || remarks.indexOf('CANCEL') !== -1 || remarks.indexOf('RTO') !== -1) {
          orderUsage[key].failedQty += qty;
        } else {
          orderUsage[key].pendingQty += qty;
        }
      });
    });
  }

  const stockByPartner = {};
  stockValues.forEach((row) => {
    const productName = String(stockAccessor.read(row, 'PRODUCT') || '').trim();
    const partnerName = String(stockAccessor.read(row, 'POSTMAN') || '').trim();
    const locationName = String(stockAccessor.read(row, 'LOCATION') || '').trim();
    if (!productName && !partnerName && !locationName) return;
    const qtySent = Number(stockAccessor.read(row, 'QTY_SENT') || 0);
    if (!qtySent) return;
    const productKey = normalizeText_(productName || 'Unknown Product');
    const scopeType = partnerName ? 'PARTNER' : 'LOCATION';
    const scopeName = partnerName || locationName || 'Unassigned';
    const scopeKey = normalizeText_(scopeName);
    const stockKey = productKey + '|' + scopeType + '|' + scopeKey;
    if (!stockByPartner[stockKey]) {
      stockByPartner[stockKey] = {
        productKey: productKey,
        scopeType: scopeType,
        scopeKey: scopeKey,
        productName: productName || 'Unknown Product',
        partnerName: scopeName,
        sku: String(stockAccessor.read(row, 'SKU') || makeSku_(productName)).trim(),
        phone: onlyDigits_(stockAccessor.read(row, 'POSTMAN_NUMBER')),
        district: String(stockAccessor.read(row, 'DISTRICT') || locationName).trim(),
        qtySent: 0,
      };
    }
    stockByPartner[stockKey].qtySent += qtySent;
  });

  const stockByProduct = {};
  Object.keys(stockByPartner).forEach((stockKey) => {
    const line = stockByPartner[stockKey];
    const usage = orderUsage[line.productKey + '|' + line.scopeType + '|' + line.scopeKey] || { deliveredQty: 0, pendingQty: 0, failedQty: 0 };

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
      scopeType: line.scopeType,
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

function addStockDispatch_(body, token) {
  assertAdminToken_(token);
  const product = String(body.product || '').trim();
  const qty = Number(body.quantity || body.qty || 0);
  const partnerName = String(body.partnerName || '').trim();
  const partnerPhone = onlyDigits_(body.partnerPhone).slice(-10);
  const district = String(body.district || body.location || '').trim();
  const notes = String(body.notes || '').trim();
  if (!product) throw new Error('Product required');
  if (!qty || qty <= 0) throw new Error('Quantity required');
  if (!partnerName && !district) throw new Error('Partner or district required');

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(STOCK_MASTER_SHEET_NAME) || ss.insertSheet(STOCK_MASTER_SHEET_NAME);
  ensureStockMasterDispatchColumns_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const stockAccessor = buildAccessorFromAliases_(headers, STOCK_COLUMN_ALIASES);
  const productHeader = stockAccessor.resolve('PRODUCT') || ensureStockColumn_(sheet, headers, 'PRODUCT');
  const qtyHeader = stockAccessor.resolve('QTY_SENT') || ensureStockColumn_(sheet, headers, 'QUANTITY');
  const dateHeader = stockAccessor.resolve('DATE') || ensureStockColumn_(sheet, headers, 'DATE');
  const locationHeader = stockAccessor.resolve('LOCATION') || stockAccessor.resolve('DISTRICT') || ensureStockColumn_(sheet, headers, 'LOCATION');
  const skuHeader = stockAccessor.resolve('SKU');
  const partnerHeader = stockAccessor.resolve('POSTMAN');
  const partnerPhoneHeader = stockAccessor.resolve('POSTMAN_NUMBER');
  const districtHeader = stockAccessor.resolve('DISTRICT');
  const notesHeader = stockAccessor.resolve('NOTES');
  const rowByHeader = {
    [String(dateHeader).trim().toUpperCase()]: new Date(),
    [String(productHeader).trim().toUpperCase()]: product,
    [String(qtyHeader).trim().toUpperCase()]: qty,
    [String(locationHeader).trim().toUpperCase()]: district || partnerName,
  };
  if (skuHeader) rowByHeader[String(skuHeader).trim().toUpperCase()] = makeSku_(product);
  if (partnerHeader) rowByHeader[String(partnerHeader).trim().toUpperCase()] = partnerName;
  if (partnerPhoneHeader) rowByHeader[String(partnerPhoneHeader).trim().toUpperCase()] = partnerPhone;
  if (districtHeader) rowByHeader[String(districtHeader).trim().toUpperCase()] = district;
  if (notesHeader) rowByHeader[String(notesHeader).trim().toUpperCase()] = notes;
  const row = headers.map((header) => {
    const key = String(header || '').trim().toUpperCase();
    return Object.prototype.hasOwnProperty.call(rowByHeader, key) ? rowByHeader[key] : '';
  });
  sheet.appendRow(row);
  return { added: true };
}

function ensureStockMasterDispatchColumns_(sheet) {
  if (sheet.getLastRow() === 0 || !String(sheet.getRange(1, 1).getValue() || '').trim()) {
    sheet.getRange(1, 1, 1, 4).setValues([['PRODUCT', 'QUANTITY', 'DATE', 'LOCATION']]);
  }
  const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  const accessor = buildAccessorFromAliases_(headers, STOCK_COLUMN_ALIASES);
  if (!accessor.resolve('PRODUCT')) ensureStockColumn_(sheet, headers, 'PRODUCT');
  if (!accessor.resolve('QTY_SENT')) ensureStockColumn_(sheet, headers, 'QUANTITY');
  if (!accessor.resolve('DATE')) ensureStockColumn_(sheet, headers, 'DATE');
  if (!accessor.resolve('LOCATION') && !accessor.resolve('DISTRICT')) ensureStockColumn_(sheet, headers, 'LOCATION');
  sheet.setFrozenRows(1);
}

function ensureStockColumn_(sheet, headers, columnName) {
  const col = headers.length + 1;
  sheet.getRange(1, col).setValue(columnName);
  headers.push(columnName);
  return columnName;
}

function getDpMasterPartners_(includePhone) {
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
      phone: includePhone ? phone.slice(-10) : '',
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
    'PAYMENT PROOF',
    'ASSIGNED COD',
    'COLLECTED COD',
    'COMMISSION AMOUNT',
    'PAYABLE AMOUNT',
    'REMAINING COD',
    'COD ORDER COUNT',
    'DELIVERED COD COUNT',
    'PENDING COD COUNT',
    'SOURCE',
    'STATUS',
    'REQUESTED AMOUNT',
    'APPROVED AMOUNT',
    'APPROVED BY',
    'APPROVED AT',
    'ADMIN NOTES',
  ];

  const currentFirstCell = String(sheet.getRange(1, 1).getValue() || '').trim().toUpperCase();
  if (sheet.getLastRow() > 0 && currentFirstCell) {
    if (currentFirstCell !== 'TIMESTAMP') sheet.insertRowBefore(1);
  }
  if (String(sheet.getRange(1, 1).getValue() || '').trim().toUpperCase() !== 'TIMESTAMP') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
    const existingUpper = existingHeaders.map((header) => String(header || '').trim().toUpperCase());
    headers.forEach((header) => {
      if (existingUpper.indexOf(header) === -1) {
        const col = sheet.getLastColumn() + 1;
        sheet.getRange(1, col).setValue(header);
        existingUpper.push(header);
      }
    });
  }
  sheet.setFrozenRows(1);
}

function getPaymentLogSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(PAYMENT_LOG_SHEET_NAME) || ss.insertSheet(PAYMENT_LOG_SHEET_NAME);
}

function getPaymentLogData_() {
  const sheet = getPaymentLogSheet_();
  ensurePaymentLogHeader_(sheet);
  const values = sheet.getDataRange().getValues();
  const headers = values.length ? values[0] : [];
  const indexByHeader = buildHeaderIndex_(headers);
  return { sheet: sheet, headers: headers, values: values, indexByHeader: indexByHeader };
}

function appendPaymentLogRow_(sheet, rowByHeader) {
  ensurePaymentLogHeader_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map((header) => {
    const key = String(header || '').trim().toUpperCase();
    return Object.prototype.hasOwnProperty.call(rowByHeader, key) ? rowByHeader[key] : '';
  });
  sheet.appendRow(row);
}

function buildHeaderIndex_(headers) {
  const indexByHeader = {};
  headers.forEach((header, index) => {
    indexByHeader[String(header || '').trim().toUpperCase()] = index;
  });
  return indexByHeader;
}

function ensureLogColumn_(sheet, headers, indexByHeader, header) {
  const key = String(header || '').trim().toUpperCase();
  if (indexByHeader[key] !== undefined) return indexByHeader[key];
  const col = headers.length;
  sheet.getRange(1, col + 1).setValue(key);
  headers.push(key);
  indexByHeader[key] = col;
  return col;
}

function readLogValue_(row, indexByHeader, header) {
  const index = indexByHeader[String(header || '').trim().toUpperCase()];
  return index === undefined ? '' : row[index];
}

function assertAdminToken_(token) {
  assertToken_(token);
  if (String(token).indexOf('admin-') !== 0) throw new Error('Admin access required');
}

function getApproverFromToken_(token) {
  return String(token || '').replace('admin-', '').trim() || 'admin';
}

function calculateCodSettlementSummary_(filter) {
  const targetPhone = onlyDigits_(filter && filter.partnerPhone).slice(-10);
  const targetName = normalizeText_(filter && filter.partnerName);
  const targetDistrict = normalizeText_(filter && filter.district);
  const values = getOrderSheet_().getDataRange().getValues();
  if (!values.length) return emptyCodSettlementSummary_();
  const headers = values.shift();
  const accessor = buildAccessor_(headers);
  const summary = emptyCodSettlementSummary_();

  values.forEach((row) => {
    if (!orderMatchesPartnerFilter_(row, accessor, targetPhone, targetName, targetDistrict)) return;
    const paymentType = normalizePaymentMode_(accessor.read(row, 'PAYMENT_MODE'), accessor.read(row, 'AMOUNT'));
    if (paymentType !== 'COD') return;

    const amount = Number(accessor.read(row, 'AMOUNT') || 0);
    const deliveryStatus = normalizeText_(accessor.read(row, 'DELIVERY_COUNTED'));
    summary.assignedCod += amount;
    summary.codOrderCount += 1;

    if (deliveryStatus === 'DONE') {
      const receivedMode = normalizeText_(accessor.read(row, 'PAYMENT_RECEIVED_MODE'));
      const receivedAmount = Number(accessor.read(row, 'PAYMENT_RECEIVED_AMOUNT') || accessor.read(row, 'RCVD_AMOUNT') || amount || 0);
      summary.deliveredCodCount += 1;
      if (receivedMode.indexOf('UPI') !== -1) {
        summary.upiCollected += receivedAmount;
      } else {
        summary.cashCollected += receivedAmount;
        summary.commissionEarned += getCodCommission_(amount);
      }
    } else {
      summary.pendingCodCount += 1;
    }
  });

  applyPaymentLogTotals_(summary, targetPhone, targetName, targetDistrict);
  summary.payableBeforeSettlement = Math.max(0, summary.cashCollected - summary.commissionEarned);
  summary.cashInHand = Math.max(0, summary.payableBeforeSettlement - summary.approvedSettled - summary.pendingSettlement);
  return summary;
}

function emptyCodSettlementSummary_() {
  return {
    assignedCod: 0,
    cashCollected: 0,
    upiCollected: 0,
    commissionEarned: 0,
    payableBeforeSettlement: 0,
    approvedSettled: 0,
    pendingSettlement: 0,
    cashInHand: 0,
    codOrderCount: 0,
    deliveredCodCount: 0,
    pendingCodCount: 0,
  };
}

function orderMatchesPartnerFilter_(row, accessor, targetPhone, targetName, targetDistrict) {
  const partnerPhone = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER')).slice(-10);
  const partnerName = normalizeText_(accessor.read(row, 'POSTMAN'));
  const district = normalizeText_(accessor.read(row, 'DISTRICT'));
  const partnerOk = targetPhone ? partnerPhone === targetPhone : (!targetName || partnerName === targetName);
  const districtOk = !targetDistrict || district === targetDistrict || targetDistrict === 'ALL';
  return partnerOk && districtOk;
}

function applyPaymentLogTotals_(summary, targetPhone, targetName, targetDistrict) {
  const data = getPaymentLogData_();
  data.values.slice(1).forEach((row) => {
    if (!paymentLogMatchesPartnerFilter_(row, data.indexByHeader, targetPhone, targetName, targetDistrict)) return;
    const status = normalizeSettlementStatus_(readLogValue_(row, data.indexByHeader, 'STATUS'));
    const requested = Number(readLogValue_(row, data.indexByHeader, 'REQUESTED AMOUNT') || readLogValue_(row, data.indexByHeader, 'SETTLEMENT AMOUNT') || 0);
    const approved = Number(readLogValue_(row, data.indexByHeader, 'APPROVED AMOUNT') || 0);
    const legacyAmount = Number(readLogValue_(row, data.indexByHeader, 'SETTLEMENT AMOUNT') || 0);

    if (status === 'PENDING') {
      summary.pendingSettlement += requested;
    } else if (status === 'APPROVED') {
      summary.approvedSettled += approved || legacyAmount;
    } else if (!status && legacyAmount > 0) {
      summary.approvedSettled += legacyAmount;
    }
  });
}

function paymentLogMatchesPartnerFilter_(row, indexByHeader, targetPhone, targetName, targetDistrict) {
  const partnerPhone = onlyDigits_(readLogValue_(row, indexByHeader, 'DELIVERY PARTNER NUMBER')).slice(-10);
  const partnerName = normalizeText_(readLogValue_(row, indexByHeader, 'DELIVERY PARTNER NAME'));
  const district = normalizeText_(readLogValue_(row, indexByHeader, 'DISTRICT'));
  const partnerOk = targetPhone ? partnerPhone === targetPhone : (!targetName || partnerName === targetName);
  const districtOk = !targetDistrict || district === targetDistrict || targetDistrict === 'ALL';
  return partnerOk && districtOk;
}

function normalizeSettlementStatus_(value) {
  const status = normalizeText_(value);
  if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') return status;
  return '';
}

function paymentLogRowToSettlement_(row, indexByHeader) {
  const settlementId = String(readLogValue_(row, indexByHeader, 'SETTLEMENT ID') || '').trim();
  if (!settlementId) return null;
  const status = normalizeSettlementStatus_(readLogValue_(row, indexByHeader, 'STATUS')) || 'APPROVED';
  const partnerName = String(readLogValue_(row, indexByHeader, 'DELIVERY PARTNER NAME') || '').trim();
  const partnerPhone = onlyDigits_(readLogValue_(row, indexByHeader, 'DELIVERY PARTNER NUMBER')).slice(-10);
  const district = String(readLogValue_(row, indexByHeader, 'DISTRICT') || '').trim();
  const summary = calculateCodSettlementSummary_({
    partnerName: partnerName,
    partnerPhone: partnerPhone,
    district: district,
  });
  const rowCashInHand = Number(readLogValue_(row, indexByHeader, 'REMAINING COD') || 0);
  const rowCommission = Number(readLogValue_(row, indexByHeader, 'COMMISSION AMOUNT') || 0);
  const rowPayable = Number(readLogValue_(row, indexByHeader, 'PAYABLE AMOUNT') || 0);
  return {
    settlementId: settlementId,
    timestamp: formatLogDate_(readLogValue_(row, indexByHeader, 'TIMESTAMP')),
    partnerName: partnerName,
    partnerPhone: partnerPhone,
    district: district,
    requestedAmount: Number(readLogValue_(row, indexByHeader, 'REQUESTED AMOUNT') || readLogValue_(row, indexByHeader, 'SETTLEMENT AMOUNT') || 0),
    approvedAmount: Number(readLogValue_(row, indexByHeader, 'APPROVED AMOUNT') || readLogValue_(row, indexByHeader, 'SETTLEMENT AMOUNT') || 0),
    method: String(readLogValue_(row, indexByHeader, 'METHOD') || '').trim(),
    reference: String(readLogValue_(row, indexByHeader, 'REFERENCE') || '').trim(),
    paymentProofUrl: String(readLogValue_(row, indexByHeader, 'PAYMENT PROOF') || '').trim(),
    status: status,
    cashInHand: rowCashInHand || summary.cashInHand,
    commissionEarned: rowCommission || summary.commissionEarned,
    payableBeforeSettlement: rowPayable || summary.payableBeforeSettlement,
    approvedBy: String(readLogValue_(row, indexByHeader, 'APPROVED BY') || '').trim(),
    approvedAt: formatLogDate_(readLogValue_(row, indexByHeader, 'APPROVED AT')),
    adminNotes: String(readLogValue_(row, indexByHeader, 'ADMIN NOTES') || '').trim(),
  };
}

function formatLogDate_(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value || '').trim();
}

function logDeliveredOrder_(orderId, body, updates, photoUrl, billResult) {
  try {
    const rowContext = getOrderRowContextById_(orderId);
    const order = rowContext.row;
    const accessor = rowContext.accessor;
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const logSheet = ss.getSheetByName(DELIVERY_LOG_SHEET_NAME) || ss.insertSheet(DELIVERY_LOG_SHEET_NAME);
    ensureDeliveryLogHeader_(logSheet);

    const existing = logSheet.getDataRange().getValues();
    for (let i = 1; i < existing.length; i += 1) {
      const loggedOrder = String(existing[i][1] || '').replace('#', '').trim();
      if (loggedOrder === String(orderId || '').replace('#', '').trim()) return;
    }

    logSheet.appendRow([
      new Date(),
      String(accessor.read(order, 'ORDER_NO') || '').replace('#', '').trim(),
      String(accessor.read(order, 'CUSTOMER_NAME') || '').trim(),
      onlyDigits_(accessor.read(order, 'MOBILE')).slice(-10),
      onlyDigits_(accessor.read(order, 'WHATSAPP')).slice(-10),
      String(accessor.read(order, 'ADDRESS') || '').trim(),
      String(accessor.read(order, 'PIN_CODE') || '').trim(),
      String(accessor.read(order, 'DISTRICT') || '').trim(),
      String(accessor.read(order, 'PRODUCT') || '').trim(),
      Number(accessor.read(order, 'QTY') || 1),
      Number(accessor.read(order, 'AMOUNT') || 0),
      String(accessor.read(order, 'PAYMENT_MODE') || '').trim(),
      updates.PAYMENT_RECEIVED_MODE || '',
      updates.PAYMENT_RECEIVED_AMOUNT || 0,
      body.paymentReference || '',
      updates.DELIVERY_DATE || '',
      String(accessor.read(order, 'POSTMAN') || '').trim(),
      onlyDigits_(accessor.read(order, 'POSTMAN_NUMBER')).slice(-10),
      'DONE',
      String(accessor.read(order, 'DELIVERY_OTP') || '').trim(),
      updates.DELIVERY_OTP_VERIFIED || '',
      photoUrl || String(accessor.read(order, 'DELIVERY_PHOTO') || ''),
      billResult && billResult.billUrl ? billResult.billUrl : String(accessor.read(order, 'BILL_LINK') || ''),
      billResult && billResult.whatsApp && billResult.whatsApp.sent ? 'SENT' : '',
      String(accessor.read(order, 'REMARKS') || '').trim(),
      'mobile-app',
    ]);
  } catch (err) {
    Logger.log('Delivery log skipped/failed for order ' + orderId + ': ' + String(err && err.message ? err.message : err));
  }
}

function ensureDeliveryLogHeader_(sheet) {
  const headers = [
    'TIMESTAMP',
    'ORDER NO',
    'CUSTOMER NAME',
    'MOBILE NUMBER',
    'WHATSAPP NUMBER',
    'ADDRESS',
    'PIN CODE',
    'DISTRICT',
    'PRODUCT',
    'QUANTITY',
    'ORDER AMOUNT',
    'ORDER PAYMENT MODE',
    'PAYMENT RECEIVED MODE',
    'PAYMENT RECEIVED AMOUNT',
    'PAYMENT RECEIVED REF',
    'DELIVERY DATE',
    'DELIVERY PARTNER NAME',
    'DELIVERY PARTNER NUMBER',
    'DELIVERY STATUS',
    'DELIVERY OTP',
    'DELIVERY OTP VERIFIED',
    'DELIVERY PHOTO',
    'BILL LINK',
    'BILL WHATSAPP STATUS',
    'REMARKS',
    'SOURCE',
  ];

  const currentFirstCell = String(sheet.getRange(1, 1).getValue() || '').trim().toUpperCase();
  if (currentFirstCell === 'TIMESTAMP') return;
  if (sheet.getLastRow() > 0 && currentFirstCell) sheet.insertRowBefore(1);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function setupBillTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'generateBillOnEdit')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('generateBillOnEdit')
    .forSpreadsheet(SpreadsheetApp.openById(SHEET_ID))
    .onEdit()
    .create();

  return { installed: true, handler: 'generateBillOnEdit' };
}

function sendDeliveryOtpByOrderId_(orderId, token) {
  assertToken_(token);
  const sheet = getOrderSheet_();
  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('Orders sheet is empty');
  const headers = values[0];
  const accessor = buildAccessor_(headers);
  const orderHeader = accessor.resolve('ORDER_NO');
  const orderCol = orderHeader ? headers.indexOf(orderHeader) : -1;
  if (orderCol === -1) throw new Error('ORDER NO column missing');

  const targetOrder = String(orderId || '').replace('#', '').trim();
  for (let i = 1; i < values.length; i += 1) {
    const rowOrder = String(values[i][orderCol] || '').replace('#', '').trim();
    if (rowOrder === targetOrder) {
      return sendDeliveryOtpForRow_(sheet, i + 1, accessor);
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function sendDeliveryOtpForRow_(sheet, rowNumber, accessor) {
  if (!AISENSY_API_KEY) throw new Error('DB_AISENSY_API_KEY missing');
  const headers = accessor.headers;
  const otpCol = ensureResolvedColumn_(sheet, headers, accessor, 'DELIVERY_OTP', 'DELIVERY OTP');
  const statusCol = ensureResolvedColumn_(sheet, headers, accessor, 'DELIVERY_OTP_SENT_STATUS', 'DELIVERY OTP SENT STATUS');
  const responseCol = ensureResolvedColumn_(sheet, headers, accessor, 'DELIVERY_OTP_SENT_RESPONSE', 'DELIVERY OTP SENT RESPONSE');

  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  const customerName = String(accessor.read(row, 'CUSTOMER_NAME') || '').trim() || 'Customer';
  const partnerName = String(accessor.read(row, 'POSTMAN') || '').trim() || 'Delivery Partner';
  const partnerNumber = onlyDigits_(accessor.read(row, 'POSTMAN_NUMBER')).slice(-10);
  const product = String(accessor.read(row, 'PRODUCT') || '').trim();
  const amount = String(accessor.read(row, 'AMOUNT') || '').trim();
  const orderNo = String(accessor.read(row, 'ORDER_NO') || '').replace('#', '').trim();
  const phone = onlyDigits_(accessor.read(row, 'WHATSAPP') || accessor.read(row, 'MOBILE')).slice(-10);
  if (!phone || phone.length !== 10) throw new Error('Customer WhatsApp/mobile number missing');

  let otp = onlyDigits_(sheet.getRange(rowNumber, otpCol).getValue()).slice(-6);
  if (!otp || otp.length !== 6) {
    otp = generateDeliveryOtp_();
    sheet.getRange(rowNumber, otpCol).setValue(otp);
  }

  const payload = {
    apiKey: AISENSY_API_KEY,
    campaignName: AISENSY_DELIVERY_OTP_CAMPAIGN_NAME,
    destination: '+91' + phone,
    userName: customerName,
    source: 'dynamic-bazar-app',
    templateParams: [partnerName, partnerNumber, product, amount, otp],
    tags: ['delivery-otp'],
    attributes: {
      order_no: orderNo,
      delivery_partner: partnerName,
      partner_number: partnerNumber,
      product: product,
      amount: amount,
    },
  };

  const response = UrlFetchApp.fetch(AISENSY_API_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) {
    sheet.getRange(rowNumber, statusCol).setValue('ERROR');
    sheet.getRange(rowNumber, responseCol).setValue(truncate_('AiSensy HTTP ' + code + ': ' + text, 450));
    throw new Error('AiSensy HTTP ' + code + ': ' + text);
  }

  sheet.getRange(rowNumber, statusCol).setValue('SENT');
  sheet.getRange(rowNumber, responseCol).setValue(truncate_(text, 450));
  return { sent: true, orderId: orderNo, statusCode: code };
}

function verifyDeliveryOtpByOrderId_(orderId, inputOtp) {
  const sheet = getOrderSheet_();
  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('Orders sheet is empty');
  const headers = values[0];
  const accessor = buildAccessor_(headers);
  const orderHeader = accessor.resolve('ORDER_NO');
  const orderCol = orderHeader ? headers.indexOf(orderHeader) : -1;
  const otpHeader = accessor.resolve('DELIVERY_OTP');
  const otpCol = otpHeader ? headers.indexOf(otpHeader) : -1;
  if (orderCol === -1) throw new Error('ORDER NO column missing');
  if (otpCol === -1) throw new Error('Delivery OTP not generated for this order');

  const targetOrder = String(orderId || '').replace('#', '').trim();
  const otp = onlyDigits_(inputOtp).slice(-6);
  if (!otp || otp.length !== 6) throw new Error('Valid 6-digit delivery OTP required');

  for (let i = 1; i < values.length; i += 1) {
    const rowOrder = String(values[i][orderCol] || '').replace('#', '').trim();
    if (rowOrder === targetOrder) {
      const storedOtp = onlyDigits_(values[i][otpCol]).slice(-6);
      if (!storedOtp) throw new Error('Delivery OTP not generated for this order');
      if (storedOtp !== otp) throw new Error('Invalid delivery OTP');
      return true;
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function generateBillOnEdit(e) {
  try {
    const sheet = e.range.getSheet();
    if (sheet.getName() !== ORDERS_SHEET_NAME) return;
    if (e.range.getRow() <= 1) return;

    const values = sheet.getDataRange().getValues();
    if (!values.length) return;
    const headers = values[0];
    const accessor = buildAccessor_(headers);
    const editedCol = e.range.getColumn();
    const deliveryDateCol = getResolvedColumnNumber_(headers, accessor, 'DELIVERY_DATE');
    const deliveryStatusCol = getResolvedColumnNumber_(headers, accessor, 'DELIVERY_COUNTED');
    const editedDeliveryDate = deliveryDateCol && editedCol === deliveryDateCol;
    const editedDeliveryStatus = deliveryStatusCol && editedCol === deliveryStatusCol;
    if (!editedDeliveryDate && !editedDeliveryStatus) return;

    const value = String(e.value || '').trim();
    if (!value) return;
    if (editedDeliveryStatus && normalizeText_(value) !== 'DONE') return;

    generateBillAndNotifyForRow_(sheet, e.range.getRow(), accessor);
  } catch (err) {
    Logger.log('generateBillOnEdit ERROR: ' + String(err && err.message ? err.message : err));
  }
}

function tryGenerateBillByOrderId_(orderId) {
  try {
    const result = generateBillByOrderIdInternal_(orderId);
    return { billUrl: result.billUrl || '', whatsApp: result.whatsApp || null };
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    Logger.log('Bill auto-generation skipped/failed for order ' + orderId + ': ' + message);
    return { error: message };
  }
}

function generateBillByOrderId_(orderId, token) {
  assertToken_(token);
  if (String(token).indexOf('admin-') !== 0) throw new Error('Admin access required');
  return generateBillByOrderIdInternal_(orderId);
}

function generateBillByOrderIdInternal_(orderId) {
  const sheet = getOrderSheet_();
  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('Orders sheet is empty');
  const headers = values[0];
  const accessor = buildAccessor_(headers);
  const orderHeader = accessor.resolve('ORDER_NO');
  const orderCol = orderHeader ? headers.indexOf(orderHeader) : -1;
  if (orderCol === -1) throw new Error('ORDER NO column missing');

  const targetOrder = String(orderId || '').replace('#', '').trim();
  for (let i = 1; i < values.length; i += 1) {
    const rowOrder = String(values[i][orderCol] || '').replace('#', '').trim();
    if (rowOrder === targetOrder) {
      return generateBillAndNotifyForRow_(sheet, i + 1, accessor);
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function generateBillAndNotifyForRow_(sheet, rowNumber, accessor) {
  const bill = generateBillForRow_(sheet, rowNumber, accessor);
  const whatsApp = trySendBillWhatsAppForRow_(sheet, rowNumber, accessor, bill.billUrl);
  bill.whatsApp = whatsApp;
  return bill;
}

function generateBillForRow_(sheet, rowNumber, accessor) {
  if (!BILL_TEMPLATE_ID) throw new Error('DB_BILL_TEMPLATE_ID missing');
  if (!BILL_FOLDER_ID) throw new Error('DB_BILL_FOLDER_ID missing');

  const headers = accessor.headers;
  let billLinkCol = getResolvedColumnNumber_(headers, accessor, 'BILL_LINK');
  if (!billLinkCol) billLinkCol = ensureColumn_(sheet, headers, 'BILL LINK');

  const existing = String(sheet.getRange(rowNumber, billLinkCol).getValue() || '');
  if (existing.indexOf('drive.google.com') !== -1) {
    return { generated: false, billUrl: existing, message: 'Bill already exists' };
  }

  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  const orderNo = String(accessor.read(row, 'ORDER_NO') || '').replace('#', '').trim();
  const customerName = String(accessor.read(row, 'CUSTOMER_NAME') || '').trim();
  if (!orderNo || !customerName) throw new Error('ORDER NO or customer name missing');

  const orderDate = accessor.read(row, 'ORDER_DATE');
  const dateText = formatBillDate_(orderDate);
  const product = String(accessor.read(row, 'PRODUCT') || '').trim();
  const quantity = String(accessor.read(row, 'QTY') || 1);
  const amount = String(accessor.read(row, 'AMOUNT') || 0);
  const paymentMode = String(accessor.read(row, 'PAYMENT_MODE') || '').trim();

  const replacements = {
    '{{BILL NUMBER}}': orderNo,
    '{{DATE}}': dateText,
    '{{NAME}}': customerName,
    '{{P. MODE}}': paymentMode,
    '{{ITEM}}': product,
    '{{QTY}}': quantity,
    '{{AMT1}}': amount,
  };

  const folder = DriveApp.getFolderById(BILL_FOLDER_ID);
  const safeName = customerName.replace(/[^A-Za-z0-9]/g, '_');
  const copyName = 'BILL_' + orderNo + '_' + safeName;
  const slideCopy = DriveApp.getFileById(BILL_TEMPLATE_ID).makeCopy(copyName, folder);
  const slideId = slideCopy.getId();

  const presentation = SlidesApp.openById(slideId);
  presentation.getSlides().forEach((slide) => {
    Object.keys(replacements).forEach((placeholder) => {
      slide.replaceAllText(placeholder, String(replacements[placeholder]));
    });
  });
  presentation.saveAndClose();
  Utilities.sleep(800);

  const pdfBlob = DriveApp.getFileById(slideId)
    .getAs('application/pdf')
    .setName('Bill_' + orderNo + '_' + customerName.split(' ')[0] + '.pdf');
  const pdfFile = folder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const pdfUrl = pdfFile.getUrl();

  DriveApp.getFileById(slideId).setTrashed(true);
  sheet.getRange(rowNumber, billLinkCol)
    .setValue(pdfUrl)
    .setFontColor('#1565C0')
    .setFontStyle('normal')
    .setNote('Bill: ' + orderNo + ' | ' + customerName);

  return { generated: true, billUrl: pdfUrl };
}

function trySendBillWhatsAppForRow_(sheet, rowNumber, accessor, billUrl) {
  try {
    return sendBillWhatsAppForRow_(sheet, rowNumber, accessor, billUrl);
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    Logger.log('Bill WhatsApp skipped/failed for row ' + rowNumber + ': ' + message);
    writeBillWhatsAppStatus_(sheet, accessor, rowNumber, 'ERROR', message);
    return { sent: false, error: message };
  }
}

function sendBillWhatsAppForRow_(sheet, rowNumber, accessor, billUrl) {
  if (!AISENSY_API_KEY) return { sent: false, skipped: true, message: 'DB_AISENSY_API_KEY missing' };
  if (!billUrl) throw new Error('Bill PDF link missing');

  const headers = accessor.headers;
  const statusCol = ensureResolvedColumn_(sheet, headers, accessor, 'BILL_WHATSAPP_STATUS', 'BILL WHATSAPP STATUS');
  const existingStatus = normalizeText_(sheet.getRange(rowNumber, statusCol).getValue());
  if (existingStatus === 'SENT') return { sent: false, skipped: true, message: 'Bill WhatsApp already sent' };

  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  const customerName = String(accessor.read(row, 'CUSTOMER_NAME') || '').trim() || 'Customer';
  const product = String(accessor.read(row, 'PRODUCT') || '').trim();
  const orderNo = String(accessor.read(row, 'ORDER_NO') || '').replace('#', '').trim();
  const phone = onlyDigits_(accessor.read(row, 'WHATSAPP') || accessor.read(row, 'MOBILE')).slice(-10);
  if (!phone || phone.length !== 10) throw new Error('Customer WhatsApp/mobile number missing');

  const destination = '+91' + phone;
  const payload = {
    apiKey: AISENSY_API_KEY,
    campaignName: AISENSY_CAMPAIGN_NAME,
    destination: destination,
    userName: customerName,
    source: 'dynamic-bazar-app',
    media: {
      url: billUrl,
      filename: 'Bill_' + (orderNo || rowNumber) + '.pdf',
    },
    templateParams: [product],
    tags: ['bill-sent'],
    attributes: {
      order_no: orderNo,
      product: product,
      bill_url: billUrl,
    },
  };

  const response = UrlFetchApp.fetch(AISENSY_API_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('AiSensy HTTP ' + code + ': ' + text);
  }

  writeBillWhatsAppStatus_(sheet, accessor, rowNumber, 'SENT', truncate_(text, 450));
  return { sent: true, statusCode: code, response: text };
}

function writeBillWhatsAppStatus_(sheet, accessor, rowNumber, status, responseText) {
  const headers = accessor.headers;
  const statusCol = ensureResolvedColumn_(sheet, headers, accessor, 'BILL_WHATSAPP_STATUS', 'BILL WHATSAPP STATUS');
  const responseCol = ensureResolvedColumn_(sheet, headers, accessor, 'BILL_WHATSAPP_RESPONSE', 'BILL WHATSAPP RESPONSE');
  sheet.getRange(rowNumber, statusCol).setValue(status);
  sheet.getRange(rowNumber, responseCol).setValue(responseText || '');
}

function ensureResolvedColumn_(sheet, headers, accessor, logical, columnName) {
  const existing = getResolvedColumnNumber_(headers, accessor, logical);
  if (existing) return existing;
  const direct = headers
    .map((header) => String(header).trim().toUpperCase())
    .indexOf(String(columnName).trim().toUpperCase());
  if (direct !== -1) return direct + 1;
  return ensureColumn_(sheet, headers, columnName);
}

function getResolvedColumnNumber_(headers, accessor, logical) {
  const resolved = accessor.resolve(logical);
  return resolved ? headers.indexOf(resolved) + 1 : 0;
}

function formatBillDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd-MM-yyyy');
  }
  if (typeof value === 'number' && value > 40000) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd-MM-yyyy');
  }
  return String(value || '').trim();
}

function truncate_(value, maxLength) {
  const text = String(value || '');
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function getCodCommissionSlabs_() {
  if (COD_COMMISSION_SLABS_JSON) {
    try {
      const slabs = JSON.parse(COD_COMMISSION_SLABS_JSON);
      if (Array.isArray(slabs) && slabs.length) {
        return slabs.map((slab) => ({
          min: Number(slab.min || 0),
          max: Number(slab.max || 0),
          commission: Number(slab.commission || 0),
        })).filter((slab) => slab.max >= slab.min && slab.commission >= 0);
      }
    } catch (err) {
      throw new Error('Invalid DB_COD_COMMISSION_SLABS_JSON: ' + err.message);
    }
  }
  return DEFAULT_COD_COMMISSION_SLABS;
}

function getCodCommission_(amount) {
  const orderAmount = Number(amount || 0);
  if (!orderAmount || orderAmount <= 0) return 0;
  const slabs = getCodCommissionSlabs_().slice().sort((a, b) => a.min - b.min);
  for (let i = 0; i < slabs.length; i += 1) {
    if (orderAmount >= slabs[i].min && orderAmount <= slabs[i].max) return Number(slabs[i].commission || 0);
  }
  const last = slabs[slabs.length - 1];
  return last && orderAmount > last.max ? Number(last.commission || 0) : 0;
}

function generateDeliveryOtp_() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function findPartnerByPhone_(phone, body) {
  if (!phone) return null;
  const fromMaster = findPartnerByPhoneInMaster_(phone, body);
  if (fromMaster) return fromMaster;
  if (body && body.password) return null;

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

function findPartnerByPhoneInMaster_(phone, body) {
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
      const status = String(accessor.read(row, 'STATUS') || 'ACTIVE').trim();
      if (isCancelledStatus_(status)) return null;
      verifyLoginCredential_(body || {}, accessor.read(row, 'PASSWORD'));
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

function isCancelledStatus_(status) {
  const normalized = normalizeText_(status);
  return normalized.indexOf('CANCEL') !== -1 || normalized.indexOf('INACTIVE') !== -1 || normalized.indexOf('REMOVED') !== -1 || normalized === 'NO';
}
