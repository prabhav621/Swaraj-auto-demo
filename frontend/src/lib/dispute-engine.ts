export type CaseStatus =
  | "FLAGGED_IN_CURE_WINDOW"
  | "EMITRA_REBUTTAL_SUBMITTED"
  | "RESTORED_WITH_PREDICATE_SHIELD"
  | "FIELD_VISIT_ORDERED"
  | "EXCLUSION_UPHELD";

export type RuleCode = "RULE_DISCOM_24K" | "RULE_VAHAN_4W" | "RULE_GOVT_EMP_K01";

export interface DataEndpointSpec {
  id: string;
  tier: "STATE_RAJ_SEWA_DWAAR" | "CENTRAL_API_SETU_DFPD";
  uri: string;
  department: string;
  purpose: string;
}

export const DATA_ENDPOINTS_CATALOG: DataEndpointSpec[] = [
  {
    id: "JAN_AADHAAR_2_0",
    tier: "STATE_RAJ_SEWA_DWAAR",
    uri: "rajsewadwaar://jan-aadhaar/v2/family-graph",
    department: "DoIT&C / Planning Dept, Rajasthan",
    purpose: "Family ID, 19 relationship codes, split-family lineage, exemption category",
  },
  {
    id: "PEHCHAN_CRS",
    tier: "STATE_RAJ_SEWA_DWAAR",
    uri: "rajsewadwaar://pehchan/v1/vital-events",
    department: "Economics & Statistics (Pehchan CRS)",
    purpose: "Birth, marriage & death registration sync (Flow vs. Stock inheritance)",
  },
  {
    id: "IFMS_3_0_PAYMANAGER",
    tier: "STATE_RAJ_SEWA_DWAAR",
    uri: "rajsewadwaar://ifms/v3/employee-pensioner-verify",
    department: "Finance Dept, Govt of Rajasthan (IFMS / RGHS / SIPF)",
    purpose: "State Govt & State PSU payroll/pension check (auto-exempts ASHA/Anganwadi honorarium)",
  },
  {
    id: "APNA_KHATA_EDHARTI_AGRISTACK",
    tier: "STATE_RAJ_SEWA_DWAAR",
    uri: "rajsewadwaar://apna-khata/v2/jamabandi-khasra",
    department: "Revenue Dept & Rajasthan AgriStack (rjfr.agristack.gov.in)",
    purpose: "Chahi/Barani/Gair-Mumkin area, Shamilati Khata co-sharers",
  },
  {
    id: "DISCOM_BIJLI_MITRA",
    tier: "STATE_RAJ_SEWA_DWAAR",
    uri: "rajsewadwaar://discom-bijlimitra/v2/consumer-ledger",
    department: "JVVNL / AVVNL / JdVVNL Discoms",
    purpose: "12-digit K-Number annual bill, LMV-1 load, LMV-5 agricultural pump",
  },
  {
    id: "ULB_SVAMITVA_PROPERTY",
    tier: "STATE_RAJ_SEWA_DWAAR",
    uri: "rajsewadwaar://e-nagarpalika/v1/property-tax",
    department: "LSG (e-NagarPalika) & Panchayati Raj (Svamitva)",
    purpose: "3-tier LGD routing (Gram Panchayat/Palika/Nigam), sq.ft. & Kachhi Basti exemption",
  },
  {
    id: "RAJSSP_SJED_RAJFED",
    tier: "STATE_RAJ_SEWA_DWAAR",
    uri: "rajsewadwaar://rajssp/v2/beneficiary-status",
    department: "SJED & RajFED e-Procure",
    purpose: "Duplicate scheme check (K06), school enrollment (K07), MSP crop quintals (A05)",
  },
  {
    id: "DFPD_NFSA_EPOS_RCMS",
    tier: "CENTRAL_API_SETU_DFPD",
    uri: "apisetu://dfpd-rcms/v2/epos-member-transactions",
    department: "Union Ministry of Consumer Affairs, Food & PD (DFPD)",
    purpose: "Per-member e-POS biometric grain drawal (kg) to verify non-drawal / dormant cards",
  },
  {
    id: "CENTRAL_HRMS_PFMS",
    tier: "CENTRAL_API_SETU_DFPD",
    uri: "apisetu://indian-railways-hrms/v1/employee-status",
    department: "Indian Railways HRMS / Central PFMS (via DFPD Feed)",
    purpose: "Central/Railway/PSU payroll verification (incl. below-tax-slab probationers)",
  },
  {
    id: "CBDT_PAN_ITR_AIS",
    tier: "CENTRAL_API_SETU_DFPD",
    uri: "apisetu://cbdt/v1/itr-verification",
    department: "CBDT (Income Tax Act Sec. 138 Feed)",
    purpose: "ITR status, Net Tax Liability (Layer-1 Nil-Tax ITR Auto-Clear) & RFCTLARR Sec. 96 exemption",
  },
  {
    id: "MORTH_VAHAN_4_0",
    tier: "CENTRAL_API_SETU_DFPD",
    uri: "apisetu://morth-vahan/v4/rc-ownership-telemetry",
    department: "MoRTH / State Transport (Vahan 4.0)",
    purpose: "4-wheeler RC status, fitness/insurance validity, tractor/commercial exemption, Form 29/30 & RVSF scrap",
  },
  {
    id: "MCA21_GSTN",
    tier: "CENTRAL_API_SETU_DFPD",
    uri: "apisetu://mca21/v3/din-director-check",
    department: "Ministry of Corporate Affairs (MCA21) & GSTN",
    purpose: "DIN/GSTN status + Layer-1 auto-exemption for Companies Act Sec. 378C(3) FPO Producer Companies",
  },
];

export interface SchemePlaybookPreset {
  schemeId: string;
  schemeName: string;
  department: string;
  goReference: string;
  appellateAuthority: string;
  maxAnnualIncome: number;
  maxDiscomBill: number;
  maxIrrigatedHa: number;
  maxBarrenHa: number;
  ruralSqftCap: number;
  palikaSqftCap: number;
  nigamSqftCap: number;
  exemptCategories: string[];
  activeKRules: string[];
  activeARules: string[];
  boundRebuttalOperators: Array<{
    code: string;
    name: string;
    formula: string;
    description: string;
  }>;
}

export const SCHEME_PLAYBOOK_PRESETS: Record<string, SchemePlaybookPreset> = {
  SSP_PENSION: {
    schemeId: "SSP_PENSION",
    schemeName: "Rajasthan Social Security Pension (Vridhjan / Ekal Nari / Divyang)",
    department: "Social Justice & Empowerment Department (SJED)",
    goReference: "Rajasthan Social Security Pension Rules & SJED Verification Directive 2024-25",
    appellateAuthority: "Block Development Officer (BDO - Rural) / SDO (Urban)",
    maxAnnualIncome: 48000,
    maxDiscomBill: 24000,
    maxIrrigatedHa: 2.0,
    maxBarrenHa: 4.0,
    ruralSqftCap: 2000,
    palikaSqftCap: 1500,
    nigamSqftCap: 1000,
    exemptCategories: ["Antyodaya", "BPL / State BPL", "Aastha Card", "Sahariya / Kathodi / Khairwa Tribe"],
    activeKRules: ["K01_GOVT_EMP", "K02_INCOME_ITR", "K06_DUPLICATE", "K07_LIFECYCLE"],
    activeARules: ["A01_OCC_GAP (-25)", "A02_INCOME_GAP (-30)", "A03_DISCOM_BILL (-40)", "A04_UNSEEDED_KNO (-25)"],
    boundRebuttalOperators: [
      { code: "T1", name: "Sever Wrong ID Link", formula: "Link(M, A) = 0", description: "Wrong K-Number / PAN mapped or Identity-Theft FIR" },
      { code: "T2", name: "Temporal Cutoff", formula: "t_end(A) < t_now", description: "Past employment ended / asset disposed before audit" },
      { code: "T3", name: "Member Split (Flow vs. Stock)", formula: "H' = H \\ {M}", description: "Employed child split via Jan Aadhaar 2.0; deceased salary extinguishes" },
      { code: "T4", name: "Denominator Split (Joint Family)", formula: "V_eff = V_gross / N", description: "Shared meter/land divided across N linked Jan Aadhaar families" },
      { code: "T5", name: "Value / Nature / Exemption Override", formula: "V_eff = V_rectified", description: "Rectified Discom ledger, Nil-Tax ITR, Sec. 96 award, or BPL/Aastha exemption" },
      { code: "T6", name: "Other / Exceptional Escalation", formula: "Route -> Appellate Review", description: "Tier-2 natural justice escalation with mandatory official document upload" },
    ],
  },
  NFSA_RATION: {
    schemeId: "NFSA_RATION",
    schemeName: "National Food Security Act (NFSA Priority Household Ration Card)",
    department: "Department of Food & Civil Supplies, Govt of Rajasthan",
    goReference: "Food & Civil Supplies Dept Notification dated 20.07.2017, Clause 5 & Give-Up Drive 2024",
    appellateAuthority: "District Supply Officer (DSO) / Sub-Divisional Officer (SDO)",
    maxAnnualIncome: 100000,
    maxDiscomBill: 50000,
    maxIrrigatedHa: 2.0,
    maxBarrenHa: 4.0,
    ruralSqftCap: 2000,
    palikaSqftCap: 1500,
    nigamSqftCap: 1000,
    exemptCategories: ["Antyodaya Anna Yojana (AAY)", "Notified Kachhi Basti (K05 Exempt)", "1 Tractor / Livelihood Commercial Vehicle (K03 Exempt)"],
    activeKRules: ["K01_GOVT_EMP", "K02_INCOME_ITR", "K03_VEHICLE_4W", "K04_LAND_CAP", "K05_PUCCA_SQFT"],
    activeARules: ["A01_OCC_GAP (-25)", "A02_INCOME_GAP (-30)", "A03_DISCOM_50K (-40)", "A05_MSP_100Q (-20)", "A06_PUMP_BARANI (-10)"],
    boundRebuttalOperators: [
      { code: "T1", name: "Sever Wrong ID Link", formula: "Link(M, A) = 0", description: "Wrong RC/PAN/K-No seeded or Bogus GST/MCA Cyber FIR" },
      { code: "T2", name: "Temporal Cutoff (Sold / Non-Drawal)", formula: "t_end(A) < t_now", description: "Vehicle sold on Form 29/30, RVSF scrapped, or 0 kg e-POS drawal" },
      { code: "T3", name: "Member Split (1.82L Railway Case)", formula: "H' = H \\ {M_son}", description: "Removes only employed son/daughter unit; keeps parents' Ration Card active" },
      { code: "T4", name: "Denominator Split (Shamilati / Heirs)", formula: "V_eff = V_gross / N", description: "Ancestral land, house, or meter split across N Jan Aadhaar families/heirs" },
      { code: "T5", name: "Value / Nature / Exemption Override", formula: "V_eff = V_rectified", description: "RFCTLARR Sec. 96 land award, FPO Producer Co. Director, or Kachhi Basti" },
      { code: "T6", name: "Other / Exceptional Escalation", formula: "Route -> DSO/SDO Review", description: "Court-litigated/stay-order land or uncatalogued distress with official proof" },
    ],
  },
  PALANHAR_YOJANA: {
    schemeId: "PALANHAR_YOJANA",
    schemeName: "Mukhyamantri Palanhar Yojana & Kali Bai Bheel Scooty Scheme",
    department: "SJED & Commissionerate of College Education, Rajasthan",
    goReference: "SJED Palanhar Rules & Higher Education Scooty Guidelines",
    appellateAuthority: "District Officer (SJED) / Nodal Officer (College Education)",
    maxAnnualIncome: 120000,
    maxDiscomBill: 36000,
    maxIrrigatedHa: 2.0,
    maxBarrenHa: 4.0,
    ruralSqftCap: 2000,
    palikaSqftCap: 1500,
    nigamSqftCap: 1000,
    exemptCategories: ["Orphan Children", "Widow / Destitute Mother Category", "Silicosis / Leprosy Affected"],
    activeKRules: ["K01_GOVT_EMP", "K02_INCOME_ITR", "K06_DUPLICATE_BENEFIT", "K07_ENROLLMENT_STATUS"],
    activeARules: ["A01_OCC_GAP (-25)", "A02_INCOME_GAP (-30)"],
    boundRebuttalOperators: [
      { code: "T1", name: "Sever Wrong ID Link", formula: "Link(M, A) = 0", description: "Resolve duplicate Roll No. / Aadhaar collision" },
      { code: "T3", name: "Member Split", formula: "H' = H \\ {M}", description: "Separated earning member no longer in guardian household" },
      { code: "T5", name: "Value / Enrollment Override", formula: "Status = Verified", description: "Upload ShalaDarpan / RajSSP school bonafide or updated income certificate" },
      { code: "T6", name: "Other / Exceptional Escalation", formula: "Route -> Appellate Review", description: "Tier-2 natural justice escalation with supporting official document" },
    ],
  },
};

export interface ExclusionNoticeCase {
  caseId: string;
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
  ruleDescription: string;
  flaggedValue: string;
  thresholdValue: string;
  sourceDepartment: string;
  sourceEndpointUri: string;
  statefulPredicateSummary: string;
  cureWindowDaysLeft: number;
  cureWindowExpiryDate: string;
  mobileNumberMasked: string;
  smsTranscriptHindi: string;
  ivrTranscriptHindi: string;
  allowedRebuttals: Array<{
    id: string;
    operatorCode: "T1" | "T2" | "T3" | "T4" | "T5" | "T6";
    labelHindi: string;
    labelEnglish: string;
    requiredEvidence: string;
    isTier2Escalation?: boolean;
  }>;
}

export const SEEDED_CASES: Record<string, ExclusionNoticeCase> = {
  "CASE_DISCOM_KAMLA": {
    caseId: "RJ-SSP-2026-8821",
    janAadhaarId: "4829103847",
    beneficiaryName: "Smt. Kamla Devi",
    age: 68,
    gender: "Female",
    schemeName: "Mukhyamantri Vridhjan Samman Pension (Social Security)",
    statutoryCitation:
      "Rajasthan Social Security Pension Rules & SJED Verification Directive 2024-25 (read with S.Q. Masood v. State of Telangana, 2022)",
    appellateAuthorityTitle: "Block Development Officer (BDO), Panchayat Samiti Bassi",
    lgdWardCode: "042110",
    tehsil: "Bassi",
    district: "Jaipur Rural",
    ruleCode: "RULE_DISCOM_24K",
    ruleDescription: "Annual Electricity Consumption Bill >= ₹24,000 across linked Jan Aadhaar household (A03 Proxy)",
    flaggedValue: "₹28,500 / year (Discom K-No: 21049201122)",
    thresholdValue: "₹24,000 / year",
    sourceDepartment: "Jaipur Vidyut Vitran Nigam Ltd (JVVNL - BijliMitra)",
    sourceEndpointUri: "rajsewadwaar://discom-bijlimitra/v2/consumer-ledger",
    statefulPredicateSummary: "KNO_21049201122: (Annual_Bill / 3_Linked_Families) < $MAX_DISCOM_BILL",
    cureWindowDaysLeft: 12,
    cureWindowExpiryDate: "15-Nov-2026",
    mobileNumberMasked: "+91-9829X-XXXX1",
    smsTranscriptHindi:
      "प्रिय कमला देवी, सामाजिक सुरक्षा पेंशन में बिजली बिल (₹28,500) जांच हेतु आपकी पेंशन अस्थायी रूप से सुरक्षित समीक्षा में है। 15 दिन में ई-मित्र पर जन-आधार लेकर संपर्क करें। केस: RJ-SSP-2026-8821.",
    ivrTranscriptHindi:
      "नमस्ते कमला देवी जी। राजस्थान सामाजिक सुरक्षा विभाग द्वारा सूचित किया जाता है कि आपके घर के बिजली बिल K-Number 21049201122 में वार्षिक बिल ₹28,500 दर्ज हुआ है। आपकी पेंशन बंद नहीं की गई है, बल्कि 15 दिन के लिए सुरक्षित समीक्षा में रखी गई है। कृपया अपने नजदीकी ई-मित्र केंद्र पर जाकर स्पष्टीकरण दर्ज करवाएं।",
    allowedRebuttals: [
      {
        id: "SHARED_METER_JOINT_FAMILY",
        operatorCode: "T4",
        labelHindi: "[T4] संयुक्त परिवार - एक ही पैतृक मीटर पर 3 अलग-अलग जन-आधार परिवार निवासरत",
        labelEnglish: "T4 Denominator Split: Shared single meter across 3 linked Jan Aadhaar 2.0 families",
        requiredEvidence: "Jan Aadhaar 2.0 Split-Family Lineage Check + Biometric eKYC",
      },
      {
        id: "INCORRECT_KNUMBER_LINKAGE",
        operatorCode: "T1",
        labelHindi: "[T1] गलत K-Number जन-आधार में लिंक हुआ (पड़ोसी/मकान मालिक का मीटर)",
        labelEnglish: "T1 Sever Wrong Link: Incorrect K-Number mapped to Jan Aadhaar profile",
        requiredEvidence: "Actual Consumer Electricity Bill Copy + Counter-Seeding",
      },
      {
        id: "FAULTY_BILL_DISCOM_RECTIFIED",
        operatorCode: "T5",
        labelHindi: "[T5] विद्युत निगम द्वारा गलत/अस्थायी बिल जारी हुआ था जो संशोधित हो चुका है",
        labelEnglish: "T5 Value/Exemption Override: Provisional bill rectified by Discom AEN or BPL/Aastha Exempt",
        requiredEvidence: "JVVNL Rectified Ledger Statement with AEN Seal",
      },
      {
        id: "OTHER_EXCEPTIONAL_GROUND",
        operatorCode: "T6",
        labelHindi: "[T6] अन्य विशेष परिस्थिति — उपखंड अधिकारी / BDO मानवीय समीक्षा हेतु",
        labelEnglish: "T6 Natural Justice Escalation: Exceptional circumstance outside T1-T5",
        requiredEvidence: "Mandatory Official Supporting Document (Panchnama / Order) + Statement",
        isTier2Escalation: true,
      },
    ],
  },

  "CASE_VAHAN_RAMLAL": {
    caseId: "RJ-NFSA-2026-4419",
    janAadhaarId: "5910284711",
    beneficiaryName: "Shri Ram Lal Meena",
    age: 54,
    gender: "Male",
    schemeName: "National Food Security Act (NFSA Priority Household)",
    statutoryCitation:
      "Dept. of Food & Civil Supplies Notification dated 20.07.2017, Clause 5 (read with S.Q. Masood v. State of Telangana, 2022)",
    appellateAuthorityTitle: "District Supply Officer (DSO) / Sub-Divisional Officer (SDO), Phagi",
    lgdWardCode: "042305",
    tehsil: "Phagi",
    district: "Jaipur Rural",
    ruleCode: "RULE_VAHAN_4W",
    ruleDescription: "Four-Wheeler Light Motor Vehicle (LMV) Registered under Household Member (K03)",
    flaggedValue: "Maruti Alto 800 (Reg: RJ-14-CC-4821, Reg Year: 2011)",
    thresholdValue: "0 Four-Wheeler (1 Tractor / 1 Livelihood Commercial Vehicle Exempt)",
    sourceDepartment: "Transport Department (MoRTH Vahan 4.0 Registry)",
    sourceEndpointUri: "apisetu://morth-vahan/v4/rc-ownership-telemetry",
    statefulPredicateSummary: "RC_RJ14CC4821: Dispossessed_2019 == True && Applicant_Renewal_Activity == False",
    cureWindowDaysLeft: 9,
    cureWindowExpiryDate: "12-Nov-2026",
    mobileNumberMasked: "+91-9414X-XXXX8",
    smsTranscriptHindi:
      "प्रिय राम लाल मीणा, खाद्य सुरक्षा (राशन) पात्रता में वाहन डेटा (RJ-14-CC-4821) के कारण आपकी पात्रता 15 दिन की समीक्षा में है। ई-मित्र पर विक्रय दस्तावेज लेकर जाएं। केस: RJ-NFSA-2026-4419.",
    ivrTranscriptHindi:
      "नमस्ते राम लाल जी। खाद्य सुरक्षा विभाग द्वारा सूचित किया जाता है कि वाहन पंजीयन पोर्टल के अनुसार आपके नाम पर कार RJ-14-CC-4821 दर्ज है। यदि आपने यह वाहन बेच दिया है या कबाड़ हो चुका है, तो अपनी पात्रता बहाल रखने हेतु नजदीकी ई-मित्र पर फॉर्म 29-30 अथवा विक्रय रसीद प्रस्तुत करें।",
    allowedRebuttals: [
      {
        id: "VEHICLE_SOLD_UNTRANSFERRED_RC",
        operatorCode: "T2",
        labelHindi: "[T2] वाहन वर्षों पूर्व बेच दिया गया - क्रेता ने RTO में आरसी ट्रांसफर नहीं कराई",
        labelEnglish: "T2 Temporal Cutoff: Vehicle sold years ago on Form 29/30; buyer failed to transfer RC",
        requiredEvidence: "Signed Form 29/30 + Sale Delivery Note + Vahan Fitness/Insurance Expiry Check",
      },
      {
        id: "VEHICLE_SCRAPPED_TOTAL_LOSS",
        operatorCode: "T2",
        labelHindi: "[T2] वाहन 15 वर्ष पुराना/कबाड़ (RVSF) अथवा चोरी होकर नष्ट हो चुका है",
        labelEnglish: "T2 Temporal Cutoff: Vehicle scrapped at Registered Vehicle Scrapping Facility (RVSF) or Theft FIR",
        requiredEvidence: "RVSF Certificate of Deposit / Deregistration or Police FIR",
      },
      {
        id: "VEHICLE_LIVELIHOOD_EXEMPT",
        operatorCode: "T5",
        labelHindi: "[T5] वाहन आजीविका हेतु एकमात्र टैक्सी/वाणिज्यिक वाहन अथवा ट्रैक्टर है (अधिसूचना 20.07.2017 छूट)",
        labelEnglish: "T5 Statutory Exemption: Sole livelihood commercial vehicle or tractor under Notification 20.07.2017 Cl. 5",
        requiredEvidence: "Vahan 4.0 Commercial Permit / Tractor Classification Check",
      },
      {
        id: "OTHER_EXCEPTIONAL_GROUND",
        operatorCode: "T6",
        labelHindi: "[T6] अन्य विशेष परिस्थिति — जिला रसद अधिकारी (DSO) / SDO समीक्षा हेतु",
        labelEnglish: "T6 Natural Justice Escalation: Exceptional circumstance (e.g., Identity-theft loan FIR)",
        requiredEvidence: "Mandatory Official Supporting Document (FIR / Court Order) + Statement",
        isTier2Escalation: true,
      },
    ],
  },

  "CASE_RAILWAY_GOVT_SON": {
    caseId: "RJ-NFSA-2026-9104",
    janAadhaarId: "6738291044",
    beneficiaryName: "Shri Bhanwar Lal Jat",
    age: 61,
    gender: "Male",
    schemeName: "National Food Security Act (NFSA Priority Household)",
    statutoryCitation:
      "Dept. of Food & Civil Supplies Notification dated 20.07.2017, Clause 5 & DFPD Rightful Targeting Directive (Nov 2026)",
    appellateAuthorityTitle: "District Supply Officer (DSO) / Sub-Divisional Officer (SDO), Dausa",
    lgdWardCode: "041820",
    tehsil: "Dausa",
    district: "Dausa",
    ruleCode: "RULE_GOVT_EMP_K01",
    ruleDescription: "Member-Level Aadhaar Matched Active Government / Railway Payroll (K01 - 1.82L Railway Drive)",
    flaggedValue: "Member #4: Rahul Jat (Son, Age 24) -> Indian Railways HRMS (Group-D Trackman, Prayagraj)",
    thresholdValue: "No Regular Central/State/PSU Employee in Household",
    sourceDepartment: "DFPD Central Feed + Indian Railways HRMS (CRIS)",
    sourceEndpointUri: "apisetu://indian-railways-hrms/v1/employee-status",
    statefulPredicateSummary: "JA_6738291044: Member_04_Split_Completed == True && Remaining_3_Members_Payroll == False",
    cureWindowDaysLeft: 14,
    cureWindowExpiryDate: "17-Nov-2026",
    mobileNumberMasked: "+91-9784X-XXXX2",
    smsTranscriptHindi:
      "प्रिय भंवर लाल जाट, आपके राशन कार्ड/जन-आधार के सदस्य राहुल जाट (पुत्र) का रेलवे HRMS वेतनमान में मिलान हुआ है। परिवार का राशन बंद होने से बचाने हेतु 15 दिन में ई-मित्र पर सदस्य पृथक्करण (Member Split) करें। केस: RJ-NFSA-2026-9104.",
    ivrTranscriptHindi:
      "नमस्ते भंवर लाल जी। भारत सरकार के खाद्य विभाग एवं रेलवे बोर्ड मिलान में आपके परिवार के सदस्य राहुल जाट सरकारी सेवा में पाए गए हैं। बुजुर्ग माता-पिता का राशन चालू रखने के लिए कृपया नजदीकी ई-मित्र पर जाकर केवल कार्यरत पुत्र का नाम राशन कार्ड से पृथक (Member Split) करवाएं।",
    allowedRebuttals: [
      {
        id: "EMPLOYED_SON_MEMBER_SPLIT",
        operatorCode: "T3",
        labelHindi: "[T3] कार्यरत पुत्र/विवाहित पुत्री अलग निवास करते हैं — केवल उस सदस्य की यूनिट हटाकर शेष परिवार की पात्रता जारी रखें",
        labelEnglish: "T3 Member Split: Employed son/married daughter lives separately; delete only their 5 kg unit & keep parents' card active",
        requiredEvidence: "Jan Aadhaar 2.0 Relation Check (Son/Daughter) + e-POS Non-Drawal Check + 1-Click Member Deletion",
      },
      {
        id: "CONTRACTUAL_HONORARIUM_WORKER",
        operatorCode: "T5",
        labelHindi: "[T5] सदस्य नियमित सरकारी कर्मचारी नहीं बल्कि संविदा / मानदेय कर्मी (आंगनबाड़ी/आशा/अप्रेंटिस) है",
        labelEnglish: "T5 Nature Override: Member is an apprentice/contractual/honorarium worker, not regular payroll",
        requiredEvidence: "IFMS / HRMS Employment Nature Code Verification",
      },
      {
        id: "DECEASED_EMPLOYEE_FLOW_EXTINGUISHED",
        operatorCode: "T3",
        labelHindi: "[T3] संबंधित कर्मचारी का निधन हो चुका है (पहचान पोर्टल मृत्यु प्रमाण-पत्र सत्यापित)",
        labelEnglish: "T3 Deceased Flow Extinguished: Flagged salary earner is deceased (verified via Pehchan CRS)",
        requiredEvidence: "Pehchan Portal Death Registration No. (Flow income extinguishes to ₹0)",
      },
      {
        id: "OTHER_EXCEPTIONAL_GROUND",
        operatorCode: "T6",
        labelHindi: "[T6] अन्य विशेष परिस्थिति — जिला रसद अधिकारी (DSO) / SDO समीक्षा हेतु",
        labelEnglish: "T6 Natural Justice Escalation: Exceptional ground requiring manual officer review",
        requiredEvidence: "Mandatory Official Supporting Document + Statement",
        isTier2Escalation: true,
      },
    ],
  },
};

// Mock Master Database of Jan Aadhaar 2.0 Families residing in Bassi Ward 042110
const JAN_AADHAAR_MOCK_REGISTRY: Record<
  string,
  { name: string; relation: string; parentJanAadhaarId: string; fatherHusband: string; ward: string; address: string }
> = {
  "4829103847": {
    name: "Kamla Devi",
    relation: "Self (Widow Mother - HOF)",
    parentJanAadhaarId: "JA-ROOT-1998-042110",
    fatherHusband: "Late Ramesh Meena",
    ward: "042110",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
  "4829103848": {
    name: "Suresh Meena",
    relation: "Son (Split Nuclear Card #2)",
    parentJanAadhaarId: "JA-ROOT-1998-042110",
    fatherHusband: "Late Ramesh Meena",
    ward: "042110",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
  "4829103849": {
    name: "Mahesh Meena",
    relation: "Son (Split Nuclear Card #3)",
    parentJanAadhaarId: "JA-ROOT-1998-042110",
    fatherHusband: "Late Ramesh Meena",
    ward: "042110",
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

/**
 * Moat Function 1: Deterministic Jan Aadhaar 2.0 Split-Family Graph & Anti-Collision Resolution (T4)
 * Audit Fix #21: Zero fuzzy string-similarity; uses deterministic Parent-Family ID + LGD Ward equality,
 * safe lookup on primaryJanAadhaar, supports N >= 2, and compares exact unrounded share.
 */
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
        fatherHusbandLineageMatch: "Primary Jan Aadhaar ID not found in LGD registry",
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
        fatherHusbandLineageMatch: "Late Ramesh Meena (Confirmed via Jan Aadhaar 2.0 Parent Family ID)",
        antiGamingCollisionPass: false,
        collisionDetails:
          "COLLISION ALERT: Co-residing Jan Aadhaar ID 4829103848 was already registered to dilute Meter K-No 21088492011 in Jamwa Ramgarh on 12-Jan-2026. Cannot be reused for meter split.",
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
        "Parent Family ID JA-ROOT-1998-042110 & Shared Father/Husband (Late Ramesh Meena) deterministically verified in LGD 042110",
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

/**
 * Moat Function 2: Vahan 4.0 Statutory RC/Fitness/Tax/Insurance & Form 29/30 Verification (T2)
 */
export function runVahanFootprintCheck(simulateFraud: boolean = false): VahanFootprintResult {
  if (simulateFraud) {
    return {
      verified: false,
      statusCode: "SUSPECTED_FRAUD_ACTIVE_RC",
      confidenceScore: 0.18,
      saleDateExtracted: "15-Oct-2026 (Backdated Post-Notice Stamp Paper)",
      vehicleAgeYears: 15,
      advisoryDecision: "RECOMMEND_REJECT",
      telemetrySignals: {
        form2930Verified: false,
        vahanRcStatus: "ACTIVE_IN_USE (Fitness & Green Tax Renewed in 2026)",
        fitnessAndTaxExpiry: "Valid up to 18-Aug-2028 (Recently Renewed at DTO Jaipur)",
        insurancePolicyStatus: "Active Policy in Applicant's Name (Renewed Oct 2026)",
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
    saleDateExtracted: "14-May-2019",
    vehicleAgeYears: 15,
    advisoryDecision: "RECOMMEND_RESTORE_WITH_PREDICATE",
    telemetrySignals: {
      form2930Verified: true,
      vahanRcStatus: "ELV_EXPIRED_15YR (Form 29/30 Sale Delivery Logged; Buyer Transfer Pending)",
      fitnessAndTaxExpiry: "Expired on 10-Mar-2026 (>15 Yr End-of-Life Vehicle)",
      insurancePolicyStatus: "No Policy Linked to Applicant Aadhaar Since May 2019",
      applicantRenewalActivityPast36Months: false,
      explanationHindi:
        "सत्यापित: 14-मई-2019 को फॉर्म 29/30 एवं डिलीवरी नोट द्वारा वाहन विक्रय हुआ। वाहन 4.0 पोर्टल पर 15-वर्षीय पंजीकरण समाप्त हो चुका है तथा विगत 5 वर्षों में आवेदक के आधार से कोई फिटनेस या बीमा नवीनीकरण नहीं हुआ है।",
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

/**
 * Moat Function 3: 1.82 Lakh Railway / Govt Employee Member-Split & e-POS Non-Drawal Verifier (T3)
 */
export function runMemberSplitGraphCheck(simulateActiveFraud: boolean = false): MemberSplitGraphResult {
  if (simulateActiveFraud) {
    return {
      verified: false,
      statusCode: "HOF_ACTIVE_EMPLOYEE_FRAUD",
      flaggedMemberName: "Bhanwar Lal Jat (Self - Head of Family)",
      relationCodeInJanAadhaar: "Code 01: SELF / HEAD_OF_HOUSEHOLD",
      employerVerified: "Indian Railways HRMS (Active Pay Level-4, Jaipur Division)",
      eposGrainDrawnByFlaggedMemberKg: 180,
      remainingEligibleMembersCount: 0,
      revisedMonthlyQuotaKg: 0,
      advisoryDecision: "RECOMMEND_CANCEL_CARD_RECOVERY",
      explanationHindi:
        "गंभीर उल्लंघन: जन-आधार 2.0 ग्राफ के अनुसार सरकारी कर्मचारी स्वयं परिवार का मुखिया (HOF) है तथा e-POS बायोमेट्रिक लॉग के अनुसार विगत 12 माह में स्वयं के अंगूठे से 180 किग्रा मुफ्त राशन उठाया गया है। राशन कार्ड निरस्त कर वसूली योग्य।",
    };
  }

  return {
    verified: true,
    statusCode: "MEMBER_SPLIT_READY_PARENTS_PROTECTED",
    flaggedMemberName: "Rahul Jat (Member #4)",
    relationCodeInJanAadhaar: "Code 04: SON (Adult Child Living Separately in Prayagraj)",
    employerVerified: "Indian Railways HRMS (Group-D Trackman, Joined Aug 2025)",
    eposGrainDrawnByFlaggedMemberKg: 0,
    remainingEligibleMembersCount: 3,
    revisedMonthlyQuotaKg: 15,
    advisoryDecision: "RECOMMEND_MEMBER_SPLIT_KEEP_CARD",
    explanationHindi:
      "सत्यापित (T3 Member Split): जन-आधार 2.0 फैमिली ग्राफ के अनुसार कार्यरत सदस्य 'पुत्र (Code 04)' है। DFPD e-POS बायोमेट्रिक रिकॉर्ड के अनुसार नौकरी लगने के बाद राहुल जाट ने 0 किग्रा राशन उठाया है। केवल पुत्र की 5 किग्रा यूनिट हटाकर बुजुर्ग माता-पिता (3 सदस्य = 15 किग्रा/माह) का राशन कार्ड सुरक्षित रखा जाए।",
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

/**
 * Audit Fix #20: Explicit handler for T1, T5, and T6 (Natural Justice Tier-2 Escalation) options.
 */
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
      explanationHindi: `प्राकृतिक न्याय एस्केलेशन (T6): मानक T1–T5 से भिन्न विशेष परिस्थिति दर्ज की गई। संलग्न आधिकारिक दस्तावेज़ (${documentReference}) को अपीलीय अधिकारी / पटवारी भौतिक पंचनामा समीक्षा हेतु अग्रेषित किया गया है। 15-दिवसीय सुरक्षा विंडो सक्रिय रहेगी।`,
      explanationEnglish: `Natural Justice Escalation (T6): Exceptional circumstance outside T1–T5 logged with official document ref (${documentReference}). Routed to Appellate Officer / Field Panchnama queue while keeping the 15-day cure window protected.`,
    };
  }

  return {
    verified: true,
    operatorCode,
    statusCode: "T1_T5_REGISTRY_OVERRIDE_VERIFIED",
    documentReference,
    recommendedBdoAction: "APPROVED",
    explanationHindi: `सत्यापित (${operatorCode} - ${rebuttalId}): विभागीय स्रोत रजिस्ट्री एवं प्रस्तुत साक्ष्य का मिलान सफल रहा। आवेदक की पात्रता बहाल रखने की अनुशंसा की जाती है।`,
    explanationEnglish: `Verified (${operatorCode} - ${rebuttalId}): Source registry cross-check succeeded. Recommended for immediate benefit restoration.`,
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

/**
 * Moat Function 4: Stateful "Delta-Watcher" Predicate Evaluator
 * Audit Fix #22: Compare exact unrounded `nextMonthBill / families < customThreshold` before rounding for display.
 */
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
        "विद्युत निगम द्वारा अलग मीटर स्थापित कर दिया गया है। पुराना संयुक्त K-Number निरस्त हुआ। अब प्रत्येक परिवार अपने व्यक्तिगत मीटर बिल के आधार पर आकलित होगा।",
      reasonEnglish:
        "Discom segregated connections. Old joint K-Number superseded. Each family is now evaluated independently on their separate meter.",
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
      reasonHindi: `संयुक्त मीटर बिल ₹${nextMonthBill.toLocaleString("en-IN")} को ${divisor} सत्यापित परिवारों में विभाजित करने पर प्रति परिवार हिस्सा ₹${displayShare.toLocaleString("en-IN")} है (सीमा ₹${customThreshold.toLocaleString("en-IN")} से कम)। सुरक्षा शील्ड सक्रिय है।`,
      reasonEnglish: `Joint meter bill ₹${nextMonthBill.toLocaleString("en-IN")} divided among ${divisor} verified families gives ₹${displayShare.toLocaleString("en-IN")}/family (strictly below ₹${customThreshold.toLocaleString("en-IN")} limit). Protection shield active.`,
    };
  } else {
    return {
      shieldStatus: "SHIELD_REVOKED_SPIKE",
      effectiveAnnualBill: nextMonthBill,
      effectivePerFamilyShare: displayShare,
      activeThreshold: customThreshold,
      isBenefitProtected: false,
      reasonHindi: `अलर्ट: संयुक्त बिजली बिल बढ़कर ₹${nextMonthBill.toLocaleString("en-IN")} हो गया है। ${divisor} परिवारों में बांटने पर भी प्रति परिवार ₹${displayShare.toLocaleString("en-IN")} आता है, जो ₹${customThreshold.toLocaleString("en-IN")} सीमा के बराबर या अधिक है! सुरक्षा शील्ड स्वतः निरस्त हुई।`,
      reasonEnglish: `ALERT: Joint electricity bill surged to ₹${nextMonthBill.toLocaleString("en-IN")}. Even split across ${divisor} families, per-family share reaches ₹${displayShare.toLocaleString("en-IN")} (>= ₹${customThreshold.toLocaleString("en-IN")}). Shield auto-revoked.`,
    };
  }
}
