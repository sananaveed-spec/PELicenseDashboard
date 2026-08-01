import { getStateAbbreviation } from "./state-abbreviations";
import { ALL_STATES_VALUE } from "./us-states";

export type PeLicense = {
  id: string;
  engineerName: string;
  state: string;
  stateFullName: string;
  licenseType: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  comments: string;
};

export type PeLicenseInput = Omit<PeLicense, "id">;

const californiaFullName = "California";
const arizonaFullName = "Arizona";
const idahoFullName = "Idaho";
const utahFullName = "Utah";
const massachusettsFullName = "Massachusetts";
const hawaiiFullName = "Hawaii";
const texasFullName = "Texas";
const coloradoFullName = "Colorado";
const washingtonFullName = "Washington";
const oregonFullName = "Oregon";
const kansasFullName = "Kansas";

export const initialLicenses: PeLicense[] = [
  {
    id: "license-ca-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(californiaFullName),
    stateFullName: californiaFullName,
    licenseType: "PE License",
    licenseNumber: "22090",
    issueDate: "8/16/2017",
    expiryDate: "12/31/2027",
    issuingAuthority:
      "Board of Professional Engineers, Land Surveyors and Geologists",
    comments: "",
  },
  {
    id: "license-az-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(arizonaFullName),
    stateFullName: arizonaFullName,
    licenseType: "PE License",
    licenseNumber: "67994",
    issueDate: "12/3/2018",
    expiryDate: "3/31/2025",
    issuingAuthority: "Arizona State Board of Technical Registration",
    comments: "",
  },
  {
    id: "license-id-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(idahoFullName),
    stateFullName: idahoFullName,
    licenseType: "PE License",
    licenseNumber: "P-18377",
    issueDate: "9/28/2024",
    expiryDate: "9/30/2026",
    issuingAuthority: "Division of Occupational & Professional Licenses",
    comments: "",
  },
  {
    id: "license-ut-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(utahFullName),
    stateFullName: utahFullName,
    licenseType: "PE License",
    licenseNumber: "11150077-2022",
    issueDate: "1/30/2019",
    expiryDate: "3/31/2025",
    issuingAuthority: "Utah Division of Professional Licensing",
    comments: "",
  },
  {
    id: "license-ma-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(massachusettsFullName),
    stateFullName: massachusettsFullName,
    licenseType: "PE License",
    licenseNumber: "55005",
    issueDate: "5/25/2019",
    expiryDate: "6/30/2026",
    issuingAuthority: "",
    comments: "",
  },
  {
    id: "license-hi-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(hawaiiFullName),
    stateFullName: hawaiiFullName,
    licenseType: "PE License",
    licenseNumber: "PE-18370",
    issueDate: "1/23/2019",
    expiryDate: "4/30/2026",
    issuingAuthority: "DCCA Professional Vocational Licensing",
    comments: "",
  },
  {
    id: "license-tx-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(texasFullName),
    stateFullName: texasFullName,
    licenseType: "PE License",
    licenseNumber: "132884",
    issueDate: "12/19/2018",
    expiryDate: "9/30/2026",
    issuingAuthority: "",
    comments: "",
  },
  {
    id: "license-co-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(coloradoFullName),
    stateFullName: coloradoFullName,
    licenseType: "PE License",
    licenseNumber: "PE.0054986",
    issueDate: "11/15/2018",
    expiryDate: "10/31/2027",
    issuingAuthority: "CO Dept. of Regulatory Agencies",
    comments: "",
  },
  {
    id: "license-wa-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(washingtonFullName),
    stateFullName: washingtonFullName,
    licenseType: "PE License",
    licenseNumber: "54383",
    issueDate: "12/16/2016",
    expiryDate: "9/29/2027",
    issuingAuthority: "WA State Dept. of Licensing",
    comments: "",
  },
  {
    id: "license-or-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(oregonFullName),
    stateFullName: oregonFullName,
    licenseType: "PE License",
    licenseNumber: "94468PE",
    issueDate: "1/8/2019",
    expiryDate: "12/31/2024",
    issuingAuthority:
      "Oregon State Board of Examiners for Engineering & Land Surveying",
    comments: "",
  },
  {
    id: "license-ks-abdur-rehman",
    engineerName: "Abdur Rehman",
    state: getStateAbbreviation(kansasFullName),
    stateFullName: kansasFullName,
    licenseType: "PE License",
    licenseNumber: "PE31928",
    issueDate: "",
    expiryDate: "4/30/2027",
    issuingAuthority: "",
    comments: "",
  },
  {
    id: "license-ca-muhammad-zulfiqar-ijaz",
    engineerName: "Muhammad Zulfiqar Ijaz",
    state: getStateAbbreviation(californiaFullName),
    stateFullName: californiaFullName,
    licenseType: "PE License",
    licenseNumber: "26071",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    comments: "",
  },
];

export function searchLicenses(
  licenses: PeLicense[],
  engineerName: string,
  stateFilter: string,
): PeLicense[] {
  return licenses.filter((license) => {
    if (license.engineerName !== engineerName) {
      return false;
    }

    if (stateFilter === ALL_STATES_VALUE) {
      return true;
    }

    return license.stateFullName === stateFilter;
  });
}

export function createEmptyLicense(
  engineerName: string,
  stateFullName: string,
): PeLicenseInput {
  return {
    engineerName,
    state: getStateAbbreviation(stateFullName),
    stateFullName,
    licenseType: "",
    licenseNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    comments: "",
  };
}

export function createNewLicense(
  engineerName: string,
  stateFullName: string,
): PeLicense {
  const abbreviation = getStateAbbreviation(stateFullName).toLowerCase();
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now());

  return {
    id: `license-${abbreviation}-${uniqueId}`,
    ...createEmptyLicense(engineerName, stateFullName),
    licenseType: "PE License",
  };
}
