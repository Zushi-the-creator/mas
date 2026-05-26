import { TaxYear } from "./constants";

export type ParentRole = "mother" | "father" | "single";

export interface Child {
  name?: string;
  birthDate: string; // ISO yyyy-mm-dd
  id?: string;
}

export interface PersonalInfo {
  taxYear: TaxYear;
  fullName: string;
  idNumber: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "separated";
  isResident: boolean;
  isOleh?: boolean;
  olehDate?: string;
  isReturningResident?: boolean;
  isDischargedSoldier?: boolean;
  dischargeDate?: string;
  serviceMonths?: number;
  academicDegreeFinished?: boolean;
  academicDegreeYear?: number;
  reservistDays?: number;
  livingInBenefitedTown?: boolean;
  benefitedTownCode?: string;
  isDisabled?: boolean;
  isBlind?: boolean;
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
  bankAccountOwner?: string;
}

export interface SpouseInfo {
  exists: boolean;
  fullName?: string;
  idNumber?: string;
  birthDate?: string;
  worksThisYear?: boolean;
  approxMonthlySalary?: number;
  hasNoIncome?: boolean;
  filesSeparately?: boolean;
  isOver60?: boolean;
  isBlindOrDisabled?: boolean;
}

export interface ChildrenInfo {
  children: Child[];
  receivesChildAllowance: "self" | "spouse" | "split";
  isSingleParent: boolean;
  disabledChildrenCount?: number;
  childSupportPaid?: number; // מזונות
}

export interface Form106 {
  employerName: string;
  startDate?: string; // yyyy-mm-dd
  endDate?: string;
  salary_158: number; // משכורת (158/172)
  tax_042: number; // ניכוי מס
  insurableIncome_244: number; // הכנסה מבוטחת
  employeePension_045: number; // הפקדות עובד לקצבה
  employerPension_248: number; // הפרשות מעביד
  lifeInsurance_036: number; // ביטוח חיים
  shiftsWork_068?: number; // עבודה במשמרות
  havraaReduction_012?: number; // הפחתת דמי הבראה
  yasefWithheld?: number; // מס יסף שנוכה (אם רשום בנפרד)
}

export interface BituachLeumiIncome {
  hasUnemployment: boolean;
  amount: number; // 194
  taxWithheld: number; // נכנס ל-040
}

export interface SeveranceInfo {
  has161: boolean;
  type: "kitzba_continuity" | "pitzuyim_continuity" | "cash";
  taxableAmount: number; // אם cash וחלק חייב
}

export interface PrivatePension {
  selfPensionDeposit: number; // קופ"ג כעמית עצמאי
  lifeInsurancePrivate: number; // ביטוח חיים פרטי
  disabilityInsurance: number; // אכ"ע פרטי
}

export interface Donations {
  amount: number; // סך תרומות סעיף 46
}

export interface UserData {
  personal: PersonalInfo;
  spouse: SpouseInfo;
  children: ChildrenInfo;
  forms106: Form106[];
  bituachLeumi: BituachLeumiIncome;
  severance: SeveranceInfo;
  privatePension: PrivatePension;
  donations: Donations;
}

export interface CalculationResult {
  totalIncome: number;
  incomeBreakdown: { label: string; amount: number }[];
  grossTax: number;
  taxByBracket: { label: string; amount: number; tax: number }[];
  yasefTax: number;
  creditPoints: number;
  creditPointsBreakdown: { label: string; points: number }[];
  creditPointsValue: number;
  pensionCredit: number;
  lifeInsuranceCredit: number;
  donationCredit: number;
  totalCredits: number;
  netTax: number;
  totalTaxPaid: number;
  refund: number; // חיובי = החזר, שלילי = חוב
  warnings: Warning[];
  confidence: "high" | "medium" | "low";
}

export interface Warning {
  level: "red" | "yellow" | "green";
  message: string;
}

export interface Form135Field {
  field: string;
  label: string;
  value: string | number;
  section: string;
}
