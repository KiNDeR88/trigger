// constants.js
export const TRIGGER_TYPES = [
  "subscription", "confirmation", "welcome", "order",
  "abandoned-cart", "review-request", "birthday", "anniversary",
  "vip-customer", "new-registration", "loyalty"
];

export const ACTION_TYPES = [
  "send-email", "apply-discount", "bonus-action", "send-sms",
  "send-push", "send-whatsapp", "apply-free-shipping", "assign-coupon",
  "update-loyalty-points", "add-loyalty-points", "redeem-loyalty-points",
  "apply-loyalty-discount"
];

export const CONDITION_TYPES = [
  "if-no-order", "if-abandoned-cart", "route", "if-age-greater",
  "if-age-less", "if-location", "if-purchase-frequency",
  "if-cart-value-exceeds", "if-time-of-day", "if-visit-duration",
  "if-webhook-response", "if-inventory-low", "if-loyalty-points-exceed",
  "if-customer-tier"
];

export const emojiMapping = {
  "subscription": '📧',
  "confirmation": '✅',
  "welcome": '👋',
  "order": '🛒',
  "abandoned-cart": '🚫🛒',
  "review-request": '📝',
  "birthday": '🎂',
  "anniversary": '📆',
  "vip-customer": '⭐',
  "new-registration": '🆕',
  "loyalty": '🏆',
  "group": '📂',
};

export const ItemTypes = {
  BLOCK: 'block'
};