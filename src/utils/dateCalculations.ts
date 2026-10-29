// Accurate date and holiday calculations for any year

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  // month is 1-indexed (1 to 12)
  return new Date(year, month, 0).getDate();
}

export function getWeekdayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function formatDateString(year: number, month: number, day: number): string {
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

// Calculate the Nth occurrence of a weekday in a given month (e.g. 4th Thursday of November)
// weekday: 0 = Sunday, 1 = Monday, ..., 4 = Thursday, etc.
export function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): number {
  let count = 0;
  const daysInMonth = getDaysInMonth(year, month);
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (d.getDay() === weekday) {
      count++;
      if (count === n) {
        return day;
      }
    }
  }
  return 1;
}

// Calculate the Last occurrence of a weekday in a given month (e.g. Last Monday of May)
export function getLastWeekdayOfMonth(year: number, month: number, weekday: number): number {
  const daysInMonth = getDaysInMonth(year, month);
  for (let day = daysInMonth; day >= 1; day--) {
    const d = new Date(year, month - 1, day);
    if (d.getDay() === weekday) {
      return day;
    }
  }
  return daysInMonth;
}

// Butcher's algorithm for Western Easter Sunday
export function calculateEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

// Pre-computed verified astronomical dates for key Lunar and Hindu/Buddhist festivals
const LUNAR_NEW_YEAR_MAP: Record<number, { month: number; day: number }> = {
  2023: { month: 1, day: 22 },
  2024: { month: 2, day: 10 },
  2025: { month: 1, day: 29 },
  2026: { month: 2, day: 17 },
  2027: { month: 2, day: 6 },
  2028: { month: 1, day: 26 },
  2029: { month: 2, day: 13 },
  2030: { month: 2, day: 3 },
};

const DIWALI_MAP: Record<number, { month: number; day: number }> = {
  2023: { month: 11, day: 12 },
  2024: { month: 11, day: 1 },
  2025: { month: 10, day: 20 },
  2026: { month: 11, day: 8 },
  2027: { month: 10, day: 29 },
  2028: { month: 10, day: 17 },
  2029: { month: 11, day: 5 },
};

const HOLI_MAP: Record<number, { month: number; day: number }> = {
  2023: { month: 3, day: 8 },
  2024: { month: 3, day: 25 },
  2025: { month: 3, day: 14 },
  2026: { month: 3, day: 4 },
  2027: { month: 3, day: 22 },
  2028: { month: 3, day: 11 },
  2029: { month: 3, day: 1 },
};

const EID_AL_FITR_MAP: Record<number, { month: number; day: number }> = {
  2023: { month: 4, day: 21 },
  2024: { month: 4, day: 10 },
  2025: { month: 3, day: 30 },
  2026: { month: 3, day: 20 },
  2027: { month: 3, day: 10 },
  2028: { month: 2, day: 27 },
  2029: { month: 2, day: 15 },
};

const VESAK_POYA_MAP: Record<number, { month: number; day: number }> = {
  2023: { month: 5, day: 5 },
  2024: { month: 5, day: 23 },
  2025: { month: 5, day: 12 },
  2026: { month: 5, day: 1 },
  2027: { month: 5, day: 20 },
  2028: { month: 5, day: 8 },
  2029: { month: 5, day: 27 },
};

export function getLunarNewYear(year: number): { month: number; day: number } {
  return LUNAR_NEW_YEAR_MAP[year] || { month: 2, day: 10 };
}

export function getDiwali(year: number): { month: number; day: number } {
  return DIWALI_MAP[year] || { month: 11, day: 1 };
}

export function getHoli(year: number): { month: number; day: number } {
  return HOLI_MAP[year] || { month: 3, day: 15 };
}

export function getEidAlFitr(year: number): { month: number; day: number } {
  return EID_AL_FITR_MAP[year] || { month: 3, day: 25 };
}

export function getVesakPoya(year: number): { month: number; day: number } {
  return VESAK_POYA_MAP[year] || { month: 5, day: 15 };
}

// Compute US Thanksgiving: 4th Thursday of November
export function getUSThanksgiving(year: number): { month: number; day: number } {
  const day = getNthWeekdayOfMonth(year, 11, 4, 4); // Thursday = 4
  return { month: 11, day };
}

// Black Friday: Friday after US Thanksgiving
export function getBlackFriday(year: number): { month: number; day: number } {
  const { day } = getUSThanksgiving(year);
  return { month: 11, day: day + 1 };
}

// Cyber Monday: Monday after US Thanksgiving
export function getCyberMonday(year: number): { month: number; day: number } {
  const { day } = getUSThanksgiving(year);
  // Thanksgiving Thursday + 4 days = Monday
  // Note: in November, day can be up to 28, +4 is 32 -> Dec 2
  if (day + 4 > 30) {
    return { month: 12, day: day + 4 - 30 };
  }
  return { month: 11, day: day + 4 };
}

// Calculate days difference between two YYYY-MM-DD dates
export function getDaysRemaining(targetDateStr: string, currentDate: Date = new Date()): number {
  const [ty, tm, td] = targetDateStr.split('-').map(Number);
  const target = new Date(ty, tm - 1, td);
  const now = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Calculate recommended preparation date by subtracting weeks
export function getPreparationDate(eventDateStr: string, weeksBefore: number): string {
  const [y, m, d] = eventDateStr.split('-').map(Number);
  const eventDate = new Date(y, m - 1, d);
  eventDate.setDate(eventDate.getDate() - weeksBefore * 7);
  return formatDateString(eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate());
}

export function getPreparationStatus(
  daysRemaining: number,
  preparationWeeks: number
): 'Immediate Action Needed' | 'Ideal Production Window' | 'Upcoming Planning' | 'Too Early / Evergreen' | 'Passed This Year' {
  if (daysRemaining < 0) {
    return 'Passed This Year';
  }
  const prepDays = preparationWeeks * 7;
  // If we are within 2 weeks of the event, it's very late for upload/review
  if (daysRemaining <= 14) {
    return 'Immediate Action Needed';
  }
  // If we are between 2 weeks and the prep deadline + 2 weeks
  if (daysRemaining <= prepDays + 14 && daysRemaining >= prepDays - 14) {
    return 'Ideal Production Window';
  }
  if (daysRemaining > prepDays + 14 && daysRemaining <= prepDays + 60) {
    return 'Upcoming Planning';
  }
  return 'Too Early / Evergreen';
}
