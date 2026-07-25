import { describe, expect, it } from "vitest";
import { calculate, calculateBracketedTax } from "../taxCalculator";
import { UserData } from "../types";

describe("calculateBracketedTax", () => {
  it("מחשב נכון בתוך מדרגה ראשונה", () => {
    const { total } = calculateBracketedTax(50_000, 2025);
    expect(total).toBe(5_000); // 50,000 × 10%
  });

  it("מחשב נכון על פני כמה מדרגות", () => {
    const { total } = calculateBracketedTax(200_000, 2025);
    // 84,120*10% + (120,720-84,120)*14% + (193,800-120,720)*20% + (200,000-193,800)*31%
    const expected =
      84_120 * 0.1 +
      (120_720 - 84_120) * 0.14 +
      (193_800 - 120_720) * 0.2 +
      (200_000 - 193_800) * 0.31;
    expect(Math.round(total)).toBe(Math.round(expected));
  });
});

describe("calculate — תרחיש דוגמה מהמפרט (סעיף 13)", () => {
  const data: UserData = {
    personal: {
      taxYear: 2025,
      fullName: "ישראל ישראלי",
      idNumber: "123456789",
      birthDate: "1985-01-01",
      address: "תל אביב",
      phone: "0501234567",
      email: "a@b.com",
      maritalStatus: "married",
      isResident: true,
    },
    spouse: {
      exists: true,
      worksThisYear: true,
      approxMonthlySalary: 10000,
    },
    children: {
      children: [
        { name: "ילד 1", birthDate: "2019-02-24" }, // גיל 6 ב-2025
        { name: "ילד 2", birthDate: "2020-10-25" }, // גיל 5 ב-2025
      ],
      receivesChildAllowance: "spouse", // האם מקבלת — לכן האב מקבל ערכי "הורה שני"
      isSingleParent: false,
    },
    forms106: [
      {
        employerName: "BFTV",
        startDate: "2025-01-01",
        endDate: "2025-05-31",
        salary_158: 352_177,
        tax_042: 113_120,
        yasefWithheld: 1_546,
        insurableIncome_244: 189_320,
        employeePension_045: 11_359,
        employerPension_248: 0,
        lifeInsurance_036: 0,
      },
      {
        employerName: "Encore",
        startDate: "2025-07-01",
        endDate: "2025-12-31",
        salary_158: 182_716,
        tax_042: 32_827,
        insurableIncome_244: 166_706,
        employeePension_045: 10_003,
        employerPension_248: 0,
        lifeInsurance_036: 0,
      },
    ],
    bituachLeumi: { hasUnemployment: true, amount: 20_373, taxWithheld: 43 },
    severance: { has161: true, type: "kitzba_continuity", taxableAmount: 0 },
    privatePension: { selfPensionDeposit: 0, lifeInsurancePrivate: 0, disabilityInsurance: 0 },
    donations: { amount: 0 },
  };

  const result = calculate(data, false);

  it("סך הכנסה ≈ 555,266", () => {
    expect(result.totalIncome).toBe(555_266);
  });

  it("מס יסף = 0 (מתחת לרף)", () => {
    expect(result.yasefTax).toBe(0);
  });

  it("מס שנוכה ≈ 147,536", () => {
    expect(result.totalTaxPaid).toBe(147_536);
  });

  it("זיכוי קצבה מוגבל בתקרת הכנסה מזכה (116,400 ל-2025)", () => {
    // eligible = min(21,362, 7% × 116,400 = 8,148) → 8,148 × 35% = 2,851.8
    expect(result.pensionCredit).toBeCloseTo(8_148 * 0.35, 0);
  });

  it("החזר חיובי קיים", () => {
    expect(result.refund).toBeGreaterThan(0);
  });

  it("נקודות זיכוי כוללות סבירות (בסיס + ילדים)", () => {
    // אב = 2.25 בסיס + ילד גיל 5 (2 נק׳ לאב) + ילד גיל 6 (1 נק׳ לאב) = 5.25
    expect(result.creditPoints).toBeCloseTo(5.25, 1);
  });
});
