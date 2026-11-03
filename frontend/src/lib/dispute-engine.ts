import stringSimilarity from "string-similarity";

export type CaseStatus =
  | "FLAGGED_IN_CURE_WINDOW"
  | "EMITRA_REBUTTAL_SUBMITTED"
  | "RESTORED_WITH_PREDICATE_SHIELD"
  | "FIELD_VISIT_ORDERED"
  | "EXCLUSION_UPHELD";

export interface ExclusionNoticeCase {
  caseId: string;
  janAadhaarId: string;
  beneficiaryName: string;
  age: number;
  gender: string;
  schemeName: string;
  lgdWardCode: string;
  tehsil: string;
  district: string;
  ruleCode: "RULE_DISCOM_24K" | "RULE_VAHAN_4W";
  ruleDescription: string;
  flaggedValue: string;
  thresholdValue: string;
  sourceDepartment: string;
  cureWindowDaysLeft: number;
  cureWindowExpiryDate: string;
  mobileNumberMasked: string;
  smsTranscriptHindi: string;
  ivrTranscriptHindi: string;
  allowedRebuttals: Array<{
    id: string;
    labelHindi: string;
    labelEnglish: string;
    requiredEvidence: string;
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
    lgdWardCode: "042110",
    tehsil: "Bassi",
    district: "Jaipur Rural",
    ruleCode: "RULE_DISCOM_24K",
    ruleDescription: "Annual Electricity Consumption Bill >= ₹24,000 across linked Jan Aadhaar household",
    flaggedValue: "₹28,500 / year (Discom K-No: 21049201122)",
    thresholdValue: "₹24,000 / year",
    sourceDepartment: "Jaipur Vidyut Vitran Nigam Ltd (JVVNL)",
    cureWindowDaysLeft: 12,
    cureWindowExpiryDate: "15-Nov-2026",
    mobileNumberMasked: "+91-9829X-XXXX1",
    smsTranscriptHindi:
      "प्रिय कमला देवी, सामाजिक सुरक्षा पेंशन में बिजली बिल (₹28,500) जांच हेतु आपकी पेंशन अस्थायी रूप से सुरक्षित समीक्षा में है। 15 दिन में ई-मित्र पर जन-आधार लेकर संपर्क करें। केस: RJ-SSP-2026-8821.",
    ivrTranscriptHindi:
      "नमस्ते कमला देवी जी। राजस्थान सामाजिक सुरक्षा विभाग द्वारा सूचित किया जाता है कि आपके घर के बिजली बिल K-Number 21049201122 में वार्षिक बिल ₹28,500 दर्ज हुआ है। आपकी पेंशन बंद नहीं की गई है, बल्कि 15 दिन के लिए सुरक्षित समीक्षा में रखी गई है। कृपया तुरंत अपने नजदीकी ई-मित्र केंद्र पर जाकर स्पष्टीकरण दर्ज करवाएं।",
    allowedRebuttals: [
      {
        id: "SHARED_METER_JOINT_FAMILY",
        labelHindi: "संयुक्त परिवार - एक ही मीटर पर 3 अलग-अलग जन-आधार परिवार निवासरत",
        labelEnglish: "Joint Family: Shared single meter among 3 distinct Jan Aadhaar families",
        requiredEvidence: "Co-residing Brothers' Jan Aadhaar IDs + Biometric eKYC + Live Meter Photo",
      },
      {
        id: "INCORRECT_KNUMBER_LINKAGE",
        labelHindi: "गलत K-Number जन-आधार में लिंक हुआ (पड़ोसी/किरायेदार का मीटर)",
        labelEnglish: "Incorrect K-Number mapped to Jan Aadhaar profile",
        requiredEvidence: "Actual Consumer Electricity Bill Copy + Self Affidavit",
      },
      {
        id: "FAULTY_BILL_DISCOM_RECTIFIED",
        labelHindi: "विद्युत निगम द्वारा गलत/अस्थायी बिल जारी हुआ था जो संशोधित हो चुका है",
        labelEnglish: "Provisional/Faulty bill rectified by Discom Assistant Engineer",
        requiredEvidence: "JVVNL Rectified Ledger Statement with AEN Seal",
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
    lgdWardCode: "042305",
    tehsil: "Phagi",
    district: "Jaipur Rural",
    ruleCode: "RULE_VAHAN_4W",
    ruleDescription: "Four-Wheeler Light Motor Vehicle (LMV) Registered under Head of Family / Member",
    flaggedValue: "Maruti Alto 800 (Reg: RJ-14-CC-4821, Reg Year: 2011)",
    thresholdValue: "0 Four-Wheeler (Excluding commercial tractor/auto)",
    sourceDepartment: "Transport Department (Vahan 4.0 Database)",
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
        labelHindi: "वाहन वर्षों पूर्व बेच दिया गया - क्रेता ने आरसी ट्रांसफर नहीं कराई",
        labelEnglish: "Vehicle Sold Years Ago: Buyer failed to complete RTO RC Transfer",
        requiredEvidence: "Form 29/30 + Delivery Receipt / Notarized Agreement + Buyer Phone/ID",
      },
      {
        id: "VEHICLE_SCRAPPED_TOTAL_LOSS",
        labelHindi: "वाहन 15 वर्ष पुराना/कबाड़/दुर्घटनाग्रस्त होकर नष्ट हो चुका है",
        labelEnglish: "Vehicle Scrapped / Written Off / End of Life Vehicle",
        requiredEvidence: "Registered Vehicle Scrapping Facility (RVSF) Certificate or Police FIR",
      },
    ],
  },
};

// Mock Master Database of Jan Aadhaar Families residing in Bassi Ward 042110
const JAN_AADHAAR_MOCK_REGISTRY: Record<
  string,
  { name: string; relation: string; fatherHusband: string; ward: string; address: string }
> = {
  "4829103847": {
    name: "Kamla Devi",
    relation: "Self (Widow)",
    fatherHusband: "Late Ramesh Meena",
    ward: "042110",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
  "4829103848": {
    name: "Suresh Meena",
    relation: "Son (Head of Separate Family 2)",
    fatherHusband: "Late Ramesh Meena",
    ward: "042110",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
  "4829103849": {
    name: "Mahesh Meena",
    relation: "Son (Head of Separate Family 3)",
    fatherHusband: "Late Ramesh Meena",
    ward: "042110",
    address: "Meena Mohalla, Near Old Baori, Bassi",
  },
};

// Known K-Number Collision Tracker (Simulates state-wide anti-gaming ledger)
const ACTIVE_KNUMBER_CLAIMS: Record<string, { usedByJanAadhaar: string; district: string; date: string }> = {
  "JAN-COLLISION-FRAUD": {
    usedByJanAadhaar: "4829103848",
    district: "Jamwa Ramgarh",
    date: "2026-01-12",
  },
};

export interface MultiFamilyGraphResult {
  verified: boolean;
  statusCode: "GRAPH_VERIFIED_SUCCESS" | "COLLISION_DETECTED" | "ADDRESS_MISMATCH_FRAUD";
  lineageSimilarityScore: number;
  totalAnnualBill: number;
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
 * Moat Function 1: Multi-Family Graph & Lineage Resolution
 * Resolves shared meter claims algorithmically using Jan Aadhaar lineage matching & collision detection.
 */
export function runMultiFamilyGraphCheck(
  primaryJanAadhaar: string,
  coResidingJanAadhaars: string[],
  simulateCollision: boolean = false
): MultiFamilyGraphResult {
  const primary = JAN_AADHAAR_MOCK_REGISTRY[primaryJanAadhaar];
  const allIds = [primaryJanAadhaar, ...coResidingJanAadhaars];

  // 1. Anti-Gaming Collision Check
  if (simulateCollision) {
    return {
      verified: false,
      statusCode: "COLLISION_DETECTED",
      lineageSimilarityScore: 0.94,
      totalAnnualBill: 28500,
      verifiedFamilyCount: 3,
      apportionedBillPerFamily: 9500,
      isWithinThreshold: true,
      advisoryDecision: "RECOMMEND_REJECT",
      detailedProof: {
        addressMatches: true,
        fatherHusbandLineageMatch: "Late Ramesh Meena (Confirmed Ancestral House)",
        antiGamingCollisionPass: false,
        collisionDetails:
          "COLLISION ALERT: Co-residing Jan Aadhaar ID 4829103848 was already registered to dilute Meter K-No 21088492011 in Jamwa Ramgarh on 12-Jan-2026. Cannot be reused for meter split.",
        verifiedMembers: [],
      },
    };
  }

  // 2. Lineage and Address Graph Resolution
  const verifiedMembers = [];
  let lineageScores: number[] = [];

  for (const id of allIds) {
    const record = JAN_AADHAAR_MOCK_REGISTRY[id];
    if (record) {
      verifiedMembers.push({ janAadhaarId: id, name: record.name, relation: record.relation });
      const sim = stringSimilarity.compareTwoStrings(record.address, primary.address);
      lineageScores.push(sim);
    }
  }

  const avgLineage =
    lineageScores.length > 0
      ? lineageScores.reduce((a, b) => a + b, 0) / lineageScores.length
      : 0;

  const totalBill = 28500;
  const familyCount = verifiedMembers.length;
  const apportionedBill = familyCount > 0 ? Math.round(totalBill / familyCount) : totalBill;
  const isWithin = apportionedBill < 24000;

  return {
    verified: familyCount >= 3 && avgLineage >= 0.85,
    statusCode: "GRAPH_VERIFIED_SUCCESS",
    lineageSimilarityScore: parseFloat(avgLineage.toFixed(2)),
    totalAnnualBill: totalBill,
    verifiedFamilyCount: familyCount,
    apportionedBillPerFamily: apportionedBill,
    isWithinThreshold: isWithin,
    advisoryDecision: isWithin ? "RECOMMEND_RESTORE_WITH_PREDICATE" : "FLAG_FOR_FIELD_PANCHNAMA",
    detailedProof: {
      addressMatches: true,
      fatherHusbandLineageMatch: "Late Ramesh Meena (Shared ancestral plot verified in LGD 042110)",
      antiGamingCollisionPass: true,
      verifiedMembers,
    },
  };
}

export interface VahanFootprintResult {
  verified: boolean;
  statusCode: "DISPOSSESSION_VERIFIED" | "SUSPECTED_FRAUD_ACTIVE_USAGE";
  confidenceScore: number;
  saleDateExtracted: string;
  vehicleAgeYears: number;
  advisoryDecision: "RECOMMEND_RESTORE_WITH_PREDICATE" | "RECOMMEND_REJECT";
  telemetrySignals: {
    form2930OcrMatch: boolean;
    buyerMobileMasked: string;
    buyerDistrict: string;
    lastFastagPayerMismatch: boolean;
    lastInsurancePayerMismatch: boolean;
    applicantActivityPast36Months: boolean;
    explanationHindi: string;
  };
}

/**
 * Moat Function 2: Vahan Cross-Footprint Corroboration Matrix
 * Proves vehicle dispossession without waiting months for RTO transfer.
 */
export function runVahanFootprintCheck(simulateFraud: boolean = false): VahanFootprintResult {
  if (simulateFraud) {
    return {
      verified: false,
      statusCode: "SUSPECTED_FRAUD_ACTIVE_USAGE",
      confidenceScore: 0.18,
      saleDateExtracted: "15-Oct-2026 (Post-Exclusion Notice Date)",
      vehicleAgeYears: 15,
      advisoryDecision: "RECOMMEND_REJECT",
      telemetrySignals: {
        form2930OcrMatch: false,
        buyerMobileMasked: "+91-9414X-XXXX8 (Same as Applicant)",
        buyerDistrict: "Phagi (Jaipur Rural)",
        lastFastagPayerMismatch: false,
        lastInsurancePayerMismatch: false,
        applicantActivityPast36Months: true,
        explanationHindi:
          "दस्तावेज़ संदिग्ध: विक्रय पत्र नोटिस जारी होने के बाद की तिथि का है, तथा फास्टैग एवं बीमा अभी भी आवेदक के मोबाइल से नवीनीकृत हो रहे हैं।",
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
      form2930OcrMatch: true,
      buyerMobileMasked: "+91-98294-XXXXX",
      buyerDistrict: "Sikar, Rajasthan",
      lastFastagPayerMismatch: true,
      lastInsurancePayerMismatch: true,
      applicantActivityPast36Months: false,
      explanationHindi:
        "सत्यापित: 14-मई-2019 को वाहन विक्रय हुआ। विगत 5 वर्षों में फास्टैग एवं तृतीय पक्ष बीमा नवीनीकरण पूर्णतः क्रेता (सीकर) द्वारा किया गया है। आवेदक की कोई सक्रियता नहीं मिली।",
    },
  };
}

export interface DeltaWatcherEvaluation {
  shieldStatus: "SHIELD_ACTIVE_PROTECTED" | "SHIELD_REVOKED_SPIKE" | "SHIELD_REVOKED_METERS_SPLIT";
  effectiveAnnualBill: number;
  effectivePerFamilyShare: number;
  isBenefitProtected: boolean;
  reasonHindi: string;
  reasonEnglish: string;
}

/**
 * Moat Function 3: Stateful "Delta-Watcher" Predicate Evaluator
 * Evaluates in real time what happens next month when SMART re-checks Discom.
 */
export function evaluateDeltaWatcherPredicate(
  nextMonthBill: number,
  linkedFamiliesCount: number,
  isMeterSegregated: boolean
): DeltaWatcherEvaluation {
  if (isMeterSegregated) {
    return {
      shieldStatus: "SHIELD_REVOKED_METERS_SPLIT",
      effectiveAnnualBill: nextMonthBill,
      effectivePerFamilyShare: nextMonthBill,
      isBenefitProtected: nextMonthBill < 24000,
      reasonHindi:
        "विद्युत निगम द्वारा अलग मीटर स्थापित कर दिया गया है। पुराना संयुक्त K-Number निरस्त हुआ। अब प्रत्येक परिवार अपने व्यक्तिगत मीटर बिल के आधार पर आकलित होगा।",
      reasonEnglish:
        "Discom segregated connections. Old joint K-Number superseded. Each family is now evaluated independently on their separate meter.",
    };
  }

  const effectiveShare = Math.round(nextMonthBill / Math.max(1, linkedFamiliesCount));
  const isProtected = effectiveShare < 24000;

  if (isProtected) {
    return {
      shieldStatus: "SHIELD_ACTIVE_PROTECTED",
      effectiveAnnualBill: nextMonthBill,
      effectivePerFamilyShare: effectiveShare,
      isBenefitProtected: true,
      reasonHindi: `संयुक्त मीटर बिल ₹${nextMonthBill.toLocaleString("en-IN")} को ${linkedFamiliesCount} सत्यापित परिवारों में विभाजित करने पर प्रति परिवार हिस्सा ₹${effectiveShare.toLocaleString("en-IN")} है (सीमा ₹24,000 से कम)। पेंशन सुरक्षा शील्ड सक्रिय है।`,
      reasonEnglish: `Joint meter bill ₹${nextMonthBill.toLocaleString("en-IN")} divided among ${linkedFamiliesCount} verified families gives ₹${effectiveShare.toLocaleString("en-IN")}/family (below ₹24k limit). Protection shield active.`,
    };
  } else {
    return {
      shieldStatus: "SHIELD_REVOKED_SPIKE",
      effectiveAnnualBill: nextMonthBill,
      effectivePerFamilyShare: effectiveShare,
      isBenefitProtected: false,
      reasonHindi: `अलर्ट: संयुक्त बिजली बिल बढ़कर ₹${nextMonthBill.toLocaleString("en-IN")} हो गया है। ${linkedFamiliesCount} परिवारों में बांटने पर भी प्रति परिवार ₹${effectiveShare.toLocaleString("en-IN")} आता है, जो ₹24,000 सीमा से अधिक है! सुरक्षा शील्ड स्वतः निरस्त हुई।`,
      reasonEnglish: `ALERT: Joint electricity bill surged to ₹${nextMonthBill.toLocaleString("en-IN")}. Even split across ${linkedFamiliesCount} families, per-family share is ₹${effectiveShare.toLocaleString("en-IN")} (exceeds ₹24k). Shield auto-revoked.`,
    };
  }
}
