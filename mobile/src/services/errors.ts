const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

export function getUserSafeErrorMessage(err: unknown, fallback = DEFAULT_MESSAGE): string {
  const message = err instanceof Error ? err.message : String(err || '');
  return getUserSafeMessageFromText(message, fallback);
}

export function getUserSafeMessageFromText(message: string, fallback = DEFAULT_MESSAGE): string {
  const text = String(message || '').trim();
  if (!text) return fallback;

  if (/missing token|invalid token|admin access required|order access denied/i.test(text)) {
    return 'Your login session is not valid. Logout and sign in again.';
  }
  if (/partner not found|invalid password|password required|password is not configured/i.test(text)) {
    return text;
  }
  if (/network request failed|failed to fetch|internet|network|timeout|offline/i.test(text)) {
    return 'Network issue. Check internet and try again.';
  }
  if (/orders sheet not found|sheet is empty|column missing|script|gas|apps script|spreadsheet/i.test(text)) {
    return 'Server setup issue. Contact admin and try again later.';
  }
  if (/order not found/i.test(text)) {
    return 'Order not found. Refresh orders and try again.';
  }
  if (/drive|folder|upload|proof/i.test(text)) {
    return 'Proof upload failed. Check internet and try again.';
  }
  if (/otp/i.test(text)) {
    return text;
  }
  if (/settlement amount cannot be greater|amount required|approved amount/i.test(text)) {
    return text;
  }
  if (/customer whatsapp|mobile number missing/i.test(text)) {
    return 'Customer phone number is missing. Contact admin.';
  }
  if (/aisensy|http \d{3}|firebase|fcm|credential|server key|private_key/i.test(text)) {
    return 'Notification or WhatsApp service is not configured correctly. Contact admin.';
  }

  return fallback;
}
