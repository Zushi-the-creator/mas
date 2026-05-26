// קבועי מס לשנים 2024 ו-2025 (זהים — המדרגות הוקפאו)

export type TaxYear = 2024 | 2025;

export const TAX_BRACKETS: Record<TaxYear, Array<{ cap: number; rate: number }>> = {
  2024: [
    { cap: 84120, rate: 0.10 },
    { cap: 120720, rate: 0.14 },
    { cap: 193800, rate: 0.20 },
    { cap: 269280, rate: 0.31 },
    { cap: 526920, rate: 0.35 },
    { cap: 688200, rate: 0.47 },
    { cap: Infinity, rate: 0.50 },
  ],
  2025: [
    { cap: 84120, rate: 0.10 },
    { cap: 120720, rate: 0.14 },
    { cap: 193800, rate: 0.20 },
    { cap: 269280, rate: 0.31 },
    { cap: 526920, rate: 0.35 },
    { cap: 688200, rate: 0.47 },
    { cap: Infinity, rate: 0.50 },
  ],
};

export const CREDIT_POINT_VALUE: Record<TaxYear, number> = {
  2024: 2904,
  2025: 2904,
};

export const YASEF_THRESHOLD: Record<TaxYear, number> = {
  2024: 721560,
  2025: 721560,
};

export const YASEF_RATE = 0.03;

export const NI_CAP_ANNUAL: Record<TaxYear, number> = {
  2024: 547680,
  2025: 608340,
};

export const PENSION_CREDIT_RATE = 0.35; // סעיף 45א — עמית שכיר
export const PENSION_CREDIT_INSURABLE_CAP_RATE = 0.07;
export const LIFE_INSURANCE_CREDIT_RATE = 0.25;
export const DONATION_CREDIT_RATE = 0.35;
export const DONATION_MIN = 207;
export const DONATION_MAX_RATE_OF_INCOME = 0.30;
export const DONATION_ABSOLUTE_CAP = 10354816;

export const REFUND_HIGH_WARNING_THRESHOLD = 30000;
