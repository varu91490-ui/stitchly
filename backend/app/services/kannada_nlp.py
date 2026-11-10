"""
Kannada Voice & Natural Language Processing Engine for Tailoring Management
Parses natural Kannada and Kannada-English mixed speech for:
- Customers (e.g. ಲಕ್ಷ್ಮಿ, ರಮ್ಯಾ, ಸುಧಾ, ಶಶಿಕಲಾ)
- Garments and quantities (ಬ್ಲೌಸ್, ಚೂಡಿದಾರ್, ಸೀರೆ ಫಾಲ್ಸ್, ಲಂಗ, ಕುರ್ತಿ, ಗೌನ್, etc.)
- Order total pricing & item-wise pricing
- Advance and partial payments
- Delivery dates (ನಾಳೆ, ದಿನಾಂಕ, ತಾರೀಖು, ವಾರಗಳು)
- Natural language voice queries
"""

import re
from datetime import datetime, timedelta, timezone, date
from decimal import Decimal
from typing import Optional, List, Dict, Any, Tuple

# Kannada word-to-number mapping
KANNADA_NUMBER_WORDS = {
    "ಅರ್ಧ": 0.5,
    "ಒಂದು": 1, "ಒಂದ್": 1, "ಒಂದು": 1, "one": 1, "1": 1,
    "ಎರಡು": 2, "ಎರಡ್": 2, "two": 2, "2": 2,
    "ಮೂರು": 3, "ಮೂರ್": 3, "three": 3, "3": 3,
    "ನಾಲ್ಕು": 4, "ನಾಕ್": 4, "four": 4, "4": 4,
    "ಐದು": 5, "ಐದ್": 5, "five": 5, "5": 5,
    "ಆರು": 6, "ಆರ್": 6, "six": 6, "6": 6,
    "ಏಳು": 7, "ಏಳ್": 7, "seven": 7, "7": 7,
    "ಎಂಟು": 8, "ಎಂಟ್": 8, "eight": 8, "8": 8,
    "ಒಂಬತ್ತು": 9, "ಒಂಭತ್ತು": 9, "nine": 9, "9": 9,
    "ಹತ್ತು": 10, "ಹತ್": 10, "ten": 10, "10": 10,
    "ಹನ್ನೊಂದು": 11, "ಹನ್ನೆರಡು": 12, "ಹದಿಮೂರು": 13, "ಹದಿನಾಲ್ಕು": 14,
    "ಹದಿನೈದು": 15, "ಹದಿನಾರು": 16, "ಹದಿನೇಳು": 17, "ಹದಿನೆಂಟು": 18,
    "ಹತ್ತೊಂಬತ್ತು": 19, "ಇಪ್ಪತ್ತು": 20, "ಇಪ್ಪತ್ತೈದು": 25, "ಮೂವತ್ತು": 30,
    "ಮೂವತ್ತೈದು": 35, "ನಲವತ್ತು": 40, "ನಲವತ್ತೈದು": 45, "ಐವತ್ತು": 50,
    "ಅರವತ್ತು": 60, "ಎಪ್ಪತ್ತು": 70, "ಎಂಬತ್ತು": 80, "ತೊಂಬತ್ತು": 90,
    "ನೂರು": 100, "ನೂರ್": 100, "ಇನ್ನೂರು": 200, "ಮುನ್ನೂರು": 300,
    "ನಾನೂರು": 400, "ಐನೂರು": 500, "ಆರುನೂರು": 600, "ಏಳುನೂರು": 700,
    "ಎಂಟುನೂರು": 800, "ಒಂಬೈನೂರು": 900,
    "ಸಾವಿರ": 1000, "ಸಾವ್ರ": 1000, "ಒಂದು ಸಾವಿರ": 1000,
    "ಎರಡು ಸಾವಿರ": 2000, "ಮೂರು ಸಾವಿರ": 3000, "ನಾಲ್ಕು ಸಾವಿರ": 4000, "ಐದು ಸಾವಿರ": 5000,
}

# Ordinal dates (1st to 31st in Kannada)
KANNADA_ORDINAL_DATES = {
    "ಒಂದನೇ": 1, "ಒಂದನೆ": 1, "1st": 1,
    "ಎರಡನೇ": 2, "ಎರಡನೆ": 2, "2nd": 2,
    "ಮೂರನೇ": 3, "ಮೂರನೆ": 3, "3rd": 3,
    "ನಾಲ್ಕನೇ": 4, "ನಾಲ್ಕನೆ": 4, "4th": 4,
    "ಐದನೇ": 5, "ಐದನೆ": 5, "5th": 5,
    "ಆರನೇ": 6, "ಆರನೆ": 6, "6th": 6,
    "ಏಳನೇ": 7, "ಏಳನೆ": 7, "7th": 7,
    "ಎಂಟನೇ": 8, "ಎಂಟನೆ": 8, "8th": 8,
    "ಒಂಬತ್ತನೇ": 9, "ಒಂಬತ್ತನೆ": 9, "9th": 9,
    "ಹತ್ತನೇ": 10, "ಹತ್ತನೆ": 10, "10th": 10,
    "ಹನ್ನೊಂದನೇ": 11, "ಹನ್ನೊಂದನೆ": 11,
    "ಹನ್ನೆರಡನೇ": 12, "ಹನ್ನೆರಡನೆ": 12,
    "ಹದಿಮೂರನೇ": 13, "ಹದಿಮೂರನೆ": 13,
    "ಹದಿನಾಲ್ಕನೇ": 14, "ಹದಿನಾಲ್ಕನೆ": 14,
    "ಹದಿನೈದನೇ": 15, "ಹದಿನೈದನೆ": 15, "15ನೇ": 15, "15th": 15,
    "ಹದಿನಾರನೇ": 16, "ಹದಿನಾರನೆ": 16,
    "ಹದಿನೇಳನೇ": 17, "ಹದಿನೇಳನೆ": 17,
    "ಹದಿನೆಂಟನೇ": 18, "ಹದಿನೆಂಟನೆ": 18,
    "ಹತ್ತೊಂಬತ್ತನೇ": 19, "ಹತ್ತೊಂಬತ್ತನೆ": 19,
    "ಇಪ್ಪತ್ತನೇ": 20, "ಇಪ್ಪತ್ತನೆ": 20, "20th": 20,
    "ಇಪ್ಪತ್ತೊಂದನೇ": 21, "ಇಪ್ಪತ್ತೆರಡನೇ": 22, "ಇಪ್ಪತ್ತೈದನೇ": 25,
    "ಮೂವತ್ತನೇ": 30, "ಮೂವತ್ತೊಂದನೇ": 31
}

# Garment name patterns
GARMENT_SYNONYMS = {
    "ಬ್ಲೌಸ್": ["ಬ್ಲೌಸ್", "ಬ್ಲೌಸು", "ಕುಪ್ಪಸ", "blouse", "blous", "blowse"],
    "ಚೂಡಿದಾರ್": ["ಚೂಡಿದಾರ್", "ಚುಡಿದಾರ್", "ಡ್ರೆಸ್", "churidar", "dress", "chudidar", "ಸುಟ್", "ಸಲ್ವಾರ್", "salwar"],
    "ಸೀರೆ ಫಾಲ್ಸ್": ["ಸೀರೆ ಫಾಲ್ಸ್", "ಫಾಲ್ಸ್", "ಜಿಗ್ ಜ್ಯಾಗ್", "ಜಿಗ್ ಜಾಗ್", "falls", "saree falls", "sari falls"],
    "ಲಂಗ": ["ಲಂಗ", "ಪಾಲ್ವಾಡೆ", "ಪಾಟಿ", "ಲೆಹೆಂಗಾ", "lehenga", "skirt", "langa"],
    "ಕುರ್ತಿ": ["ಕುರ್ತಿ", "ಕುರ್ತಾ", "ಟಾಪ್", "kurti", "kurta", "top"],
    "ಗೌನ್": ["ಗೌನ್", "ಫ್ರಾಕ್", "ಮ್ಯಾಕ್ಸಿ", "gown", "frock", "maxi"],
    "ಪ್ಯಾಂಟ್": ["ಪ್ಯಾಂಟ್", "ಪ್ಯಾಂಟು", "pant", "trousers"],
    "ಶರ್ಟ್": ["ಶರ್ಟ್", "ಶರ್ಟು", "ಅಂಗಿ", "shirt"]
}

DAYS_OF_WEEK = {
    "ಸೋಮವಾರ": 0, "monday": 0,
    "ಮಂಗಳವಾರ": 1, "tuesday": 1,
    "ಬುಧವಾರ": 2, "wednesday": 2,
    "ಗುರುವಾರ": 3, "thursday": 3,
    "ಶುಕ್ರವಾರ": 4, "friday": 4,
    "ಶನಿವಾರ": 5, "saturday": 5,
    "ಭಾನುವಾರ": 6, "sunday": 6
}

def normalize_text(text: str) -> str:
    """Clean text, unify spacing and lowercasing."""
    if not text:
        return ""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text

def parse_kannada_number_phrase(phrase: str) -> Optional[int]:
    """Extract integer amount from spoken Kannada or digit expression."""
    phrase = phrase.strip().lower()
    
    # Check direct digits
    digit_match = re.search(r"(\d+)", phrase)
    if digit_match:
        return int(digit_match.group(1))

    # Match compound words like "ಸಾವಿರ", "ಎರಡು ಸಾವಿರ", "ಐನೂರು"
    words = phrase.split()
    total = 0
    multiplier = 1

    # Check for direct phrase match
    if phrase in KANNADA_NUMBER_WORDS:
        val = KANNADA_NUMBER_WORDS[phrase]
        return int(val)

    for w in words:
        if w in KANNADA_NUMBER_WORDS:
            val = KANNADA_NUMBER_WORDS[w]
            if val == 1000:
                if total == 0:
                    total = 1000
                else:
                    total = total * 1000
            elif val >= 100:
                total += val
            else:
                total += val

    return total if total > 0 else None

def extract_customer_name(text: str) -> Optional[str]:
    """
    Extracts the customer name from natural Kannada phrases like:
    'ಲಕ್ಷ್ಮಿ ಎರಡು ಬ್ಲೌಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ' -> 'ಲಕ್ಷ್ಮಿ'
    'ರಮ್ಯಾ ಅವರ ಚೂಡಿದಾರ್' -> 'ರಮ್ಯಾ'
    'ಸುಧಾ ಗೆ ಒಂದು ಸೀರೆ' -> 'ಸುಧಾ'
    'ಕಸ್ಟಮರ್ ಶಾಂತಮ್ಮ' -> 'ಶಾಂತಮ್ಮ'
    """
    cleaned = normalize_text(text)
    
    # Common words that are NOT customer names
    stopwords = {
        "ಒಟ್ಟು", "ಸಾವಿರ", "ಐನೂರು", "ರೂಪಾಯಿ", "ಅಡ್ವಾನ್ಸ್", "ಮುಂಗಡ", "ಕೊಟ್ಟಿದ್ದಾರೆ",
        "ಕೊಡಬೇಕು", "ತಾರೀಖಿಗೆ", "ತಾರೀಖು", "ದಿನಾಂಕ", "ಇವತ್ತು", "ನಾಳೆ", "ನಾಡಿದ್ದು", "ಹಣ", "ಬಾಕಿ", "ಆರ್ಡರ್",
        "ಹೊಸ", "ಎರಡು", "ಮೂರು", "ನಾಲ್ಕು", "ಐದು", "ಆರು", "ಏಳು", "ಎಂಟು", "ಒಂಬತ್ತು", "ಹತ್ತು", "ಒಂದು",
        "ಬ್ಲೌಸ್", "ಚೂಡಿದಾರ್", "ಬಟ್ಟೆ", "ಬಟ್ಟೆಗಳು", "ಅವರು", "ಅವರ", "ಗೆ", "ನನಗೆ", "ಖಾತೆ", "ಖರ್ಚು",
        "ಬಂದಿದೆ", "ಬಂತು", "ಎಷ್ಟು", "ಯಾವಾಗ", "ಯಾರ", "ಇನ್ನೂ", "ಇದೆ", "ದಯವಿಟ್ಟು", "ಮಾಡಬೇಕು"
    }
    for ord_w in KANNADA_ORDINAL_DATES.keys():
        stopwords.add(ord_w)
    for num_w in KANNADA_NUMBER_WORDS.keys():
        stopwords.add(num_w)

    # Pattern: '<Name> ಅವರ...' or '<Name> ಕೊಟ್ಟಿದ್ದಾರೆ...' or '<Name> ಗೆ...'
    match = re.search(r"^([^\s\d]+?)(?:\s+ಅವರ|\s+ಗೆ|\s+ಹತ್ರ)?\s+(?:ಎರಡು|ಮೂರು|ನಾಲ್ಕು|ಐದು|ಒಂದು|\d+|ಬ್ಲೌಸ್|ಚೂಡಿದಾರ್|ಕೊಟ್ಟಿದ್ದಾರೆ|ಬಟ್ಟೆ)", cleaned)
    if match:
        candidate = match.group(1).strip()
        if candidate not in stopwords and not candidate.endswith(("ನೇ", "ನೆ", "th", "st", "nd", "rd")) and len(candidate) >= 2:
            return candidate

    # First token check if it looks like a proper name
    tokens = cleaned.split()
    if tokens:
        first = tokens[0]
        if first.endswith(("ನೇ", "ನೆ", "th", "st", "nd", "rd")):
            return None
        # Remove common Kannada suffix like 'ಅವರ', 'ಗೆ', 'ಮ್ಮ'
        first_clean = re.sub(r"(ಅವರ|ಗೆ|ಹತ್ರ|ನು)$", "", first)
        if first_clean and first_clean not in stopwords and len(first_clean) >= 2:
            return first_clean

    return None

def extract_garments(text: str) -> List[Dict[str, Any]]:
    """Extracts garments and quantities from text."""
    results = []
    text_lower = text.lower()

    for standard_name, synonyms in GARMENT_SYNONYMS.items():
        for syn in synonyms:
            pattern = rf"(?:(\d+|ಒಂದು|ಎರಡು|ಮೂರು|ನಾಲ್ಕು|ಐದು|ಆರು|ಏಳು|ಎಂಟು|ಒಂಬತ್ತು|ಹತ್ತು)\s+)?{re.escape(syn)}"
            matches = re.finditer(pattern, text_lower)
            for m in matches:
                qty_word = m.group(1)
                qty = 1
                if qty_word:
                    qty = parse_kannada_number_phrase(qty_word) or 1
                
                # Check if already added
                existing = next((item for item in results if item["garment_name"] == standard_name), None)
                if existing:
                    existing["quantity"] += qty
                else:
                    results.append({
                        "garment_name": standard_name,
                        "quantity": qty,
                        "unit_price": None,
                        "line_total": None
                    })
                break # Matched this synonym, move to next standard garment
    return results

def extract_pricing_and_payments(text: str) -> Tuple[Optional[Decimal], Optional[Decimal]]:
    """
    Extracts total amount and advance/partial payment amount.
    Examples:
    'ಒಟ್ಟು ಸಾವಿರ ರೂಪಾಯಿ' -> total: 1000
    'ಐನೂರು ರೂಪಾಯಿ ಅಡ್ವಾನ್ಸ್ ಕೊಟ್ಟಿದ್ದಾರೆ' -> advance: 500
    'ಒಟ್ಟು 1200 advance 300' -> total: 1200, advance: 300
    """
    total_amount: Optional[Decimal] = None
    advance_amount: Optional[Decimal] = None
    text_clean = text.lower()

    # Advance patterns: 'ಅಡ್ವಾನ್ಸ್', 'ಮುಂಗಡ', 'advance', 'ಕೊಟ್ಟಿದ್ದಾರೆ'
    advance_match = re.search(
        r"(?:(\d+|ಒಂದು|ಎರಡು|ಮೂರು|ನಾಲ್ಕು|ಐದು|ನೂರು|ಇನ್ನೂರು|ಮುನ್ನೂರು|ನಾನೂರು|ಐನೂರು|ಆರುನೂರು|ಏಳುನೂರು|ಎಂಟುನೂರು|ಒಂಬೈನೂರು|ಸಾವಿರ|\d+\s*ಸಾವಿರ)\s*(?:ರೂಪಾಯಿ|ರೂ|rs|inr)?\s*(?:ಅಡ್ವಾನ್ಸ್|ಮುಂಗಡ|advance|ಕೊಟ್ಟಿದ್ದಾರೆ|ಪಾವತಿ))"
        r"|(?:(?:ಅಡ್ವಾನ್ಸ್|ಮುಂಗಡ|advance)\s*(?:ಆಗಿ)?\s*(\d+|ಒಂದು|ಎರಡು|ಮೂರು|ನಾಲ್ಕು|ಐದು|ನೂರು|ಇನ್ನೂರು|ಮುನ್ನೂರು|ನಾನೂರು|ಐನೂರು|ಆರುನೂರು|ಏಳುನೂರು|ಎಂಟುನೂರು|ಒಂಬೈನೂರು|ಸಾವಿರ)\s*(?:ರೂಪಾಯಿ|ರೂ)?)",
        text_clean
    )
    if advance_match:
        amt_str = advance_match.group(1) or advance_match.group(2)
        if amt_str:
            num = parse_kannada_number_phrase(amt_str)
            if num:
                advance_amount = Decimal(str(num))

    # Total order amount patterns: 'ಒಟ್ಟು', 'total', 'ಮೊತ್ತ'
    total_match = re.search(
        r"(?:(?:ಒಟ್ಟು|ಟೋಟಲ್|total|ಮೊತ್ತ|ರೇಟ್)\s*(?:ಆಗಿ)?\s*(\d+|ಒಂದು|ಎರಡು|ಮೂರು|ನಾಲ್ಕು|ಐದು|ನೂರು|ಇನ್ನೂರು|ಮುನ್ನೂರು|ನಾನೂರು|ಐನೂರು|ಆರುನೂರು|ಏಳುನೂರು|ಎಂಟುನೂರು|ಒಂಬೈನೂರು|ಸಾವಿರ|\d+\s*ಸಾವಿರ|\d+\s*ನೂರು)\s*(?:ರೂಪಾಯಿ|ರೂ)?)",
        text_clean
    )
    if total_match:
        amt_str = total_match.group(1)
        if amt_str:
            num = parse_kannada_number_phrase(amt_str)
            if num:
                total_amount = Decimal(str(num))
    else:
        # Check if entire sentence is just an amount like "ಸಾವಿರ ರೂಪಾಯಿ" or "₹1000" and not matched as advance
        generic_match = re.search(
            r"(\d+|ನೂರು|ಇನ್ನೂರು|ಮುನ್ನೂರು|ನಾನೂರು|ಐನೂರು|ಆರುನೂರು|ಏಳುನೂರು|ಎಂಟುನೂರು|ಒಂಬೈನೂರು|ಸಾವಿರ|\d+\s*ಸಾವಿರ)\s*(?:ರೂಪಾಯಿ|ರೂ)",
            text_clean
        )
        if generic_match and not advance_amount:
            num = parse_kannada_number_phrase(generic_match.group(1))
            if num:
                total_amount = Decimal(str(num))

    return total_amount, advance_amount

def extract_delivery_date(text: str) -> Optional[datetime]:
    """
    Extracts expected delivery date.
    Examples:
    'ಹದಿನೈದನೇ ತಾರೀಖಿಗೆ ಕೊಡಬೇಕು' -> 15th of current (or next) month
    'ನಾಳೆ ಕೊಡಬೇಕು' -> tomorrow
    'ನಾಡಿದ್ದು' -> day after tomorrow
    'ಸೋಮವಾರ ಕೊಡಬೇಕು' -> next Monday
    """
    text_clean = text.lower()
    now = datetime.now(timezone.utc)

    # Tomorrow / ನಾಳೆ
    if "ನಾಳೆ" in text_clean or "tomorrow" in text_clean:
        return now + timedelta(days=1)
    
    # Day after tomorrow / ನಾಡಿದ್ದು
    if "ನಾಡಿದ್ದು" in text_clean:
        return now + timedelta(days=2)

    # Days of week
    for day_name, day_num in DAYS_OF_WEEK.items():
        if day_name in text_clean:
            current_day = now.weekday()
            days_ahead = (day_num - current_day) % 7
            if days_ahead == 0:
                days_ahead = 7
            return now + timedelta(days=days_ahead)

    # Ordinal date matching: 'ಹದಿನೈದನೇ ತಾರೀಖು', '15ನೇ ತಾರೀಖು'
    for ord_word, day_val in KANNADA_ORDINAL_DATES.items():
        if ord_word in text_clean or f"{day_val}ನೇ" in text_clean or f"{day_val}ನೆ" in text_clean:
            target_year = now.year
            target_month = now.month
            # If date has already passed this month, schedule for next month
            if day_val < now.day:
                target_month += 1
                if target_month > 12:
                    target_month = 1
                    target_year += 1
            try:
                return datetime(target_year, target_month, day_val, 18, 0, 0, tzinfo=timezone.utc)
            except ValueError:
                pass

    # Regex for '<digits> ನೇ ತಾರೀಖು' or '<digits> ತಾರೀಖಿಗೆ'
    match = re.search(r"(\d+)\s*(?:ನೇ|ನೆ)?\s*(?:ತಾರೀಖು|ತಾರೀಖಿಗೆ|ದಿನಾಂಕ)", text_clean)
    if match:
        day_val = int(match.group(1))
        if 1 <= day_val <= 31:
            target_year = now.year
            target_month = now.month
            if day_val < now.day:
                target_month += 1
                if target_month > 12:
                    target_month = 1
                    target_year += 1
            try:
                return datetime(target_year, target_month, day_val, 18, 0, 0, tzinfo=timezone.utc)
            except ValueError:
                pass

    return None

def classify_voice_query(query: str) -> Dict[str, Any]:
    """
    Classifies voice questions such as:
    - "ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?"
    - "ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?"
    - "ಈ ತಿಂಗಳು ಎಷ್ಟು ಆದಾಯ ಬಂದಿದೆ?"
    - "ನಾಳೆ ಯಾರ ಬಟ್ಟೆ ಕೊಡಬೇಕು?"
    - "ಯಾವ ಆರ್ಡರ್ಗಳು ಇನ್ನೂ ಬಾಕಿ ಇವೆ?"
    - "ರಮ್ಯಾ ಯಾವಾಗ ಬಟ್ಟೆ ಕೊಟ್ಟಿದ್ದರು?"
    """
    q = normalize_text(query).lower()

    # 1. Today's income / collected money
    if any(k in q for k in ["ಇವತ್ತು ಎಷ್ಟು ಹಣ", "ಇಂದಿನ ಹಣ", "ಇವತ್ತಿನ ಕಲೆಕ್ಷನ್", "ಇವತ್ತು ಎಷ್ಟು ಬಂತು", "today income"]):
        return {"intent": "TODAY_INCOME", "customer_name": None}

    # 2. Monthly income / revenue
    if any(k in q for k in ["ಈ ತಿಂಗಳು ಎಷ್ಟು", "ತಿಂಗಳ ಆದಾಯ", "ಈ ತಿಂಗಳ ಕಲೆಕ್ಷನ್", "ಮಾಸಿಕ ಆದಾಯ", "monthly income"]):
        return {"intent": "MONTHLY_INCOME", "customer_name": None}

    # 3. Tomorrow's deliveries
    if any(k in q for k in ["ನಾಳೆ ಯಾರ ಬಟ್ಟೆ", "ನಾಳೆ ಕೊಡಬೇಕಾದ", "ನಾಳೆ ಡೆಲಿವರಿ", "tomorrow delivery"]):
        return {"intent": "TOMORROW_DELIVERIES", "customer_name": None}

    # 4. Pending / unfinished orders
    if any(k in q for k in ["ಯಾವ ಆರ್ಡರ್ಗಳು ಇನ್ನೂ ಬಾಕಿ", "ಬಾಕಿ ಆರ್ಡರ್ಗಳು", "ಯಾವ ಬಟ್ಟೆ ಹೊಲಿಯಬೇಕು", "pending orders"]):
        return {"intent": "PENDING_ORDERS", "customer_name": None}

    # 5. Customer timeline / history: "ರಮ್ಯಾ ಯಾವಾಗ ಬಟ್ಟೆ ಕೊಟ್ಟಿದ್ದರು?"
    if any(k in q for k in ["ಯಾವಾಗ ಬಟ್ಟೆ ಕೊಟ್ಟಿದ್ದರು", "ಯಾವಾಗ ಕೊಟ್ಟಿದ್ದಾರೆ", "ಆರ್ಡರ್ ಹಿಸ್ಟರಿ", "ಹಿಸ್ಟರಿ"]):
        cust = extract_customer_name(q)
        return {"intent": "CUSTOMER_TIMELINE", "customer_name": cust}

    # 6. Customer outstanding balance: "ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?"
    if any(k in q for k in ["ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು", "ಎಷ್ಟು ಬಾಕಿ ಇದೆ", "ಬಾಕಿ ಹಣ ಎಷ್ಟು", "balance"]):
        cust = extract_customer_name(q)
        return {"intent": "CUSTOMER_BALANCE", "customer_name": cust}

    return {"intent": "UNKNOWN", "customer_name": None}
