/**
 * Phone Number Normalization Utility for AURA Gastronomy
 * Unifies phone matching across Auth, Orders, and Loyalty
 */

function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.slice(-10);
}

function normalizePhoneQuery(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return [{ phone: null }];
  const digits = raw.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (!last10) return [{ phone: raw }];

  const set = new Set([
    raw,
    last10,
    `+91${last10}`,
    `91${last10}`,
    `+${digits}`,
    digits
  ]);

  return Array.from(set).map((p) => ({ phone: p }));
}

module.exports = {
  normalizePhone,
  normalizePhoneQuery
};
