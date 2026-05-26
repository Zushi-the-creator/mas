import { UserData } from "./types";

export function defaultUserData(): UserData {
  return {
    personal: {
      taxYear: 2025,
      fullName: "",
      idNumber: "",
      birthDate: "",
      address: "",
      phone: "",
      email: "",
      maritalStatus: "single",
      isResident: true,
    },
    spouse: { exists: false },
    children: {
      children: [],
      receivesChildAllowance: "self",
      isSingleParent: false,
    },
    forms106: [],
    bituachLeumi: { hasUnemployment: false, amount: 0, taxWithheld: 0 },
    severance: { has161: false, type: "kitzba_continuity", taxableAmount: 0 },
    privatePension: {
      selfPensionDeposit: 0,
      lifeInsurancePrivate: 0,
      disabilityInsurance: 0,
    },
    donations: { amount: 0 },
  };
}
