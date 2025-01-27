type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type ThirtyDays = `0${Exclude<Digit, '0'>}` | `1${Digit}` | `2${Digit}` | '30';
type ThirtyOneDays = ThirtyDays | '31';
type FebruaryDays = Exclude<ThirtyDays, '30'>;
type ThirtyDayMonths = '04' | '06' | '08' | '10' | '12';
type ThirtyOneDayMonths = '01' | '03' | '05' | '07' | '09' | '11';
type MonthAndDay =
  | `${ThirtyDayMonths}-${ThirtyDays}`
  | `${ThirtyOneDayMonths}-${ThirtyOneDays}`
  | `02-${FebruaryDays}`;
type Century = '20' | '21'; // We're good from 2000 to 2199.

/** A valid date in YYYY-MM-DD format. */
export type CalendarDate = `${Century}${Digit}${Digit}-${MonthAndDay}`;

/** The components of a calendar date in YYYY-MM-DD format. */
export interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

/** Break a CalendarDate into its components. */
export function calendarParts(calendarDate: CalendarDate): CalendarDateParts {
  const [year, month, day] = calendarDate.split('-');
  return {
    year: +year,
    month: +month,
    day: +day,
  };
}
