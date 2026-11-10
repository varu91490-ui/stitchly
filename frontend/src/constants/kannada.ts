/**
 * Kannada Language Dictionary & System Constants
 * 'ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ'
 */

export const APP_NAME = "ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ";
export const APP_TAGLINE = "ಕನ್ನಡ ಧ್ವನಿ ಆಧಾರಿತ ಟೈಲರಿಂಗ್ ಲೆಕ್ಕಪತ್ರ";

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: "ಹೊಸ ಆರ್ಡರ್", color: "text-blue-700", bg: "bg-blue-100 border-blue-300" },
  IN_PROGRESS: { label: "ಹೊಲಿಗೆ ನಡೆಯುತ್ತಿದೆ", color: "text-amber-700", bg: "bg-amber-100 border-amber-300" },
  READY: { label: "ಸಿದ್ಧವಾಗಿದೆ", color: "text-purple-700", bg: "bg-purple-100 border-purple-300" },
  DELIVERED: { label: "ವಿತರಿಸಲಾಗಿದೆ", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-300" },
  CANCELLED: { label: "ರದ್ದುಪಡಿಸಲಾಗಿದೆ", color: "text-gray-600", bg: "bg-gray-100 border-gray-300" },
};

export const PAYMENT_METHOD_MAP: Record<string, string> = {
  CASH: "ನಗದು (Cash)",
  UPI: "ಯುಪಿಐ / ಫೋನ್‌ಪೇ / ಗೂಗಲ್‌ಪೇ (UPI)",
  OTHER: "ಇತರೆ (Other)",
};

export const PAYMENT_TYPE_MAP: Record<string, string> = {
  ADVANCE: "ಮುಂಗಡ ಹಣ (Advance)",
  PARTIAL: "ಭಾಗಶಃ ಪಾವತಿ (Partial)",
  FULL: "ಸಂಪೂರ್ಣ ಪಾವತಿ (Full)",
  CORRECTION: "ತಿದ್ದುಪಡಿ (Correction)",
  REFUND: "ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ (Refund)",
};

export const GARMENT_OPTIONS = [
  "ಬ್ಲೌಸ್",
  "ಚೂಡಿದಾರ್",
  "ಸೀರೆ ಫಾಲ್ಸ್ / ಜಿಗ್ ಜ್ಯಾಗ್",
  "ಲಂಗ / ಲೆಹೆಂಗಾ",
  "ಕುರ್ತಿ / ಟಾಪ್",
  "ಗೌನ್ / ಫ್ರಾಕ್",
  "ಪ್ಯಾಂಟ್",
  "ಶರ್ಟ್",
  "ಇತರೆ"
];

export const EXPENSE_CATEGORIES = [
  "ವಿದ್ಯುತ್ ಬಿಲ್",
  "ಅಂಗಡಿ ಬಾಡಿಗೆ",
  "ದಾರ ಮತ್ತು ಸಾಮಗ್ರಿಗಳು",
  "ಯಂತ್ರ ರಿಪೇರಿ & ಆಯಿಲಿಂಗ್",
  "ಇತರೆ ಖರ್ಚುಗಳು"
];

export const VOICE_SAMPLE_COMMANDS = [
  "ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ",
  "ಒಟ್ಟು ಸಾವಿರ ರೂಪಾಯಿ",
  "ಐನೂರು ರೂಪಾಯಿ ಅಡ್ವಾನ್ಸ್",
  "ಹದಿನೈದನೇ ತಾರೀಖಿಗೆ ಕೊಡಬೇಕು",
  "ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?",
  "ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?",
  "ನಾಳೆ ಯಾರ ಬಟ್ಟೆ ಕೊಡಬೇಕು?"
];
