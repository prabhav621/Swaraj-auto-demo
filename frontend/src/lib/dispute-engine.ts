export type CaseStatus =
  | "FLAGGED_IN_CURE_WINDOW"
  | "EMITRA_REBUTTAL_SUBMITTED"
  | "RESTORED_WITH_PREDICATE_SHIELD"
  | "FIELD_VISIT_ORDERED"
  | "EXCLUSION_UPHELD";

export type DueProcessStatus =
  | "CLEAR"
  | "AUTO_RESOLVED_PRE_NOTICE"
  | "ANOMALY_VERIFY_REQUIRED"
  | "SHOW_CAUSE_REQUIRED";

export type SchemeId =
  | "NFSA_RATION_CARD"
  | "RJ_SSP_PENSION"
  | "RJ_PALANHAR_YOJANA";

export type RuleSeries = "K_SERIES" | "A_SERIES";

export type RuleCode = "RULE_DISCOM_24K" | "RULE_VAHAN_4W" | "RULE_GOVT_EMP_K01";

export interface DataEndpointSpec {
  id: string;
  displayName: string;
  tier: "STATE_RAJ_SEWA_DWAAR" | "CENTRAL_API_SETU_DFPD";
  gatewayLabel: string;
  department: string;
  purpose: string;
}

export const DATA_ENDPOINTS_CATALOG: DataEndpointSpec[] = [
  {
    id: "JAN_AADHAAR_2_0",
    displayName: "Jan Aadhaar 2.0 Family Registry",
    tier: "STATE_RAJ_SEWA_DWAAR",
    gatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    department: "DoIT&C & Planning Department, Rajasthan",
    purpose:
      "Verifies family head, member relationships, split-family ancestry at the same village/ward, and protected social categories.",
  },
  {
    id: "PEHCHAN_CRS",
    displayName: "Pehchan Civil Registration (Birth, Marriage & Death)",
    tier: "STATE_RAJ_SEWA_DWAAR",
    gatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    department: "Directorate of Economics & Statistics, Rajasthan",
    purpose:
      "Checks birth, marriage, and death certificates so a deceased earner's past salary never blocks a surviving widow's pension or ration.",
  },
  {
    id: "IFMS_3_0_PAYMANAGER",
    displayName: "State Government Payroll & Pension (IFMS 3.0)",
    tier: "STATE_RAJ_SEWA_DWAAR",
    gatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    department: "Finance Department, Govt. of Rajasthan (IFMS / RGHS / SIPF)",
    purpose:
      "Checks regular State Government and State PSU employment while automatically protecting ASHA, Anganwadi, and honorarium workers.",
  },
  {
    id: "APNA_KHATA_EDHARTI_AGRISTACK",
    displayName: "Apna Khata Land Records & Rajasthan AgriStack",
    tier: "STATE_RAJ_SEWA_DWAAR",
    gatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    department: "Revenue Department & Rajasthan AgriStack",
    purpose:
      "Distinguishes irrigated (Chahi, Nahri canal, Talabi tank) from rain-fed (Barani) land and divides joint ancestral (Shamilati) land fairly across co-heirs.",
  },
  {
    id: "DISCOM_BIJLI_MITRA",
    displayName: "Discom Electricity Billing Ledger (BijliMitra)",
    tier: "STATE_RAJ_SEWA_DWAAR",
    gatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    department: "Jaipur, Ajmer & Jodhpur Discoms (JVVNL / AVVNL / JdVVNL)",
    purpose:
      "Reads annual domestic electricity bills (DS/LT-1) and agricultural borewell connections (AG/LT-4), while excluding tiny roadside shop meters (NDS/LT-2).",
  },
  {
    id: "ULB_SVAMITVA_PROPERTY",
    displayName: "Municipal & Rural Property Records (LSG & SVAMITVA)",
    tier: "STATE_RAJ_SEWA_DWAAR",
    gatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    department: "Local Self Government (LSG) & Panchayati Raj Department",
    purpose:
      "Applies separate house-size limits for Gram Panchayats, Municipalities, and Municipal Corporations, while exempting notified Kachhi Basti homes.",
  },
  {
    id: "RAJSSP_SJED_RAJFED",
    displayName: "Social Security Pension, School & Mandi Crop Records",
    tier: "STATE_RAJ_SEWA_DWAAR",
    gatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    department: "Social Justice Dept (SJED) & RajFED / RajKisan MSP",
    purpose:
      "Checks duplicate pension benefits, Palanhar school enrollment status, and large minimum-support-price (MSP) crop sales.",
  },
  {
    id: "DFPD_NFSA_EPOS_RCMS",
    displayName: "Fair Price Shop Biometric Ration Logs (e-POS)",
    tier: "CENTRAL_API_SETU_DFPD",
    gatewayLabel: "Central API Setu & Food Ministry Feed",
    department: "Union Ministry of Consumer Affairs, Food & Public Distribution",
    purpose:
      "Checks member-by-member biometric ration collection (in kg) to confirm whether an employed son or daughter has stopped lifting family grain.",
  },
  {
    id: "CENTRAL_HRMS_PFMS",
    displayName: "Central Government & Indian Railways Payroll (HRMS)",
    tier: "CENTRAL_API_SETU_DFPD",
    gatewayLabel: "Central API Setu & Food Ministry Feed",
    department: "Indian Railways HRMS & Central PFMS",
    purpose:
      "Identifies regular Central Government, Railway, and Central PSU employees matched to a household member's Aadhaar.",
  },
  {
    id: "CBDT_PAN_ITR_AIS",
    displayName: "Income Tax & Highway Compensation Check (CBDT)",
    tier: "CENTRAL_API_SETU_DFPD",
    gatewayLabel: "Central API Setu & Food Ministry Feed",
    department: "Central Board of Direct Taxes (CBDT)",
    purpose:
      "Automatically clears families who filed a zero-tax return (for bank loans or TDS refunds) and deducts tax-exempt highway land acquisition awards.",
  },
  {
    id: "MORTH_VAHAN_4_0",
    displayName: "Vahan 4.0 Vehicle Registration & Fitness Records",
    tier: "CENTRAL_API_SETU_DFPD",
    gatewayLabel: "Central API Setu & Food Ministry Feed",
    department: "Ministry of Road Transport & State Transport Dept",
    purpose:
      "Verifies private four-wheelers, exempts single livelihood tractors/taxis, and checks expired fitness/insurance or Form 29/30 sale records.",
  },
  {
    id: "MCA21_GSTN",
    displayName: "Corporate Director (MCA21) & GST Registration Check",
    tier: "CENTRAL_API_SETU_DFPD",
    gatewayLabel: "Central API Setu & Food Ministry Feed",
    department: "Ministry of Corporate Affairs & GST Network",
    purpose:
      "Checks active company directorships and GST filings while automatically protecting small farmers serving on Farmer Producer Company (FPO) boards.",
  },
];

export interface PlainRuleItem {
  code: string;
  title: string;
  detail: string;
}

export interface SchemePlaybookPreset {
  schemeId: SchemeId;
  shortTitle: string;
  schemeName: string;
  department: string;
  goReference: string;
  appellateAuthority: string;
  maxAnnualIncome: number;
  maxServicePension: number;
  maxDiscomBill: number;
  maxElectricityKw: number;
  maxIrrigatedHa: number;
  maxBarrenHa: number;
  ruralSqftCap: number;
  palikaSqftCap: number;
  nigamSqftCap: number;
  maxMspQuintals: number;
  exemptCategories: string[];
  exemptCategoryLabels: string[];
  statutoryRuleExemptions?: string[];
  enabledKRules: string[];
  enabledARules: string[];
  plainKRules: PlainRuleItem[];
  plainARules: PlainRuleItem[];
  boundRebuttalOperators: Array<{
    code: string;
    name: string;
    actionBadge: string;
    description: string;
  }>;
}

export const SCHEME_PLAYBOOK_PRESETS: Record<SchemeId, SchemePlaybookPreset> = {
  RJ_SSP_PENSION: {
    schemeId: "RJ_SSP_PENSION",
    shortTitle: "Social Security Pension (RajSSP)",
    schemeName:
      "Rajasthan Social Security Pension (Old Age, Single Women, Differently-Abled & Marginal Farmers)",
    department: "Social Justice & Empowerment Department (SJED), Rajasthan",
    goReference: "Rajasthan Social Security Pension Rules & SJED Verification Directive 2024–25",
    appellateAuthority: "Block Development Officer (BDO — Rural) / Sub-Divisional Officer (SDO — Urban)",
    maxAnnualIncome: 48000,
    maxServicePension: 48000,
    maxDiscomBill: 24000,
    maxElectricityKw: 4.0,
    maxIrrigatedHa: 2.0,
    maxBarrenHa: 4.0,
    ruralSqftCap: 2000,
    palikaSqftCap: 1500,
    nigamSqftCap: 1000,
    maxMspQuintals: 100.0,
    exemptCategories: [
      "ANTYODAYA",
      "BPL",
      "STATE_BPL",
      "AASTHA_CARD",
      "SAHARIYA_KATHODI",
      "SAHARIYA",
      "KATHODI",
      "KHAIRWA",
    ],
    exemptCategoryLabels: [
      "Antyodaya Ration Card Households",
      "BPL & State BPL Families",
      "Aastha Card Families (Differently-Abled)",
      "Sahariya, Kathodi & Khairwa Tribal Households",
    ],
    enabledKRules: ["K01", "K02", "K06", "K07"],
    enabledARules: ["A01", "A02", "A03", "A04"],
    plainKRules: [
      {
        code: "Rule K01",
        title: "Regular Government or PSU Employee",
        detail: "No regular State, Central, or PSU salaried employee in the household (ASHA & Anganwadi honorarium exempt).",
      },
      {
        code: "Rule K02",
        title: "Annual Household Income Above ₹48,000",
        detail: "Verified taxable income or regular service pension above the statutory ₹48,000 annual ceiling.",
      },
      {
        code: "Rule K06",
        title: "Duplicate Pension Benefit",
        detail: "Beneficiary cannot draw two separate social security pensions simultaneously.",
      },
      {
        code: "Rule K07",
        title: "Annual Life & Civil Status Verification",
        detail: "Checks Pehchan civil registration and annual life verification status.",
      },
    ],
    plainARules: [
      {
        code: "Signal A03",
        title: "High Annual Domestic Electricity Bill",
        detail: "Flags domestic meters exceeding the review limit for joint-family verification (never cuts pension automatically).",
      },
      {
        code: "Signal A02",
        title: "Declared vs. Recorded Income Gap",
        detail: "Prompts officer review if financial records indicate substantially higher household earnings.",
      },
      {
        code: "Signal A01",
        title: "Occupation Record Mismatch",
        detail: "Flags discrepancies between declared marginal status and formal business registrations.",
      },
      {
        code: "Signal A04",
        title: "Unlinked Domestic Electricity Meter",
        detail: "Requests meter seeding at e-Mitra during annual pension verification.",
      },
    ],
    boundRebuttalOperators: [
      {
        code: "Category T1",
        name: "Wrong Meter or ID Linked",
        actionBadge: "Unlink Wrong Record",
        description: "A neighbour's or landlord's electricity meter or PAN was mistakenly linked to this Jan Aadhaar.",
      },
      {
        code: "Category T2",
        name: "Past Employment Ended or Asset Sold",
        actionBadge: "Verify End Date",
        description: "Temporary job ended or old asset was sold before the verification cycle.",
      },
      {
        code: "Category T3",
        name: "Separate Earning Child or Deceased Earner",
        actionBadge: "Separate Member Record",
        description: "Adult employed child lives separately, or a deceased member's past salary is no longer active.",
      },
      {
        code: "Category T4",
        name: "Joint Family Sharing One Meter or Land",
        actionBadge: "Divide Across Families",
        description: "Divides a single ancestral electricity bill or land holding fairly across co-residing Jan Aadhaar families.",
      },
      {
        code: "Category T5",
        name: "Corrected Bill or Protected Category",
        actionBadge: "Apply Official Exemption",
        description: "Applies corrected electricity ledger, zero-tax return, highway land compensation, or BPL/Aastha protection.",
      },
      {
        code: "Category T6",
        name: "Special Humanitarian / Officer Review",
        actionBadge: "Refer to BDO / SDO",
        description: "Routes exceptional distress cases with supporting official documents directly to the Appeal Officer.",
      },
    ],
  },

  NFSA_RATION_CARD: {
    schemeId: "NFSA_RATION_CARD",
    shortTitle: "Food Security Ration Card (NFSA)",
    schemeName: "National Food Security Act (NFSA) — Subsidized Ration Card",
    department: "Department of Food & Civil Supplies, Govt. of Rajasthan",
    goReference: "Food & Civil Supplies Notification dated 20.07.2017 (Clause 5) & Give-Up Campaign",
    appellateAuthority: "District Supply Officer (DSO) / Sub-Divisional Officer (SDO)",
    maxAnnualIncome: 100000,
    maxServicePension: 100000,
    maxDiscomBill: 50000,
    maxElectricityKw: 4.0,
    maxIrrigatedHa: 2.0,
    maxBarrenHa: 4.0,
    ruralSqftCap: 2000,
    palikaSqftCap: 1500,
    nigamSqftCap: 1000,
    maxMspQuintals: 100.0,
    exemptCategories: ["ANTYODAYA"],
    exemptCategoryLabels: ["Antyodaya Anna Yojana (AAY) Priority Households"],
    statutoryRuleExemptions: [
      "Homes in Notified Kachhi Bastis (Exempt from House-Size Limit)",
      "One Tractor or Single Livelihood Commercial Vehicle / Taxi Allowed",
    ],
    enabledKRules: ["K01", "K02", "K03", "K04", "K05", "K06", "K07"],
    enabledARules: ["A01", "A02", "A03", "A04", "A05", "A06"],
    plainKRules: [
      {
        code: "Rule K01",
        title: "Regular Government / Railway / PSU Employee",
        detail: "Allows removing only an employed adult child's 5 kg ration share while keeping elderly parents protected.",
      },
      {
        code: "Rule K02",
        title: "Annual Income Tax Payer (Above ₹1,00,000)",
        detail: "Applies only to actual tax-paying income; zero-tax filings and highway awards are automatically cleared.",
      },
      {
        code: "Rule K03",
        title: "Private Four-Wheeler Vehicle Owner",
        detail: "Excludes households owning an active private car (1 livelihood tractor or commercial taxi is exempt).",
      },
      {
        code: "Rule K04",
        title: "Agricultural Land Above Prescribed Ceiling",
        detail: "Checks irrigated vs. rain-fed land limits after dividing ancestral joint-khata shares.",
      },
      {
        code: "Rule K05",
        title: "Large Urban / Rural Pucca Property",
        detail: "Checks municipal property area limits (notified Kachhi Basti homes are statutorily exempt).",
      },
      {
        code: "Rule K06–K07",
        title: "Duplicate Ration Card & Civil Registration",
        detail: "Prevents duplicate ration cards across districts and syncs Pehchan vital records.",
      },
    ],
    plainARules: [
      {
        code: "Signal A03",
        title: "High Annual Electricity Consumption",
        detail: "Soft screening alert for domestic bills above ₹50,000/year; requires joint-family verification before action.",
      },
      {
        code: "Signal A05",
        title: "Large Mandi Crop Sale (Above 100 Quintals)",
        detail: "Triggers land-share review if crop procurement exceeds small-holder norms.",
      },
      {
        code: "Signal A06",
        title: "Borewell Pump on Rain-Fed (Barani) Land",
        detail: "Triggers review only if total land exceeds the 2.0-hectare irrigated ceiling.",
      },
    ],
    boundRebuttalOperators: [
      {
        code: "Category T1",
        name: "Wrong Vehicle, PAN, or Meter Linked",
        actionBadge: "Unlink Wrong Record",
        description: "Clears cases where someone else's vehicle, GST, or electricity meter was linked to the family.",
      },
      {
        code: "Category T2",
        name: "Old Car Already Sold or Scrapped",
        actionBadge: "Verify Sale / Scrap",
        description: "Confirms vehicle was sold years ago on Form 29/30 or scrapped, even if buyer never updated RTO records.",
      },
      {
        code: "Category T3",
        name: "Remove Only Employed Son/Daughter from Card",
        actionBadge: "Keep Parents' Ration",
        description: "Deletes only the employed child's 5 kg ration unit so parents and siblings keep their monthly grain.",
      },
      {
        code: "Category T4",
        name: "Shared Ancestral Land, House, or Meter",
        actionBadge: "Divide Across Heirs",
        description: "Splits undivided ancestral land (Shamilati Khata) or shared meters across all legal co-sharers.",
      },
      {
        code: "Category T5",
        name: "Livelihood Vehicle, FPO, or Highway Award",
        actionBadge: "Apply Legal Exemption",
        description: "Protects single livelihood taxis/tractors, Farmer Producer Company directors, and Kachhi Basti homes.",
      },
      {
        code: "Category T6",
        name: "Special Appeal to District Supply Officer",
        actionBadge: "Refer to DSO / SDO",
        description: "Routes disputed land, court stay orders, or acute distress cases for manual officer verification.",
      },
    ],
  },

  RJ_PALANHAR_YOJANA: {
    schemeId: "RJ_PALANHAR_YOJANA",
    shortTitle: "Palanhar Child Support Scheme",
    schemeName: "Palanhar Yojana — Monthly Care & Education Grant for Vulnerable Children",
    department: "Social Justice & Empowerment Department (SJED), Rajasthan",
    goReference: "SJED Palanhar Scheme Operational Guidelines",
    appellateAuthority: "District Officer (SJED) / Sub-Divisional Officer (SDO)",
    maxAnnualIncome: 120000,
    maxServicePension: 120000,
    maxDiscomBill: 50000,
    maxElectricityKw: 4.0,
    maxIrrigatedHa: 2.0,
    maxBarrenHa: 4.0,
    ruralSqftCap: 2000,
    palikaSqftCap: 1500,
    nigamSqftCap: 1000,
    maxMspQuintals: 100.0,
    exemptCategories: ["ANTYODAYA", "ORPHAN_CATEGORY"],
    exemptCategoryLabels: [
      "Antyodaya Ration Card Guardians",
      "Full Orphan & Destitute Child Categories",
    ],
    enabledKRules: ["K01", "K02", "K06", "K07"],
    enabledARules: ["A01", "A02"],
    plainKRules: [
      {
        code: "Rule K01",
        title: "Guardian Regular Government Employment",
        detail: "Guardian household cannot hold regular salaried government employment.",
      },
      {
        code: "Rule K02",
        title: "Guardian Annual Income Above ₹1,20,000",
        detail: "Guardian household annual income ceiling of ₹1,20,000.",
      },
      {
        code: "Rule K06",
        title: "Duplicate Child Grant Check",
        detail: "Ensures the same child is not enrolled twice across different guardian profiles.",
      },
      {
        code: "Rule K07",
        title: "Annual School / Anganwadi Attendance Check",
        detail: "Verifies child's active enrollment via ShalaDarpan or Anganwadi records.",
      },
    ],
    plainARules: [
      {
        code: "Signal A01–A02",
        title: "Guardian Income & Occupation Review",
        detail: "Soft screening check on guardian income mismatch (electricity bill proxy is turned OFF by default).",
      },
    ],
    boundRebuttalOperators: [
      {
        code: "Category T1",
        name: "Wrong Roll Number or Aadhaar Match",
        actionBadge: "Fix Student Link",
        description: "Resolves accidental school roll-number or Aadhaar mismatch.",
      },
      {
        code: "Category T3",
        name: "Separate Earning Relative",
        actionBadge: "Separate Member",
        description: "Confirms an earning relative lives separately from the child's guardian household.",
      },
      {
        code: "Category T5",
        name: "Upload School Bonafide / Updated Income Proof",
        actionBadge: "Verify School Attendance",
        description: "Submits verified ShalaDarpan school certificate or updated guardian income certificate.",
      },
      {
        code: "Category T6",
        name: "Special Child-Welfare Officer Review",
        actionBadge: "Refer to SJED Officer",
        description: "Protects vulnerable children under manual District Officer review with 15-day benefit protection.",
      },
    ],
  },
};

export interface DisputeCase {
  caseId: string;
  shortPickerLabel: string;
  shortPickerSub: string;
  schemeId: SchemeId;
  janAadhaarId: string;
  beneficiaryName: string;
  age: number;
  gender: string;
  schemeName: string;
  statutoryCitation: string;
  appellateAuthorityTitle: string;
  lgdWardCode: string;
  tehsil: string;
  district: string;
  ruleCode: RuleCode;
  ruleId: "A03" | "K03" | "K01";
  ruleSeries: RuleSeries;
  dueProcessStatus: DueProcessStatus;
  dueProcessBadgeLabel: string;
  layer1AuditSummary: string;
  layer1ResolvedIfLinkedSummary?: string;
  ruleDescription: string;
  flaggedValue: string;
  thresholdValue: string;
  sourceDepartment: string;
  sourceGatewayLabel: string;
  statefulPredicateSummary: string;
  cureWindowDaysLeft: number;
  cureWindowExpiryDate: string;
  mobileNumberMasked: string;
  smsTranscriptHindi: string;
  ivrTranscriptHindi: string;
  allowedRebuttals: Array<{
    id: string;
    operatorCode: "T1" | "T2" | "T3" | "T4" | "T5" | "T6";
    categoryTitle: string;
    labelHindi: string;
    labelEnglish: string;
    requiredEvidence: string;
    isTier2Escalation?: boolean;
  }>;
}

export type ExclusionNoticeCase = DisputeCase;

export const SEEDED_CASES: Record<string, DisputeCase> = {
  CASE_DISCOM_KAMLA: {
    caseId: "RJ-SSP-2026-8821",
    shortPickerLabel: "Case 1: Smt. Kamla Devi",
    shortPickerSub: "Shared Electricity Bill · Old-Age Pension",
    schemeId: "RJ_SSP_PENSION",
    janAadhaarId: "4829103847",
    beneficiaryName: "Smt. Kamla Devi",
    age: 68,
    gender: "Female",
    schemeName: "Rajasthan Social Security Pension (Old-Age Samman)",
    statutoryCitation:
      "Rajasthan Social Security Pension Rules & SJED Verification Directive 2024–25 (with 15-day prior hearing safeguard)",
    appellateAuthorityTitle: "Block Development Officer (BDO), Panchayat Samiti Bassi",
    lgdWardCode: "080899",
    tehsil: "Bassi",
    district: "Jaipur",
    ruleCode: "RULE_DISCOM_24K",
    ruleId: "A03",
    ruleSeries: "A_SERIES",
    dueProcessStatus: "ANOMALY_VERIFY_REQUIRED",
    dueProcessBadgeLabel: "Advisory Bill Check — Manual Verification Only (No Auto-Cut)",
    layer1AuditSummary:
      "Jaipur Discom reported an annual domestic electricity bill of ₹28,500 on Meter No. 21049201122. Because her two married sons' separate Jan Aadhaar cards were not yet linked to this ancestral meter in Discom records, the full ₹28,500 appeared against Kamla Devi alone. Since electricity bills are an advisory risk signal (Rule A03) and never a direct legal disqualifier, her pension remains active while she is given 15 days to link the shared family cards at e-Mitra.",
    layer1ResolvedIfLinkedSummary:
      "Once all 3 co-residing family cards are linked to this meter, each family's share is ₹9,500 per year — well below the ₹24,000 limit — so future monthly checks clear her automatically without sending any notice.",
    ruleDescription: "Annual domestic electricity bill above the scheme review threshold on a household meter",
    flaggedValue: "₹28,500 / year on Meter K-No. 21049201122 (shared ancestral house)",
    thresholdValue: "₹24,000 / year per family",
    sourceDepartment: "Jaipur Discom (JVVNL — BijliMitra Billing System)",
    sourceGatewayLabel: "Rajasthan State Gateway (RajSewaDwar)",
    statefulPredicateSummary:
      "Pension stays protected every month as long as the shared meter's annual bill divided equally across the 3 co-residing families stays below the per-family electricity limit.",
    cureWindowDaysLeft: 12,
    cureWindowExpiryDate: "15 Nov 2026",
    mobileNumberMasked: "+91-9829X-XXXX1",
    smsTranscriptHindi:
      "प्रिय कमला देवी, सामाजिक सुरक्षा पेंशन में बिजली बिल (₹28,500) जांच हेतु आपकी पेंशन अस्थायी रूप से सुरक्षित समीक्षा में है। 15 दिन में ई-मित्र पर जन-आधार लेकर संपर्क करें। केस: RJ-SSP-2026-8821.",
    ivrTranscriptHindi:
      "नमस्ते कमला देवी जी। राजस्थान सामाजिक सुरक्षा विभाग द्वारा सूचित किया जाता है कि आपके घर के बिजली मीटर 21049201122 में वार्षिक बिल ₹28,500 दर्ज हुआ है। आपकी पेंशन बंद नहीं की गई है, बल्कि 15 दिन के लिए सुरक्षित समीक्षा में रखी गई है। कृपया अपने नजदीकी ई-मित्र केंद्र पर जाकर स्पष्टीकरण दर्ज करवाएं।",
    allowedRebuttals: [
      {
        id: "SHARED_METER_JOINT_FAMILY",
        operatorCode: "T4",
        categoryTitle: "Shared Joint-Family Meter (Category T4)",
        labelHindi: "संयुक्त परिवार — एक ही पैतृक बिजली मीटर पर 3 अलग-अलग जन-आधार परिवार निवास करते हैं",
        labelEnglish:
          "Three related nuclear families live in the same ancestral house and share this single electricity meter.",
        requiredEvidence: "Jan Aadhaar 2.0 Family Tree Match + Citizen Fingerprint eKYC",
      },
      {
        id: "INCORRECT_KNUMBER_LINKAGE",
        operatorCode: "T1",
        categoryTitle: "Wrong Meter Number Linked (Category T1)",
        labelHindi: "गलत बिजली मीटर नंबर जुड़ गया है (पड़ोसी या मकान मालिक का मीटर)",
        labelEnglish: "Someone else's electricity meter number was mistakenly linked to this Jan Aadhaar card.",
        requiredEvidence: "Actual Electricity Bill Copy + Correct Meter Number Update",
      },
      {
        id: "FAULTY_BILL_DISCOM_RECTIFIED",
        operatorCode: "T5",
        categoryTitle: "Faulty Bill Corrected / Exempt Family (Category T5)",
        labelHindi: "विद्युत विभाग द्वारा गलत बिल जारी हुआ था जो अब सुधारा जा चुका है (या BPL/आस्था छूट)",
        labelEnglish: "Provisional reading error was corrected by the Discom Assistant Engineer, or household holds BPL/Aastha protection.",
        requiredEvidence: "Corrected Discom Bill Statement or Protected Category Record",
      },
      {
        id: "OTHER_EXCEPTIONAL_GROUND",
        operatorCode: "T6",
        categoryTitle: "Special Humanitarian Review by Officer (Category T6)",
        labelHindi: "अन्य विशेष परिस्थिति — विकास अधिकारी (BDO) / उपखंड अधिकारी मानवीय समीक्षा हेतु",
        labelEnglish: "Exceptional hardship not covered above — refer file with supporting proof to the Block Development Officer.",
        requiredEvidence: "Supporting Local Certificate / Panchnama / Official Application",
        isTier2Escalation: true,
      },
    ],
  },

  CASE_VAHAN_RAMLAL: {
    caseId: "RJ-NFSA-2026-4419",
    shortPickerLabel: "Case 2: Shri Ram Lal Meena",
    shortPickerSub: "Sold Old Car Still on Record · Ration Card",
    schemeId: "NFSA_RATION_CARD",
    janAadhaarId: "5910284711",
    beneficiaryName: "Shri Ram Lal Meena",
    age: 54,
    gender: "Male",
    schemeName: "National Food Security Act (NFSA Ration Card)",
    statutoryCitation:
      "Food & Civil Supplies Dept. Notification dated 20.07.2017, Clause 5 (with 15-day prior hearing safeguard)",
    appellateAuthorityTitle: "District Supply Officer (DSO) / Sub-Divisional Officer (SDO), Phagi",
    lgdWardCode: "079919",
    tehsil: "Phagi",
    district: "Jaipur",
    ruleCode: "RULE_VAHAN_4W",
    ruleId: "K03",
    ruleSeries: "K_SERIES",
    dueProcessStatus: "SHOW_CAUSE_REQUIRED",
    dueProcessBadgeLabel: "Statutory Eligibility Notice — 15-Day Window to Submit Proof",
    layer1AuditSummary:
      "All 6 pre-notice checks ran first. The Vahan 4.0 transport database still lists a 2011 Maruti Alto 800 (RJ-14-CC-4821) in Ram Lal Meena's name because the buyer never completed RTO ownership transfer after buying it in 2019. Instead of cancelling his ration card overnight, Swaraj-Auto keeps his ration active for 15 days so he can present his signed sale papers at e-Mitra.",
    ruleDescription: "Private four-wheeler car registered in the name of a household member (Rule K03)",
    flaggedValue: "Maruti Alto 800 (Reg. No. RJ-14-CC-4821 · Registered in 2011)",
    thresholdValue: "No active private car (1 tractor or single livelihood taxi exempt)",
    sourceDepartment: "Transport Department (Vahan 4.0 Vehicle Registry)",
    sourceGatewayLabel: "Central API Setu Gateway",
    statefulPredicateSummary:
      "Ration card stays protected every month because vehicle RJ-14-CC-4821 was sold in May 2019, its 15-year registration has expired, and the applicant has renewed zero tax or insurance on it.",
    cureWindowDaysLeft: 9,
    cureWindowExpiryDate: "12 Nov 2026",
    mobileNumberMasked: "+91-9414X-XXXX8",
    smsTranscriptHindi:
      "प्रिय राम लाल मीणा, खाद्य सुरक्षा (राशन) पात्रता में वाहन डेटा (RJ-14-CC-4821) के कारण आपकी पात्रता 15 दिन की समीक्षा में है। ई-मित्र पर विक्रय दस्तावेज लेकर जाएं। केस: RJ-NFSA-2026-4419.",
    ivrTranscriptHindi:
      "नमस्ते राम लाल जी। खाद्य सुरक्षा विभाग द्वारा सूचित किया जाता है कि वाहन पंजीयन पोर्टल के अनुसार आपके नाम पर कार RJ-14-CC-4821 दर्ज है। यदि आपने यह वाहन बेच दिया है या कबाड़ हो चुका है, तो अपनी पात्रता बहाल रखने हेतु नजदीकी ई-मित्र पर फॉर्म 29-30 अथवा विक्रय रसीद प्रस्तुत करें।",
    allowedRebuttals: [
      {
        id: "VEHICLE_SOLD_UNTRANSFERRED_RC",
        operatorCode: "T2",
        categoryTitle: "Vehicle Sold Years Ago — Buyer Did Not Transfer RC (Category T2)",
        labelHindi: "वाहन वर्षों पूर्व बेच दिया गया था — खरीदार ने आरटीओ में नाम ट्रांसफर नहीं कराया",
        labelEnglish:
          "Car was sold years ago with signed Form 29/30 delivery receipt, and applicant has no active insurance or fitness renewal.",
        requiredEvidence: "Signed Form 29/30 + Delivery Note + Vahan Registration/Insurance Check",
      },
      {
        id: "VEHICLE_SCRAPPED_TOTAL_LOSS",
        operatorCode: "T2",
        categoryTitle: "Vehicle Scrapped or Stolen (Category T2)",
        labelHindi: "वाहन 15 वर्ष पुराना होकर कबाड़ में कट चुका है अथवा चोरी हो चुका है",
        labelEnglish: "Vehicle was scrapped at an authorized scrapping centre or reported stolen via police FIR.",
        requiredEvidence: "Official Vehicle Scrapping Certificate or Police FIR",
      },
      {
        id: "VEHICLE_LIVELIHOOD_EXEMPT",
        operatorCode: "T5",
        categoryTitle: "Single Livelihood Taxi or Tractor Exemption (Category T5)",
        labelHindi: "यह वाहन परिवार की आजीविका का एकमात्र टैक्सी/वाणिज्यिक वाहन अथवा ट्रैक्टर है (अधिसूचना छूट)",
        labelEnglish: "Exempt under Clause 5 of the 20.07.2017 Notification as the family's sole livelihood commercial vehicle or tractor.",
        requiredEvidence: "Vahan 4.0 Commercial Permit / Tractor Category Check",
      },
      {
        id: "OTHER_EXCEPTIONAL_GROUND",
        operatorCode: "T6",
        categoryTitle: "Special Review by District Supply Officer (Category T6)",
        labelHindi: "अन्य विशेष परिस्थिति — जिला रसद अधिकारी (DSO) / उपखंड अधिकारी समीक्षा हेतु",
        labelEnglish: "Fraudulent loan/registration identity theft or other special case requiring manual officer review.",
        requiredEvidence: "Police FIR / Court Order / Official Supporting Application",
        isTier2Escalation: true,
      },
    ],
  },

  CASE_RAILWAY_GOVT_SON: {
    caseId: "RJ-NFSA-2026-9104",
    shortPickerLabel: "Case 3: Smt. Geeta Devi",
    shortPickerSub: "Son Joined Railways · Keep Parents' Ration",
    schemeId: "NFSA_RATION_CARD",
    janAadhaarId: "6738291044",
    beneficiaryName: "Smt. Geeta Devi",
    age: 58,
    gender: "Female",
    schemeName: "National Food Security Act (NFSA Ration Card)",
    statutoryCitation:
      "Food & Civil Supplies Notification dated 20.07.2017, Clause 5 & Central Food Ministry Rightful Targeting Drive",
    appellateAuthorityTitle: "District Supply Officer (DSO) / Sub-Divisional Officer (SDO), Dausa",
    lgdWardCode: "078501",
    tehsil: "Dausa",
    district: "Dausa",
    ruleCode: "RULE_GOVT_EMP_K01",
    ruleId: "K01",
    ruleSeries: "K_SERIES",
    dueProcessStatus: "SHOW_CAUSE_REQUIRED",
    dueProcessBadgeLabel: "Statutory Eligibility Notice — Member-Split Option Available",
    layer1AuditSummary:
      "A pre-flagged Central Food Ministry / Indian Railways list matched household member #4, Rahul Jat (24-year-old son), as a newly appointed Railway Trackman posted in Prayagraj. Swaraj-Auto first verified he is living and on regular payroll (not an honorarium worker). Instead of cancelling elderly mother Geeta Devi's entire family ration card, it gives the family 15 days to remove only Rahul's 5 kg unit at e-Mitra.",
    ruleDescription: "Household member matched on regular Central / Railway / State Government payroll (Rule K01)",
    flaggedValue: "Member #4: Rahul Jat (Son, Age 24) — Indian Railways Trackman, Prayagraj",
    thresholdValue: "No regular salaried government employee on the active ration card",
    sourceDepartment: "Central Food Ministry Feed & Indian Railways Payroll (HRMS)",
    sourceGatewayLabel: "Central API Setu & Food Ministry Feed",
    statefulPredicateSummary:
      "Parents' and sister's 15 kg/month ration card stays protected every month after employed son Rahul Jat's 5 kg unit is separated, provided the remaining 3 members hold no government job.",
    cureWindowDaysLeft: 14,
    cureWindowExpiryDate: "17 Nov 2026",
    mobileNumberMasked: "+91-9784X-XXXX2",
    smsTranscriptHindi:
      "प्रिय गीता देवी (मुखिया), आपके जन-आधार/राशन कार्ड के सदस्य राहुल जाट (पुत्र) का रेलवे वेतनमान में मिलान हुआ है। परिवार का राशन बंद होने से बचाने हेतु 15 दिन में ई-मित्र पर सदस्य पृथक्करण करवाएं। केस: RJ-NFSA-2026-9104.",
    ivrTranscriptHindi:
      "नमस्ते गीता देवी जी। भारत सरकार के खाद्य विभाग एवं रेलवे बोर्ड मिलान में आपके परिवार के सदस्य राहुल जाट सरकारी सेवा में पाए गए हैं। परिवार एवं बुजुर्ग माता-पिता का राशन चालू रखने के लिए कृपया नजदीकी ई-मित्र पर जाकर केवल कार्यरत पुत्र का नाम राशन कार्ड से अलग करवाएं।",
    allowedRebuttals: [
      {
        id: "EMPLOYED_SON_MEMBER_SPLIT",
        operatorCode: "T3",
        categoryTitle: "Remove Only Employed Son/Daughter — Keep Family Card Active (Category T3)",
        labelHindi:
          "कार्यरत पुत्र/विवाहित पुत्री अलग निवास करते हैं — केवल उस सदस्य की यूनिट हटाकर शेष परिवार का राशन चालू रखें",
        labelEnglish:
          "Employed son lives separately at his posting; remove only his 5 kg ration share and protect his parents' and sister's 15 kg monthly ration.",
        requiredEvidence: "Jan Aadhaar Relationship Check + Fair Price Shop Biometric Ration Check",
      },
      {
        id: "CONTRACTUAL_HONORARIUM_WORKER",
        operatorCode: "T5",
        categoryTitle: "Honorarium / Contractual Worker — Not Regular Govt Staff (Category T5)",
        labelHindi: "सदस्य नियमित सरकारी कर्मचारी नहीं बल्कि मानदेय / संविदा कर्मी (आंगनबाड़ी/आशा/अप्रेंटिस) है",
        labelEnglish: "Matched member is an apprentice, Anganwadi, ASHA, or honorarium worker exempt from disqualification.",
        requiredEvidence: "Payroll Category Verification from Department Records",
      },
      {
        id: "DECEASED_EMPLOYEE_FLOW_EXTINGUISHED",
        operatorCode: "T3",
        categoryTitle: "Deceased Employee — Salary No Longer Exists (Category T3)",
        labelHindi: "संबंधित कर्मचारी का निधन हो चुका है (पहचान पोर्टल मृत्यु प्रमाण-पत्र सत्यापित)",
        labelEnglish: "The matched employee has passed away, so regular salary income has ended.",
        requiredEvidence: "Pehchan Civil Registration Death Certificate Check",
      },
      {
        id: "OTHER_EXCEPTIONAL_GROUND",
        operatorCode: "T6",
        categoryTitle: "Special Review by District Supply Officer (Category T6)",
        labelHindi: "अन्य विशेष परिस्थिति — जिला रसद अधिकारी (DSO) / उपखंड अधिकारी समीक्षा हेतु",
        labelEnglish: "Exceptional family situation requiring manual review by the District Supply Officer.",
        requiredEvidence: "Official Supporting Document + Signed Citizen Statement",
        isTier2Escalation: true,
      },
    ],
  },
};

// Mock Master Database of Jan Aadhaar 2.0 Families residing in Bassi LGD Village 080899
const JAN_AADHAAR_MOCK_REGISTRY: Record<
  string,
  { name: string; relation: string; parentJanAadhaarId: string; fatherHusband: string; ward: string; address: string }
> = {
  "4829103847": {
    name: "Smt. Kamla Devi",
    relation: "Widow Mother (Head of Household — Card #1)",
    parentJanAadhaarId: "JA-ROOT-1998-080899",
    fatherHusband: "Late Ramesh Meena",
    ward: "080899",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
  "4829103848": {
    name: "Suresh Meena",
    relation: "Elder Married Son (Separate Nuclear Family — Card #2)",
    parentJanAadhaarId: "JA-ROOT-1998-080899",
    fatherHusband: "Late Ramesh Meena",
    ward: "080899",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
  "4829103849": {
    name: "Mahesh Meena",
    relation: "Younger Married Son (Separate Nuclear Family — Card #3)",
    parentJanAadhaarId: "JA-ROOT-1998-080899",
    fatherHusband: "Late Ramesh Meena",
    ward: "080899",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
};

export interface MultiFamilyGraphResult {
  verified: boolean;
  statusCode: "GRAPH_VERIFIED_SUCCESS" | "COLLISION_DETECTED" | "LINEAGE_MISMATCH_FRAUD";
  lineageSimilarityScore: number;
  totalAnnualBill: number;
  activeThreshold: number;
  verifiedFamilyCount: number;
  apportionedBillPerFamily: number;
  isWithinThreshold: boolean;
  advisoryDecision: "RECOMMEND_RESTORE_WITH_PREDICATE" | "RECOMMEND_REJECT" | "FLAG_FOR_FIELD_PANCHNAMA";
  detailedProof: {
    addressMatches: boolean;
    fatherHusbandLineageMatch: string;
    antiGamingCollisionPass: boolean;
    collisionDetails?: string;
    verifiedMembers: Array<{ janAadhaarId: string; name: string; relation: string }>;
  };
}

export function runMultiFamilyGraphCheck(
  primaryJanAadhaar: string,
  coResidingJanAadhaars: string[],
  simulateCollision: boolean = false,
  customThreshold: number = 24000
): MultiFamilyGraphResult {
  const primary = JAN_AADHAAR_MOCK_REGISTRY[primaryJanAadhaar];
  if (!primary) {
    return {
      verified: false,
      statusCode: "LINEAGE_MISMATCH_FRAUD",
      lineageSimilarityScore: 0,
      totalAnnualBill: 28500,
      activeThreshold: customThreshold,
      verifiedFamilyCount: 1,
      apportionedBillPerFamily: 28500,
      isWithinThreshold: false,
      advisoryDecision: "RECOMMEND_REJECT",
      detailedProof: {
        addressMatches: false,
        fatherHusbandLineageMatch: "Primary Jan Aadhaar card was not found in the Bassi village registry.",
        antiGamingCollisionPass: true,
        verifiedMembers: [],
      },
    };
  }

  const allIds = Array.from(new Set([primaryJanAadhaar, ...coResidingJanAadhaars]));

  if (simulateCollision) {
    return {
      verified: false,
      statusCode: "COLLISION_DETECTED",
      lineageSimilarityScore: 1.0,
      totalAnnualBill: 28500,
      activeThreshold: customThreshold,
      verifiedFamilyCount: 3,
      apportionedBillPerFamily: 9500,
      isWithinThreshold: true,
      advisoryDecision: "RECOMMEND_REJECT",
      detailedProof: {
        addressMatches: true,
        fatherHusbandLineageMatch: "Shared ancestral family record confirmed (Late Ramesh Meena, Bassi Ward 080899).",
        antiGamingCollisionPass: false,
        collisionDetails:
          "Duplicate Claim Blocked: Son's Jan Aadhaar card (4829103848) was already used on 12 Jan 2026 to split another electricity meter (K-No. 21088492011) in Jamwa Ramgarh. The same family card cannot be used to reduce two different meters.",
        verifiedMembers: [],
      },
    };
  }

  const verifiedMembers: Array<{ janAadhaarId: string; name: string; relation: string }> = [];
  let deterministicMatches = 0;

  for (const id of allIds) {
    const record = JAN_AADHAAR_MOCK_REGISTRY[id];
    if (
      record &&
      record.parentJanAadhaarId === primary.parentJanAadhaarId &&
      record.ward === primary.ward
    ) {
      verifiedMembers.push({ janAadhaarId: id, name: record.name, relation: record.relation });
      deterministicMatches += 1;
    }
  }

  const totalBill = 28500;
  const familyCount = Math.max(1, verifiedMembers.length);
  const exactShare = totalBill / familyCount;
  const isWithin = exactShare < customThreshold;
  const lineageRatio = allIds.length > 0 ? deterministicMatches / allIds.length : 0;

  return {
    verified: familyCount >= 2 && lineageRatio === 1 && isWithin,
    statusCode: "GRAPH_VERIFIED_SUCCESS",
    lineageSimilarityScore: parseFloat(lineageRatio.toFixed(2)),
    totalAnnualBill: totalBill,
    activeThreshold: customThreshold,
    verifiedFamilyCount: familyCount,
    apportionedBillPerFamily: Math.round(exactShare),
    isWithinThreshold: isWithin,
    advisoryDecision: isWithin ? "RECOMMEND_RESTORE_WITH_PREDICATE" : "FLAG_FOR_FIELD_PANCHNAMA",
    detailedProof: {
      addressMatches: lineageRatio === 1,
      fatherHusbandLineageMatch:
        "All 3 nuclear Jan Aadhaar cards trace back to the same ancestral parent family (Late Ramesh Meena) at the exact same residential address in Bassi (Ward 080899).",
      antiGamingCollisionPass: true,
      verifiedMembers,
    },
  };
}

export interface VahanFootprintResult {
  verified: boolean;
  statusCode: "DISPOSSESSION_VERIFIED" | "SUSPECTED_FRAUD_ACTIVE_RC";
  confidenceScore: number;
  saleDateExtracted: string;
  vehicleAgeYears: number;
  advisoryDecision: "RECOMMEND_RESTORE_WITH_PREDICATE" | "RECOMMEND_REJECT";
  telemetrySignals: {
    form2930Verified: boolean;
    vahanRcStatus: string;
    fitnessAndTaxExpiry: string;
    insurancePolicyStatus: string;
    applicantRenewalActivityPast36Months: boolean;
    explanationHindi: string;
  };
}

export function runVahanFootprintCheck(simulateFraud: boolean = false): VahanFootprintResult {
  if (simulateFraud) {
    return {
      verified: false,
      statusCode: "SUSPECTED_FRAUD_ACTIVE_RC",
      confidenceScore: 0.18,
      saleDateExtracted: "15 Oct 2026 (Stamp paper purchased after notice date)",
      vehicleAgeYears: 15,
      advisoryDecision: "RECOMMEND_REJECT",
      telemetrySignals: {
        form2930Verified: false,
        vahanRcStatus: "Active — Fitness & Green Tax Renewed in 2026",
        fitnessAndTaxExpiry: "Valid until 18 Aug 2028 (Recently renewed at Jaipur RTO)",
        insurancePolicyStatus: "Active policy renewed in applicant's own name (Oct 2026)",
        applicantRenewalActivityPast36Months: true,
        explanationHindi:
          "दस्तावेज़ संदिग्ध: प्रस्तुत विक्रय पत्र नोटिस जारी होने के बाद की तिथि का है, तथा वाहन 4.0 पोर्टल पर फिटनेस/टैक्स एवं बीमा अभी भी आवेदक के नाम पर सक्रिय एवं नवीनीकृत हैं।",
      },
    };
  }

  return {
    verified: true,
    statusCode: "DISPOSSESSION_VERIFIED",
    confidenceScore: 0.984,
    saleDateExtracted: "14 May 2019",
    vehicleAgeYears: 15,
    advisoryDecision: "RECOMMEND_RESTORE_WITH_PREDICATE",
    telemetrySignals: {
      form2930Verified: true,
      vahanRcStatus: "15-Year Registration Expired (Form 29/30 sale recorded; buyer never updated RTO)",
      fitnessAndTaxExpiry: "Expired on 10 Mar 2026 (End-of-life vehicle over 15 years old)",
      insurancePolicyStatus: "Zero insurance renewals linked to applicant since May 2019",
      applicantRenewalActivityPast36Months: false,
      explanationHindi:
        "सत्यापित: 14-मई-2019 को फॉर्म 29/30 एवं डिलीवरी नोट द्वारा वाहन विक्रय हुआ। वाहन 4.0 पोर्टल पर 15-वर्षीय पंजीकरण समाप्त हो चुका है तथा विगत 5 वर्षों में आवेदक के नाम से कोई फिटनेस या बीमा नवीनीकरण नहीं हुआ है।",
    },
  };
}

export interface MemberSplitGraphResult {
  verified: boolean;
  statusCode: "MEMBER_SPLIT_READY_PARENTS_PROTECTED" | "HOF_ACTIVE_EMPLOYEE_FRAUD";
  flaggedMemberName: string;
  relationCodeInJanAadhaar: string;
  employerVerified: string;
  eposGrainDrawnByFlaggedMemberKg: number;
  remainingEligibleMembersCount: number;
  revisedMonthlyQuotaKg: number;
  advisoryDecision: "RECOMMEND_MEMBER_SPLIT_KEEP_CARD" | "RECOMMEND_CANCEL_CARD_RECOVERY";
  explanationHindi: string;
}

export function runMemberSplitGraphCheck(simulateActiveFraud: boolean = false): MemberSplitGraphResult {
  if (simulateActiveFraud) {
    return {
      verified: false,
      statusCode: "HOF_ACTIVE_EMPLOYEE_FRAUD",
      flaggedMemberName: "Smt. Geeta Devi (Head of Household)",
      relationCodeInJanAadhaar: "Head of Household (Mukhiya Herself)",
      employerVerified: "Regular Government Payroll (Pay Level-4, Jaipur Division)",
      eposGrainDrawnByFlaggedMemberKg: 180,
      remainingEligibleMembersCount: 0,
      revisedMonthlyQuotaKg: 0,
      advisoryDecision: "RECOMMEND_CANCEL_CARD_RECOVERY",
      explanationHindi:
        "गंभीर उल्लंघन: जन-आधार 2.0 रिकॉर्ड के अनुसार सरकारी कर्मचारी स्वयं परिवार की मुखिया हैं तथा राशन दुकान की बायोमेट्रिक मशीन के अनुसार विगत 12 माह में स्वयं के अंगूठे से 180 किग्रा मुफ्त राशन उठाया गया है। राशन कार्ड निरस्त कर वसूली योग्य।",
    };
  }

  return {
    verified: true,
    statusCode: "MEMBER_SPLIT_READY_PARENTS_PROTECTED",
    flaggedMemberName: "Rahul Jat (Member #4)",
    relationCodeInJanAadhaar: "Adult Son (Posted & Living Separately in Prayagraj)",
    employerVerified: "Indian Railways Trackman (Joined August 2025)",
    eposGrainDrawnByFlaggedMemberKg: 0,
    remainingEligibleMembersCount: 3,
    revisedMonthlyQuotaKg: 15,
    advisoryDecision: "RECOMMEND_MEMBER_SPLIT_KEEP_CARD",
    explanationHindi:
      "सत्यापित (सदस्य पृथक्करण): जन-आधार 2.0 रिकॉर्ड के अनुसार कार्यरत सदस्य परिवार का पुत्र है। राशन दुकान बायोमेट्रिक रिकॉर्ड के अनुसार नौकरी लगने के बाद राहुल जाट ने 0 किग्रा राशन उठाया है। केवल पुत्र की 5 किग्रा यूनिट हटाकर मुखिया गीता देवी एवं शेष परिवार (3 सदस्य = 15 किग्रा/माह) का राशन कार्ड सुरक्षित रखा जाए।",
  };
}

export interface AlternativeRebuttalResult {
  verified: boolean;
  operatorCode: "T1" | "T2" | "T3" | "T4" | "T5" | "T6";
  statusCode: "T1_T5_REGISTRY_OVERRIDE_VERIFIED" | "TIER2_ESCALATION_QUEUED_CURE_PROTECTED";
  documentReference: string;
  recommendedBdoAction: "APPROVED" | "FIELD_VISIT";
  explanationHindi: string;
  explanationEnglish: string;
}

export function runAlternativeRebuttalCheck(
  operatorCode: "T1" | "T2" | "T3" | "T4" | "T5" | "T6",
  rebuttalId: string,
  documentReference: string = "DOC-RJ-2026-VERIFIED"
): AlternativeRebuttalResult {
  if (operatorCode === "T6") {
    return {
      verified: true,
      operatorCode: "T6",
      statusCode: "TIER2_ESCALATION_QUEUED_CURE_PROTECTED",
      documentReference: documentReference || "FIR-2026-RJ-0891 / RAA-STAY-442",
      recommendedBdoAction: "FIELD_VISIT",
      explanationHindi: `मानवीय समीक्षा हेतु अग्रेषित (श्रेणी T6): विशेष परिस्थिति दर्ज की गई। संलग्न दस्तावेज़ (${documentReference}) को अपीलीय अधिकारी / पटवारी भौतिक पंचनामा जांच हेतु भेजा गया है। तब तक 15-दिवसीय लाभ सुरक्षा चालू रहेगी।`,
      explanationEnglish: `Forwarded for Officer & Field Inspection (Category T6): Supporting document (${documentReference}) has been queued for the Appeal Officer / Patwari verification while keeping the citizen's benefit protected during the 15-day window.`,
    };
  }

  return {
    verified: true,
    operatorCode,
    statusCode: "T1_T5_REGISTRY_OVERRIDE_VERIFIED",
    documentReference,
    recommendedBdoAction: "APPROVED",
    explanationHindi: `सत्यापित (श्रेणी ${operatorCode}): विभागीय रिकॉर्ड एवं प्रस्तुत साक्ष्य का मिलान सफल रहा। आवेदक का लाभ यथावत चालू रखने की अनुशंसा की जाती है।`,
    explanationEnglish: `Verified Against Department Records (Category ${operatorCode}): Official records confirm the citizen's explanation. Recommended for immediate benefit protection.`,
  };
}

export interface DeltaWatcherEvaluation {
  shieldStatus: "SHIELD_ACTIVE_PROTECTED" | "SHIELD_REVOKED_SPIKE" | "SHIELD_REVOKED_METERS_SPLIT";
  effectiveAnnualBill: number;
  effectivePerFamilyShare: number;
  activeThreshold: number;
  isBenefitProtected: boolean;
  reasonHindi: string;
  reasonEnglish: string;
}

export function evaluateDeltaWatcherPredicate(
  nextMonthBill: number,
  linkedFamiliesCount: number,
  isMeterSegregated: boolean,
  customThreshold: number = 24000
): DeltaWatcherEvaluation {
  if (isMeterSegregated) {
    return {
      shieldStatus: "SHIELD_REVOKED_METERS_SPLIT",
      effectiveAnnualBill: nextMonthBill,
      effectivePerFamilyShare: nextMonthBill,
      activeThreshold: customThreshold,
      isBenefitProtected: nextMonthBill < customThreshold,
      reasonHindi:
        "विद्युत विभाग द्वारा अलग व्यक्तिगत मीटर लगा दिया गया है। पुराना संयुक्त परिवार नियम समाप्त हुआ; अब परिवार का आकलन केवल उनके अपने मीटर बिल के आधार पर होगा।",
      reasonEnglish:
        "Separate individual electricity meters have been installed. Each household is now checked solely on its own meter reading.",
    };
  }

  const divisor = Math.max(1, linkedFamiliesCount);
  const exactShare = nextMonthBill / divisor;
  const displayShare = Math.round(exactShare);
  const isProtected = exactShare < customThreshold;

  if (isProtected) {
    return {
      shieldStatus: "SHIELD_ACTIVE_PROTECTED",
      effectiveAnnualBill: nextMonthBill,
      effectivePerFamilyShare: displayShare,
      activeThreshold: customThreshold,
      isBenefitProtected: true,
      reasonHindi: `संयुक्त मीटर का वार्षिक बिल ₹${nextMonthBill.toLocaleString("en-IN")} है। ${divisor} सह-निवासित परिवारों में बांटने पर प्रति परिवार हिस्सा ₹${displayShare.toLocaleString("en-IN")} आता है, जो ₹${customThreshold.toLocaleString("en-IN")} की सीमा से कम है। पेंशन बिना रुकावट चालू रहेगी।`,
      reasonEnglish: `Shared annual bill of ₹${nextMonthBill.toLocaleString("en-IN")} split across ${divisor} co-residing families comes to ₹${displayShare.toLocaleString("en-IN")} per family — safely below the ₹${customThreshold.toLocaleString("en-IN")} limit. Pension continues without sending repeat notices.`,
    };
  } else {
    return {
      shieldStatus: "SHIELD_REVOKED_SPIKE",
      effectiveAnnualBill: nextMonthBill,
      effectivePerFamilyShare: displayShare,
      activeThreshold: customThreshold,
      isBenefitProtected: false,
      reasonHindi: `बिल वृद्धि अलर्ट: संयुक्त बिजली बिल बढ़कर ₹${nextMonthBill.toLocaleString("en-IN")} हो गया है। ${divisor} परिवारों में बांटने के बाद भी प्रति परिवार हिस्सा ₹${displayShare.toLocaleString("en-IN")} है, जो ₹${customThreshold.toLocaleString("en-IN")} सीमा के बराबर या अधिक है। नया 15-दिवसीय स्पष्टीकरण नोटिस जारी किया जाएगा।`,
      reasonEnglish: `Consumption Spike Detected: Shared bill rose to ₹${nextMonthBill.toLocaleString("en-IN")}. Even divided across ${divisor} families, each family's share is ₹${displayShare.toLocaleString("en-IN")} (at or above the ₹${customThreshold.toLocaleString("en-IN")} limit). A fresh 15-day review notice is triggered.`,
    };
  }
}
