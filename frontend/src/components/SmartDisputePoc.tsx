"use client";

import React, { useState, useEffect } from "react";
import {
  SEEDED_CASES,
  SCHEME_PLAYBOOK_PRESETS,
  DisputeCase,
  SchemeId,
  MultiFamilyGraphResult,
  VahanFootprintResult,
  MemberSplitGraphResult,
  AlternativeRebuttalResult,
  DeltaWatcherEvaluation,
} from "@/lib/dispute-engine";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  Sliders,
  Sparkles,
  Scale,
  Car,
  Zap,
  Train,
  Database,
  Settings2,
  Users,
  MapPin,
} from "lucide-react";

interface SmartDisputePocProps {
  onOpenDatabasesModal: () => void;
}

export default function SmartDisputePoc({ onOpenDatabasesModal }: SmartDisputePocProps) {
  const [selectedCaseKey, setSelectedCaseKey] = useState<string>("CASE_DISCOM_KAMLA");
  const [activeTab, setActiveTab] = useState<"step0" | "intake" | "emitra" | "adjudication" | "delta">("step0");

  // Stage 0 Scheme Setup State
  const [selectedPresetKey, setSelectedPresetKey] = useState<SchemeId>("RJ_SSP_PENSION");
  const activePreset = SCHEME_PLAYBOOK_PRESETS[selectedPresetKey];
  const [customDiscomThreshold, setCustomDiscomThreshold] = useState<number>(24000);
  const [customIrrigatedHaCap, setCustomIrrigatedHaCap] = useState<number>(2.0);
  const [simBaraniPumpHa, setSimBaraniPumpHa] = useState<number>(0.5);

  const currentCase: DisputeCase = SEEDED_CASES[selectedCaseKey];

  // Stage 1–2 State
  const [ingressSource, setIngressSource] = useState<"FULL_12_ENDPOINT_ROLL" | "EXTERNAL_BATCH_REVERIFY">(
    "FULL_12_ENDPOINT_ROLL"
  );
  const [isPlayingIvr, setIsPlayingIvr] = useState(false);

  // Stage 3 (e-Mitra) State
  const [selectedRebuttalId, setSelectedRebuttalId] = useState<string>(
    currentCase.allowedRebuttals[0]?.id || ""
  );
  const [simulateCollision, setSimulateCollision] = useState(false);
  const [simulateFraudVahan, setSimulateFraudVahan] = useState(false);
  const [simulateFraudRailway, setSimulateFraudRailway] = useState(false);
  const [tier2ConfirmChecked, setTier2ConfirmChecked] = useState(false);
  const [tier2DocReference, setTier2DocReference] = useState("FIR-2026-RJ-0891 / RAA-STAY-442");
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [graphResult, setGraphResult] = useState<MultiFamilyGraphResult | null>(null);
  const [vahanResult, setVahanResult] = useState<VahanFootprintResult | null>(null);
  const [memberSplitResult, setMemberSplitResult] = useState<MemberSplitGraphResult | null>(null);
  const [altRebuttalResult, setAltRebuttalResult] = useState<AlternativeRebuttalResult | null>(null);

  // Stage 4 (Officer Decision) State
  const [adjudicationDecision, setAdjudicationDecision] = useState<
    "APPROVED" | "FIELD_VISIT" | "REJECTED" | null
  >(null);
  const [isSigningOrder, setIsSigningOrder] = useState(false);

  // Stage 5 (Monthly Auto-Protection) State
  const [nextMonthBill, setNextMonthBill] = useState(28500);
  const [linkedFamilies, setLinkedFamilies] = useState(3);
  const [isMeterSegregated, setIsMeterSegregated] = useState(false);
  const [deltaResult, setDeltaResult] = useState<DeltaWatcherEvaluation | null>(null);

  const handleSelectPreset = (presetKey: SchemeId) => {
    setSelectedPresetKey(presetKey);
    const p = SCHEME_PLAYBOOK_PRESETS[presetKey];
    if (p) {
      setCustomDiscomThreshold(p.maxDiscomBill);
      setCustomIrrigatedHaCap(p.maxIrrigatedHa);
    }
  };

  useEffect(() => {
    const c = SEEDED_CASES[selectedCaseKey];
    setSelectedRebuttalId(c.allowedRebuttals[0]?.id || "");
    setGraphResult(null);
    setVahanResult(null);
    setMemberSplitResult(null);
    setAltRebuttalResult(null);
    setAdjudicationDecision(null);
    setIsPlayingIvr(false);
    setTier2ConfirmChecked(false);

    if (c.ruleCode === "RULE_DISCOM_24K") {
      setNextMonthBill(28500);
      setLinkedFamilies(3);
      setIsMeterSegregated(false);
    }
  }, [selectedCaseKey]);

  useEffect(() => {
    async function runDelta() {
      try {
        const res = await fetch("/api/dispute-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delta-watcher",
            nextMonthBill,
            linkedFamiliesCount: linkedFamilies,
            isMeterSegregated,
            customThreshold: customDiscomThreshold,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setDeltaResult(data);
        }
      } catch (err) {
        console.error("Monthly protection simulator error:", err);
      }
    }
    runDelta();
  }, [nextMonthBill, linkedFamilies, isMeterSegregated, customDiscomThreshold]);

  const activeRebuttalObj = currentCase.allowedRebuttals.find((r) => r.id === selectedRebuttalId);

  const handleRunForensicProof = async () => {
    setIsVerifyingProof(true);
    setGraphResult(null);
    setVahanResult(null);
    setMemberSplitResult(null);
    setAltRebuttalResult(null);

    try {
      const opCode = activeRebuttalObj?.operatorCode || "T4";
      const isPrimaryCasePath =
        (currentCase.ruleCode === "RULE_DISCOM_24K" && opCode === "T4") ||
        (currentCase.ruleCode === "RULE_VAHAN_4W" && opCode === "T2") ||
        (currentCase.ruleCode === "RULE_GOVT_EMP_K01" && selectedRebuttalId === "EMPLOYED_SON_MEMBER_SPLIT");

      if (!isPrimaryCasePath) {
        const res = await fetch("/api/dispute-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "alternative-rebuttal-check",
            operatorCode: opCode,
            rebuttalId: selectedRebuttalId,
            documentReference: tier2DocReference,
          }),
        });
        const data: AlternativeRebuttalResult = await res.json();
        setAltRebuttalResult(data);
        return;
      }

      if (currentCase.ruleCode === "RULE_DISCOM_24K") {
        const res = await fetch("/api/dispute-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "graph-check",
            primaryJanAadhaar: currentCase.janAadhaarId,
            coResidingJanAadhaars: ["4829103848", "4829103849"],
            simulateCollision,
            customThreshold: customDiscomThreshold,
          }),
        });
        const data = await res.json();
        setGraphResult(data);
      } else if (currentCase.ruleCode === "RULE_VAHAN_4W") {
        const res = await fetch("/api/dispute-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "vahan-check",
            simulateFraud: simulateFraudVahan,
          }),
        });
        const data = await res.json();
        setVahanResult(data);
      } else {
        const res = await fetch("/api/dispute-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "member-split-check",
            simulateFraud: simulateFraudRailway,
          }),
        });
        const data = await res.json();
        setMemberSplitResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingProof(false);
    }
  };

  const handleAdjudicate = (decision: "APPROVED" | "FIELD_VISIT" | "REJECTED") => {
    setIsSigningOrder(true);
    setTimeout(() => {
      setAdjudicationDecision(decision);
      setIsSigningOrder(false);
    }, 350);
  };

  const kamlaClearedByHigherLimit =
    currentCase.ruleCode === "RULE_DISCOM_24K" && 28500 < customDiscomThreshold;

  return (
    <div className="space-y-4">
      {/* 5-Stage Workflow Navigation Bar */}
      <nav
        aria-label="5-Stage Welfare Verification Workflow"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-white rounded-xl p-1.5 gap-1.5 shadow-sm border border-slate-200"
      >
        <button
          type="button"
          onClick={() => setActiveTab("step0")}
          className={`py-2.5 px-3 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 text-center ${
            activeTab === "step0"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
              activeTab === "step0" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            0
          </span>
          <span>Scheme Setup</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("intake")}
          className={`py-2.5 px-3 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 text-center ${
            activeTab === "intake"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
              activeTab === "intake" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
            }`}
          >
            1–2
          </span>
          <span>Pre-Check &amp; Notice</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("emitra")}
          className={`py-2.5 px-3 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 text-center ${
            activeTab === "emitra"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
              activeTab === "emitra" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
            }`}
          >
            3
          </span>
          <span>e-Mitra Citizen Proof</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("adjudication")}
          className={`py-2.5 px-3 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 text-center ${
            activeTab === "adjudication"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
              activeTab === "adjudication" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
            }`}
          >
            4
          </span>
          <span>Officer Decision</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("delta")}
          className={`col-span-2 sm:col-span-1 py-2.5 px-3 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 text-center ${
            activeTab === "delta"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
              activeTab === "delta" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
            }`}
          >
            5
          </span>
          <span>Monthly Protection</span>
        </button>
      </nav>

      {/* Compact Citizen File Switcher Strip — Hidden on Step 0 so Policy Setup stays clean! */}
      {activeTab !== "step0" && (
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm space-y-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Citizen Case:</span>
              <button
                type="button"
                onClick={() => setSelectedCaseKey("CASE_DISCOM_KAMLA")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                  selectedCaseKey === "CASE_DISCOM_KAMLA"
                    ? "bg-amber-50 text-amber-950 border-amber-400 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Case 1: Smt. Kamla Devi (Shared Bill)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCaseKey("CASE_VAHAN_RAMLAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                  selectedCaseKey === "CASE_VAHAN_RAMLAL"
                    ? "bg-blue-50 text-blue-950 border-blue-400 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Case 2: Shri Ram Lal Meena (Sold Car)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCaseKey("CASE_RAILWAY_GOVT_SON")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                  selectedCaseKey === "CASE_RAILWAY_GOVT_SON"
                    ? "bg-emerald-50 text-emerald-950 border-emerald-400 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Train className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Case 3: Smt. Geeta Devi (Son in Railways)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Benefit Protected · {currentCase.cureWindowDaysLeft} Days Left (Until {currentCase.cureWindowExpiryDate})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>
              <strong className="text-slate-800">File No.:</strong> {currentCase.caseId}
            </span>
            <span>
              <strong className="text-slate-800">Jan Aadhaar:</strong> {currentCase.janAadhaarId}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <strong className="text-slate-800">Location:</strong> {currentCase.tehsil}, {currentCase.district} (Ward {currentCase.lgdWardCode})
            </span>
            <span>
              <strong className="text-slate-800">Scheme:</strong> {currentCase.schemeName}
            </span>
          </div>
        </div>
      )}

      {/* MAIN STAGE WORKSPACE CARD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        {/* ========================================================================= */}
        {/* STAGE 0: CALM, PLAIN-ENGLISH SCHEME POLICY SETUP */}
        {/* ========================================================================= */}
        {activeTab === "step0" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Clean Light Header Strip with Human Scheme Picker */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                  Stage 0 · Departmental Scheme Configuration
                </span>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  Configure Welfare Scheme Rules &amp; Review Limits
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Select any Rajasthan welfare scheme below. One common verification engine adapts to each scheme&apos;s official Government Order, protected vulnerable groups, and department-approved thresholds without writing custom software.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(SCHEME_PLAYBOOK_PRESETS) as SchemeId[]).map((key) => {
                  const p = SCHEME_PLAYBOOK_PRESETS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectPreset(key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        selectedPresetKey === key
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {p.shortTitle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ONLY 2 CLEAN CARDS VISIBLE BY DEFAULT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Official Government Order, Protections & Active Rules */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-sm">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    1. Official Scheme Rules &amp; Protected Groups
                  </h3>
                  <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                    Gazette Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 font-medium block">Parent Department</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{activePreset.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Appeal &amp; Hearing Officer</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{activePreset.appellateAuthority}</span>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500 font-medium block">Government Order / Notification</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{activePreset.goReference}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-700 font-bold block mb-2">
                    Automatically Protected Vulnerable Groups (Never Flagged):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePreset.exemptCategoryLabels.map((label) => (
                      <span
                        key={label}
                        className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        {label}
                      </span>
                    ))}
                  </div>
                  {activePreset.statutoryRuleExemptions && activePreset.statutoryRuleExemptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {activePreset.statutoryRuleExemptions.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg font-semibold text-[11px]"
                        >
                          Special Protection: {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <span className="text-slate-800 font-bold block mb-1.5">
                      Direct Eligibility Rules (From Gazette Notification):
                    </span>
                    <div className="space-y-1.5">
                      {activePreset.plainKRules.map((rule) => (
                        <div
                          key={rule.code}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{rule.title}</span>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{rule.detail}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold shrink-0">
                            {rule.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-800 font-bold block mb-1.5">
                      Advisory Screening Signals (Prompt Verification Only — Never Cut Automatically):
                    </span>
                    <div className="space-y-1.5">
                      {activePreset.plainARules.map((rule) => (
                        <div
                          key={rule.code}
                          className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-amber-950">{rule.title}</span>
                            <p className="text-amber-900/80 text-[11px] mt-0.5 leading-snug">{rule.detail}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0">
                            {rule.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Policy Thresholds (Only Live-Wired Controls!) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-5 text-xs shadow-sm">
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      2. Tune Policy Thresholds (Live Demo Controls)
                    </h3>
                    <span className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                      Updates Cases Live
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    Statutory eligibility ceilings come directly from the scheme&apos;s Gazette Notification, while operational screening limits (such as electricity bill review thresholds) are set by Department Nodal Officers.
                  </p>

                  {/* Fixed Statutory Reference Figures for Active Scheme */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Income Ceiling</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        ₹{activePreset.maxAnnualIncome.toLocaleString("en-IN")}/yr
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">House Size Cap</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        {activePreset.nigamSqftCap}–{activePreset.ruralSqftCap} sq.ft.
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Rain-Fed Land Cap</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        {activePreset.maxBarrenHa.toFixed(1)} Hectares
                      </span>
                    </div>
                  </div>

                  {/* Live Control 1: Electricity Bill Review Limit */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <label
                          htmlFor="discom-limit-slider"
                          className="font-bold text-slate-900 text-sm block"
                        >
                          Annual Domestic Electricity Bill Review Limit
                        </label>
                        <span className="text-[11px] text-slate-600">
                          {activePreset.enabledARules.includes("A03")
                            ? "Triggers a 15-day joint-family verification check when exceeded"
                            : "Turned OFF by default for Palanhar; adjustable for Case 1 simulation"}
                        </span>
                      </div>
                      <span className="text-base font-black text-amber-800 bg-white px-3 py-1 rounded-lg border border-amber-300 shrink-0">
                        ₹{customDiscomThreshold.toLocaleString("en-IN")} / yr
                      </span>
                    </div>

                    <input
                      id="discom-limit-slider"
                      type="range"
                      min={18000}
                      max={60000}
                      step={2000}
                      value={customDiscomThreshold}
                      onChange={(e) => setCustomDiscomThreshold(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>₹18,000 / yr</span>
                      <span>₹24,000 (Pension Default)</span>
                      <span>₹50,000 (Ration Default)</span>
                      <span>₹60,000 / yr</span>
                    </div>

                    <div
                      className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
                        28500 < customDiscomThreshold
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-white border-amber-200 text-slate-700"
                      }`}
                    >
                      <strong className="font-bold">Live Effect on Case 1 (Smt. Kamla Devi, ₹28,500 meter bill): </strong>
                      {28500 < customDiscomThreshold
                        ? `Because ₹28,500 is below your ₹${customDiscomThreshold.toLocaleString("en-IN")} limit, Smt. Kamla Devi is cleared immediately in Stage 1 without sending any notice.`
                        : `Unlinked bill of ₹28,500 is above ₹${customDiscomThreshold.toLocaleString("en-IN")}, so Stage 1–2 sends a polite 15-day verification notice. Once split across 3 co-residing families (₹9,500 per family), her pension stays protected.`}
                    </div>
                  </div>

                  {/* Live Control 2: Irrigated Farmland Ceiling */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <label
                          htmlFor="irrigated-land-slider"
                          className="font-bold text-slate-900 text-sm block"
                        >
                          Irrigated Farmland Limit
                        </label>
                        <span className="text-[11px] text-slate-600">
                          Used in pre-notice farmland checks (open marginal farmer test below)
                        </span>
                      </div>
                      <span className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-300 shrink-0">
                        {customIrrigatedHaCap.toFixed(1)} Hectares
                      </span>
                    </div>

                    <input
                      id="irrigated-land-slider"
                      type="range"
                      min={1.0}
                      max={4.0}
                      step={0.5}
                      value={customIrrigatedHaCap}
                      onChange={(e) => setCustomIrrigatedHaCap(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onOpenDatabasesModal}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Database className="w-4 h-4 text-primary shrink-0" />
                    View 12 Connected Databases
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("intake")}
                    className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    Inspect Citizen Cases (Stage 1–2)
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* PROGRESSIVE DISCLOSURE ACCORDIONS FOR DEEP ENGINEERING DETAILS */}
            <section
              aria-label="Additional Policy Reference Details"
              className="gov-accordion space-y-3 pt-1"
            >
              <details className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition flex items-center gap-2.5 text-xs font-bold text-slate-800 select-none">
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 accordion-chevron" />
                  <span>
                    View the 6 Citizen Appeal &amp; Clarification Pathways (Used at e-Mitra Kiosks)
                  </span>
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {activePreset.boundRebuttalOperators.map((op) => (
                    <div
                      key={op.code}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{op.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold shrink-0">
                          {op.code}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{op.description}</p>
                      <span className="inline-block text-[10px] font-bold text-primary pt-0.5">
                        Action: {op.actionBadge}
                      </span>
                    </div>
                  ))}
                </div>
              </details>

              <details className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/80 transition flex items-center gap-2.5 text-xs font-bold text-slate-800 select-none">
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 accordion-chevron" />
                  <span>
                    View 6 Automatic Pre-Notice Citizen Protections &amp; Marginal Rain-Fed Farmer Land Check
                  </span>
                </summary>
                <div className="px-4 pb-4 pt-3 border-t border-slate-200 bg-white grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                  <div className="lg:col-span-7 space-y-2">
                    <span className="font-bold text-slate-900 block">
                      Automatic Database Checks Run Before Sending Any Citizen Notice:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          title: "1. Zero-Tax Return Protection",
                          desc: "Citizens who filed a ₹0-tax ITR (for bank loans or TDS refunds) are cleared automatically.",
                        },
                        {
                          title: "2. Highway Land Award Protection",
                          desc: "Compulsory land acquisition awards under Section 96 of the Land Acquisition Act are subtracted automatically.",
                        },
                        {
                          title: "3. Farmer Producer Company Shield",
                          desc: "Small farmers serving on Farmer Producer Company (FPO) boards are never treated as corporate directors.",
                        },
                        {
                          title: "4. Deceased Earner Check",
                          desc: "If Pehchan civil records show a salaried earner passed away, past salary never blocks surviving dependents.",
                        },
                        {
                          title: "5. Pre-Linked Joint Family Split",
                          desc: "Shared electricity bills and joint land holdings are divided across already-linked families first.",
                        },
                        {
                          title: "6. Monthly Protection Ledger",
                          desc: "Households whose explanation was already verified are not sent repeat notices every month.",
                        },
                      ].map((item) => (
                        <div key={item.title} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70">
                          <span className="font-bold text-emerald-950 block">{item.title}</span>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <span className="font-bold text-slate-900 block">
                      Interactive Test: Marginal Rain-Fed (Barani) Farmer with Borewell
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      If a small farmer owns rain-fed (Barani) land and installs a borewell pump, Swaraj-Auto checks whether their land would still stay within the <strong>{customIrrigatedHaCap.toFixed(1)}-hectare irrigated limit</strong> before ever sending a notice:
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <label htmlFor="barani-farmer-slider">Farmer&apos;s Total Land Holding:</label>
                        <span>{simBaraniPumpHa.toFixed(1)} Hectares</span>
                      </div>
                      <input
                        id="barani-farmer-slider"
                        type="range"
                        min={0.5}
                        max={3.5}
                        step={0.5}
                        value={simBaraniPumpHa}
                        onChange={(e) => setSimBaraniPumpHa(Number(e.target.value))}
                        className="w-full accent-emerald-700 cursor-pointer"
                      />
                    </div>
                    <div
                      className={`p-3 rounded-lg font-semibold text-[11px] leading-relaxed ${
                        simBaraniPumpHa <= customIrrigatedHaCap
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                          : "bg-amber-50 text-amber-950 border border-amber-300"
                      }`}
                    >
                      {simBaraniPumpHa <= customIrrigatedHaCap
                        ? `Protected Automatically: Even if treated as 100% irrigated land, ${simBaraniPumpHa.toFixed(1)} hectares is within the ${customIrrigatedHaCap.toFixed(1)}-hectare limit. Zero notice is sent to this farmer.`
                        : `Verification Required: ${simBaraniPumpHa.toFixed(1)} hectares exceeds the ${customIrrigatedHaCap.toFixed(1)}-hectare irrigated ceiling, so a 15-day land verification notice is issued.`}
                    </div>
                  </div>
                </div>
              </details>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 1–2: PRE-NOTICE SCREENING & CITIZEN NOTICE (ZERO RAW JSON!) */}
        {/* ========================================================================= */}
        {activeTab === "intake" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stage 1 Pre-Notice Screening Card */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                    Stage 1 · Automatic Pre-Notice Screening
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">
                    Every Citizen Record Passes 6 Automatic Safety Checks Before Any Notice Is Sent
                  </h2>
                </div>

                <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setIngressSource("FULL_12_ENDPOINT_ROLL")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      ingressSource === "FULL_12_ENDPOINT_ROLL"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Routine 12-Department Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngressSource("EXTERNAL_BATCH_REVERIFY")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      ingressSource === "EXTERNAL_BATCH_REVERIFY"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    External Department List Re-Check
                  </button>
                </div>
              </div>

              {/* 6 Plain-English Pre-Notice Shields */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                {[
                  { label: "Death Registry Check", sub: "Past salary of deceased cleared" },
                  { label: "Zero-Tax ITR Check", sub: "₹0-tax filings auto-cleared" },
                  { label: "Farmer FPO Shield", sub: "Producer Co. farmers exempt" },
                  { label: "Highway Award Check", sub: "Land compensation deducted" },
                  { label: "Joint-Family Split", sub: "Shared bills divided first" },
                  { label: "Monthly Shield Check", sub: "Past verified cases skipped" },
                ].map((shield) => (
                  <div
                    key={shield.label}
                    className="bg-white border border-emerald-200 rounded-xl p-2.5 shadow-sm"
                  >
                    <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {shield.label}
                    </span>
                    <span className="text-slate-500 text-[10px] block mt-0.5 leading-snug">{shield.sub}</span>
                  </div>
                ))}
              </div>

              {/* Plain-English Screening Finding for Selected Citizen */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-600">
                    <strong className="text-slate-900">How File Entered Review:</strong>{" "}
                    {ingressSource === "FULL_12_ENDPOINT_ROLL"
                      ? "Routine Statewide 12-Department Eligibility Check"
                      : "Pre-Flagged External List Re-Verified Through Rajasthan Pre-Notice Safety Checks"}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border self-start sm:self-auto ${
                      kamlaClearedByHigherLimit
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : currentCase.ruleSeries === "A_SERIES"
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : "bg-rose-50 text-rose-900 border-rose-200"
                    }`}
                  >
                    {kamlaClearedByHigherLimit
                      ? "Cleared Automatically — Within Updated Bill Limit"
                      : currentCase.dueProcessBadgeLabel}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  {kamlaClearedByHigherLimit
                    ? `In Stage 0, you set the annual electricity bill review limit to ₹${customDiscomThreshold.toLocaleString("en-IN")}. Because Smt. Kamla Devi's ₹28,500 meter bill is below that limit, Stage 1 clears her household automatically without sending any SMS or voice call.`
                    : currentCase.layer1AuditSummary}
                </p>

                {currentCase.layer1ResolvedIfLinkedSummary && !kamlaClearedByHigherLimit && (
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
                    <strong>What happens once the 3 families link their cards: </strong>
                    {currentCase.layer1ResolvedIfLinkedSummary}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom 2 Columns: Official Departmental Scrutiny Sheet + Citizen Hindi Notice */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Plain-English Departmental Case Summary Sheet (Replaces Raw JSON!) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    Official Departmental Case Summary Sheet
                  </h3>
                  <span className="text-[11px] font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700">
                    {currentCase.sourceGatewayLabel}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200/80 text-xs">
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Beneficiary &amp; Jan Aadhaar</span>
                    <span className="font-bold text-slate-900 text-right">
                      {currentCase.beneficiaryName} (ID: {currentCase.janAadhaarId})
                    </span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Welfare Scheme</span>
                    <span className="font-semibold text-slate-800 text-right">{currentCase.schemeName}</span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Reporting Department</span>
                    <span className="font-semibold text-slate-800 text-right">{currentCase.sourceDepartment}</span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Reason for Review</span>
                    <span className="font-semibold text-slate-800 text-right">{currentCase.ruleDescription}</span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Recorded Department Value</span>
                    <span className="font-bold text-rose-700 text-right">{currentCase.flaggedValue}</span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Allowed Scheme Limit</span>
                    <span className="font-bold text-slate-900 text-right">
                      {currentCase.ruleCode === "RULE_DISCOM_24K"
                        ? `₹${customDiscomThreshold.toLocaleString("en-IN")} / year per family`
                        : currentCase.thresholdValue}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Pre-Notice Safety Checks</span>
                    <span className="font-semibold text-emerald-800 text-right">
                      All 6 Automated Protections Checked
                    </span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-500 shrink-0">Citizen Protection Window</span>
                    <span className="font-bold text-emerald-800 text-right">
                      15 Days Guaranteed (Benefit Remains Active)
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
                  <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-bold block text-sm mb-0.5">
                      Mandatory 15-Day Citizen Protection Guarantee
                    </strong>
                    Even when a government database match is exact (such as an employed son in Indian Railways or a high joint-family electricity bill), pensions and rations are <strong>never stopped overnight</strong>. Every family gets 15 days to submit a simple clarification at their nearest e-Mitra kiosk.
                  </div>
                </div>
              </div>

              {/* Right Column: Stage 2 Citizen-Friendly Hindi SMS & Automated Voice Call */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-primary shrink-0" />
                    Stage 2 · Citizen Notice (Hindi SMS &amp; Voice Call)
                  </h3>
                  <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full">
                    Sent to Registered Mobile
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      Official Hindi SMS Message
                    </span>
                    <span>Mobile: {currentCase.mobileNumberMasked}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed shadow-sm">
                    {currentCase.smsTranscriptHindi}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                      Automated Hindi Voice Call (For Non-Smartphone Citizens)
                    </span>
                    <span>Length: 38 sec</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    &ldquo;{currentCase.ivrTranscriptHindi}&rdquo;
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPlayingIvr(!isPlayingIvr)}
                      className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                      {isPlayingIvr ? "Stop Voice Call Preview" : "Preview Citizen Voice Call"}
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Works on any basic keypad phone
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("emitra")}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
                >
                  Open Citizen Case at e-Mitra Kiosk (Stage 3)
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: e-MITRA KIOSK CONSOLE — STACKED TOP-TO-BOTTOM LAYOUT! */}
        {/* ========================================================================= */}
        {activeTab === "emitra" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* e-Mitra Kiosk Identification Strip */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm shrink-0">
                  eM
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-base">
                      Rajasthan e-Mitra Kiosk Operator Screen
                    </h2>
                    <span className="text-[11px] bg-white text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                      Kiosk: EMITRA-JPR-0492
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Connected to Jan Aadhaar 2.0 Family Registry · Fingerprint Scanner: Mantra MFS110 L1 Ready
                  </p>
                </div>
              </div>
              <div className="sm:text-right text-xs">
                <span className="text-slate-500 block">Citizen Biometric Verification</span>
                <span className="font-bold text-emerald-800">
                  Jan Aadhaar {currentCase.janAadhaarId} · Fingerprint Verified
                </span>
              </div>
            </div>

            {/* TOP PANEL (FULL WIDTH): SELECT GUIDED EXPLANATION & SUPPORTING DETAILS */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  Step 1: Select Citizen&apos;s Explanation at e-Mitra Kiosk
                </h3>
                <span className="text-xs text-slate-500">
                  Choose the reason that matches the citizen&apos;s household situation
                </span>
              </div>

              {/* 2-Column Grid of Guided Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentCase.allowedRebuttals.map((r) => (
                  <label
                    key={r.id}
                    onClick={() => {
                      setSelectedRebuttalId(r.id);
                      setGraphResult(null);
                      setVahanResult(null);
                      setMemberSplitResult(null);
                      setAltRebuttalResult(null);
                      setAdjudicationDecision(null);
                    }}
                    className={`block p-4 rounded-xl border cursor-pointer transition text-xs ${
                      selectedRebuttalId === r.id
                        ? "bg-white border-2 border-primary shadow-sm"
                        : r.isTier2Escalation
                        ? "bg-amber-50/40 border-amber-200 hover:bg-white"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="rebuttal"
                        checked={selectedRebuttalId === r.id}
                        onChange={() => {
                          setSelectedRebuttalId(r.id);
                          setGraphResult(null);
                          setVahanResult(null);
                          setMemberSplitResult(null);
                          setAltRebuttalResult(null);
                          setAdjudicationDecision(null);
                        }}
                        className="mt-1 accent-primary"
                      />
                      <div className="w-full space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-primary">
                            {r.categoryTitle}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm leading-snug">
                          {r.labelHindi}
                        </p>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {r.labelEnglish}
                        </p>
                        <div className="pt-1">
                          <span className="text-[11px] text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                            Required Check: {r.requiredEvidence}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Special Officer Review Confirmation when Category T6 is selected */}
              {activeRebuttalObj?.isTier2Escalation && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-3">
                  <span className="font-bold text-amber-950 block text-sm">
                    Manual Officer Review Safeguard (Category T6):
                  </span>
                  <label className="flex items-start gap-2 cursor-pointer text-amber-950">
                    <input
                      type="checkbox"
                      checked={tier2ConfirmChecked}
                      onChange={(e) => setTier2ConfirmChecked(e.target.checked)}
                      className="mt-0.5 rounded accent-amber-700"
                    />
                    <span>
                      I confirm that none of the standard categories above apply, and an official supporting document (FIR / Court Stay / Patwari Panchnama) is attached for the Appeal Officer.
                    </span>
                  </label>
                  <div className="max-w-md">
                    <label htmlFor="tier2-doc-ref" className="text-amber-900 block mb-1 font-semibold">
                      Supporting Document / Application Reference Number:
                    </label>
                    <input
                      id="tier2-doc-ref"
                      type="text"
                      value={tier2DocReference}
                      onChange={(e) => setTier2DocReference(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Case-Specific Supporting Family / Vehicle Snapshot + Optional Fraud Simulation */}
              {currentCase.ruleCode === "RULE_DISCOM_24K" && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      Related Jan Aadhaar Families Found at Same Ancestral Address (Bassi, Ward 080899):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Matched via Shared Ancestral Family Record
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block">1. Smt. Kamla Devi</span>
                      <span className="text-slate-600 text-[11px]">Widow Mother · Card 4829103847</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block">2. Suresh Meena</span>
                      <span className="text-slate-600 text-[11px]">Elder Married Son · Card 4829103848</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block">3. Mahesh Meena</span>
                      <span className="text-slate-600 text-[11px]">Younger Married Son · Card 4829103849</span>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-slate-600 font-semibold flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateCollision}
                        onChange={(e) => {
                          setSimulateCollision(e.target.checked);
                          setGraphResult(null);
                          setAdjudicationDecision(null);
                        }}
                        className="rounded accent-rose-600"
                      />
                      <span>
                        <strong>Demo Test:</strong> Simulate duplicate fraud attempt (son&apos;s card already used on another meter in another village)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {currentCase.ruleCode === "RULE_VAHAN_4W" && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                  <span className="font-bold text-slate-900 block">
                    Submitted Sale Documents &amp; Vahan 4.0 Transport Record Preview:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Vehicle Details</span>
                      <span className="font-bold text-slate-900">Maruti Alto 800 (RJ-14-CC-4821)</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Form 29/30 Sale Receipt</span>
                      <span className="font-bold text-slate-900">Signed &amp; Dated 14 May 2019</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Transport Portal Status</span>
                      <span className="font-bold text-emerald-800">15-Yr Registration &amp; Fitness Expired</span>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-slate-600 font-semibold flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateFraudVahan}
                        onChange={(e) => {
                          setSimulateFraudVahan(e.target.checked);
                          setVahanResult(null);
                          setAdjudicationDecision(null);
                        }}
                        className="rounded accent-rose-600"
                      />
                      <span>
                        <strong>Demo Test:</strong> Simulate fake backdated sale paper (car still has active 2026 insurance &amp; fitness in applicant&apos;s name)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {currentCase.ruleCode === "RULE_GOVT_EMP_K01" && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    Household Members on Ration Card &amp; Fair Price Shop Biometric Grain Record:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block">1. Smt. Geeta Devi (58)</span>
                      <span className="text-emerald-700 font-semibold text-[11px]">Head of Family · Keep Ration</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block">2. Shri Bhanwar Lal Jat</span>
                      <span className="text-emerald-700 font-semibold text-[11px]">Husband (Farmer) · Keep Ration</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block">3. Pooja Jat</span>
                      <span className="text-emerald-700 font-semibold text-[11px]">Daughter (Student) · Keep Ration</span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-300">
                      <span className="font-bold text-amber-950 block">4. Rahul Jat (Son)</span>
                      <span className="text-amber-900 font-semibold text-[11px]">Joined Railways → Remove 5 kg Share</span>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-slate-600 font-semibold flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateFraudRailway}
                        onChange={(e) => {
                          setSimulateFraudRailway(e.target.checked);
                          setMemberSplitResult(null);
                          setAdjudicationDecision(null);
                        }}
                        className="rounded accent-rose-600"
                      />
                      <span>
                        <strong>Demo Test:</strong> Simulate fraud where Head of Family herself is a salaried govt employee collecting free ration
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isVerifyingProof || (activeRebuttalObj?.isTier2Escalation && !tier2ConfirmChecked)}
                onClick={handleRunForensicProof}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                {isVerifyingProof ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking Jan Aadhaar &amp; Connected Government Records...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Verify Citizen Explanation Against Government Records
                  </>
                )}
              </button>
            </div>

            {/* BOTTOM PANEL (FULL WIDTH DIRECTLY BELOW!): OFFICIAL VERIFICATION ATTESTATION */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary shrink-0" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Step 2: Automated Government Record Verification Result
                  </h3>
                </div>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  Instant Cross-Department Check
                </span>
              </div>

              {!graphResult && !vahanResult && !memberSplitResult && !altRebuttalResult && !isVerifyingProof && (
                <div className="py-8 text-center text-slate-500 text-xs space-y-1.5">
                  <Scale className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="font-medium text-slate-700">
                    No verification has been run yet for the selected explanation.
                  </p>
                  <p>
                    Select an explanation above and click <strong>&ldquo;Verify Citizen Explanation Against Government Records&rdquo;</strong> to view the official verification result here.
                  </p>
                </div>
              )}

              {isVerifyingProof && (
                <div className="py-10 text-center text-slate-600 space-y-2">
                  <RefreshCw className="w-7 h-7 mx-auto text-primary animate-spin" />
                  <p className="text-xs font-semibold">
                    Cross-checking Jan Aadhaar 2.0 Family Registry and {currentCase.sourceDepartment}...
                  </p>
                </div>
              )}

              {/* Alternative Category T1 / T5 / T6 Verification Output */}
              {altRebuttalResult && !isVerifyingProof && (
                <div className="space-y-4 animate-in fade-in">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
                      altRebuttalResult.operatorCode === "T6"
                        ? "bg-amber-50 border-amber-300 text-amber-950"
                        : "bg-emerald-50 border-emerald-300 text-emerald-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {altRebuttalResult.operatorCode === "T6" ? (
                        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      )}
                      <div>
                        <span className="text-[11px] font-semibold opacity-80 block">Verification Outcome</span>
                        <span className="font-black text-base">
                          {altRebuttalResult.operatorCode === "T6"
                            ? "Queued for Appeal Officer & Field Verification (Benefit Protected)"
                            : "Verified Against Official Department Records — Eligible to Restore"}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white border text-xs font-bold self-start sm:self-auto">
                      Recommended Action:{" "}
                      {altRebuttalResult.recommendedBdoAction === "FIELD_VISIT"
                        ? "7-Day Local Field Check"
                        : "Approve & Protect Benefit"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {altRebuttalResult.explanationHindi}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {altRebuttalResult.explanationEnglish}
                    </p>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Recorded Supporting Reference:</span>
                      <span className="font-bold text-slate-900">{altRebuttalResult.documentReference}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 1: Joint-Family Electricity Verification Output */}
              {graphResult && !isVerifyingProof && (
                <div className="space-y-4 animate-in fade-in">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
                      graphResult.verified
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : graphResult.statusCode === "GRAPH_VERIFIED_SUCCESS"
                        ? "bg-amber-50 border-amber-300 text-amber-950"
                        : "bg-rose-50 border-rose-300 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {graphResult.verified ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                      )}
                      <div>
                        <span className="text-[11px] font-semibold opacity-80 block">Verification Outcome</span>
                        <span className="font-black text-base">
                          {graphResult.statusCode === "COLLISION_DETECTED"
                            ? "Blocked — Duplicate Meter-Split Claim Found in Another Village"
                            : graphResult.statusCode === "LINEAGE_MISMATCH_FRAUD"
                            ? "Blocked — Family Relationship & Address Did Not Match"
                            : graphResult.verified
                            ? "Verified — Joint-Family Electricity Share Is Within Allowed Limit"
                            : "Referred for Field Check — Per-Family Share Still Above Limit"}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white border text-xs font-bold self-start sm:self-auto">
                      Allowed Limit: ₹{graphResult.activeThreshold.toLocaleString("en-IN")} / family
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Ancestral Family &amp; Address Check</span>
                      <p className="font-semibold text-slate-900 mt-1 leading-snug">
                        {graphResult.detailedProof.fatherHusbandLineageMatch}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Statewide Duplicate Claim Check</span>
                      <p
                        className={`font-semibold mt-1 leading-snug ${
                          graphResult.detailedProof.antiGamingCollisionPass ? "text-emerald-800" : "text-rose-800"
                        }`}
                      >
                        {graphResult.detailedProof.antiGamingCollisionPass
                          ? "Passed — None of these 3 family cards are claimed on any other meter in Rajasthan."
                          : graphResult.detailedProof.collisionDetails}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Calculated Per-Family Electricity Bill</span>
                      <p
                        className={`text-sm font-black mt-1 ${
                          graphResult.verified ? "text-emerald-800" : "text-rose-800"
                        }`}
                      >
                        {graphResult.statusCode === "COLLISION_DETECTED"
                          ? "Claim Rejected (Duplicate Card Reuse)"
                          : `₹${graphResult.totalAnnualBill.toLocaleString("en-IN")} ÷ ${graphResult.verifiedFamilyCount} families = ₹${graphResult.apportionedBillPerFamily.toLocaleString("en-IN")} / yr`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 2: Vahan 4.0 Sold Vehicle Verification Output */}
              {vahanResult && !isVerifyingProof && (
                <div className="space-y-4 animate-in fade-in">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
                      vahanResult.verified
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-rose-50 border-rose-300 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {vahanResult.verified ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                      )}
                      <div>
                        <span className="text-[11px] font-semibold opacity-80 block">Transport Registry Outcome</span>
                        <span className="font-black text-base">
                          {vahanResult.verified
                            ? "Verified — Vehicle Sold in 2019 & Registration Expired"
                            : "Discrepancy Alert — Vehicle Still Has Active 2026 Fitness & Insurance"}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white border text-xs font-bold self-start sm:self-auto">
                      Sale Date Checked: {vahanResult.saleDateExtracted}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {vahanResult.telemetrySignals.explanationHindi}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Registration Status</span>
                        <span className="font-bold text-slate-900">{vahanResult.telemetrySignals.vahanRcStatus}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Fitness &amp; Road Tax</span>
                        <span className="font-bold text-slate-900">{vahanResult.telemetrySignals.fitnessAndTaxExpiry}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Insurance History</span>
                        <span className="font-bold text-slate-900">{vahanResult.telemetrySignals.insurancePolicyStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 3: Employed Son Member-Split Verification Output */}
              {memberSplitResult && !isVerifyingProof && (
                <div className="space-y-4 animate-in fade-in">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border ${
                      memberSplitResult.verified
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-rose-50 border-rose-300 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {memberSplitResult.verified ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                      )}
                      <div>
                        <span className="text-[11px] font-semibold opacity-80 block">Ration Card Member Check</span>
                        <span className="font-black text-base">
                          {memberSplitResult.verified
                            ? "Verified — Separate Only Son's 5 kg Share & Keep Family Ration Active"
                            : "Violation Detected — Head of Family Is Salaried Employee Lifting Ration"}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white border text-xs font-bold self-start sm:self-auto">
                      Ration Collected by Employee: {memberSplitResult.eposGrainDrawnByFlaggedMemberKg} kg
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {memberSplitResult.explanationHindi}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Matched Member &amp; Relation</span>
                        <span className="font-bold text-slate-900">{memberSplitResult.relationCodeInJanAadhaar}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Employer Record</span>
                        <span className="font-bold text-slate-900">{memberSplitResult.employerVerified}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Updated Family Ration Entitlement</span>
                        <span className="font-bold text-emerald-800">
                          {memberSplitResult.verified
                            ? `${memberSplitResult.remainingEligibleMembersCount} Eligible Members (${memberSplitResult.revisedMonthlyQuotaKg} kg / month)`
                            : "Ineligible — Full Card Cancellation Recommended"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("adjudication")}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition"
                >
                  Forward File to Stage 4: {currentCase.appellateAuthorityTitle}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: OFFICER DECISION WORKBENCH & OFFICIAL SPEAKING ORDER */}
        {/* ========================================================================= */}
        {activeTab === "adjudication" && (() => {
          const isGraphFraud =
            graphResult?.statusCode === "COLLISION_DETECTED" ||
            graphResult?.statusCode === "LINEAGE_MISMATCH_FRAUD";
          const isVahanFraud = vahanResult?.statusCode === "SUSPECTED_FRAUD_ACTIVE_RC";
          const isMemberSplitFraud = memberSplitResult?.statusCode === "HOF_ACTIVE_EMPLOYEE_FRAUD";
          const isFraudDetected = Boolean(isGraphFraud || isVahanFraud || isMemberSplitFraud);

          const isVerifiedPass = Boolean(
            (graphResult?.verified && graphResult.statusCode === "GRAPH_VERIFIED_SUCCESS") ||
              (vahanResult?.verified && vahanResult.statusCode === "DISPOSSESSION_VERIFIED") ||
              (memberSplitResult?.verified &&
                memberSplitResult.statusCode === "MEMBER_SPLIT_READY_PARENTS_PROTECTED") ||
              (altRebuttalResult?.verified && altRebuttalResult.operatorCode !== "T6")
          );

          const isAmberEscalation = Boolean(
            altRebuttalResult?.operatorCode === "T6" ||
              (graphResult && graphResult.statusCode === "GRAPH_VERIFIED_SUCCESS" && !graphResult.verified)
          );

          const hasAnyProof = Boolean(
            graphResult || vahanResult || memberSplitResult || altRebuttalResult
          );

          return (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Officer Header Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h2 className="font-black text-base text-slate-900">
                      Appeal Officer Workbench: {currentCase.appellateAuthorityTitle}
                    </h2>
                    <p className="text-xs text-slate-600">
                      Designated Statutory Authority under {currentCase.statutoryCitation}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                    currentCase.ruleSeries === "A_SERIES"
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : "bg-blue-50 text-blue-900 border-blue-200"
                  }`}
                >
                  {currentCase.dueProcessBadgeLabel}
                </span>
              </div>

              {/* 2-Card Officer Review Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
                    1. Original Departmental Alert ({currentCase.sourceDepartment})
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Rule Category:</span>
                      <span className="font-bold text-slate-900 text-right">
                        {currentCase.ruleSeries === "A_SERIES"
                          ? "Advisory Screening Signal (Cannot Auto-Cancel Benefit)"
                          : `Statutory Eligibility Rule (Rule ${currentCase.ruleId})`}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Recorded Value:</span>
                      <span className="font-bold text-rose-700 text-right">{currentCase.flaggedValue}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Scheme Limit:</span>
                      <span className="font-bold text-slate-900 text-right">
                        {currentCase.ruleCode === "RULE_DISCOM_24K"
                          ? `₹${customDiscomThreshold.toLocaleString("en-IN")} / year per family`
                          : currentCase.thresholdValue}
                      </span>
                    </div>
                  </div>
                </div>

                {!hasAnyProof && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-slate-500" />
                        2. e-Mitra Verification Status: Waiting for Stage 3 Check
                      </h3>
                      <p className="text-slate-600 mt-2 leading-relaxed">
                        The e-Mitra government record check in Stage 3 has not been run yet for this file. Run Stage 3 first so the officer has verified facts before signing an order.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("emitra")}
                      className="self-start px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      Go Back to Stage 3 (e-Mitra Citizen Proof)
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {hasAnyProof && isFraudDetected && (
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 space-y-2">
                    <h3 className="font-black text-rose-950 text-sm flex items-center gap-1.5 border-b border-rose-200 pb-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                      2. Verification Discrepancy Alert
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between gap-3">
                        <span className="text-rose-800 shrink-0">Claim Submitted:</span>
                        <span className="font-bold text-rose-950 text-right">
                          {activeRebuttalObj ? activeRebuttalObj.categoryTitle : "Citizen Explanation"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-rose-800 shrink-0">Department Finding:</span>
                        <span className="font-bold text-rose-900 text-right">
                          {graphResult?.statusCode === "COLLISION_DETECTED"
                            ? "Son's Jan Aadhaar card was already used to split another meter in Jamwa Ramgarh."
                            : graphResult?.statusCode === "LINEAGE_MISMATCH_FRAUD"
                            ? "Submitted family cards do not share ancestral lineage or village address."
                            : vahanResult?.statusCode === "SUSPECTED_FRAUD_ACTIVE_RC"
                            ? "Car fitness and insurance were actively renewed in 2026 in the applicant's own name."
                            : memberSplitResult?.statusCode === "HOF_ACTIVE_EMPLOYEE_FRAUD"
                            ? `Head of Household herself holds a salaried job and collected ${memberSplitResult.eposGrainDrawnByFlaggedMemberKg} kg ration.`
                            : "Discrepancy found in government records."}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 pt-1.5 border-t border-rose-200">
                        <span className="text-rose-800 font-bold shrink-0">Recommended Decision:</span>
                        <span className="font-black text-rose-950 text-right">
                          {currentCase.ruleSeries === "A_SERIES"
                            ? "Reject Claim & Order Physical Field Verification"
                            : "Reject Explanation & Uphold Disqualification"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {hasAnyProof && !isFraudDetected && isAmberEscalation && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-amber-950 text-sm flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      2. Manual Officer / Field Inspection Recommended
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between gap-3">
                        <span className="text-amber-800">Submitted Category:</span>
                        <span className="font-bold text-amber-950 text-right">
                          {activeRebuttalObj ? activeRebuttalObj.categoryTitle : "Special Officer Review"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-amber-800">Verification Note:</span>
                        <span className="font-bold text-amber-900 text-right">
                          {altRebuttalResult
                            ? `Supporting Reference Attached (${altRebuttalResult.documentReference})`
                            : graphResult
                            ? `Per-family share (₹${graphResult.apportionedBillPerFamily.toLocaleString("en-IN")}) remains at or above ₹${graphResult.activeThreshold.toLocaleString("en-IN")}`
                            : "Requires physical inspection"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-amber-800">Recommended Action:</span>
                        <span className="font-bold text-amber-950 text-right">
                          Order 7-Day Patwari / VDO Field Inspection (Keep Benefit Protected)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {hasAnyProof && !isFraudDetected && !isAmberEscalation && isVerifiedPass && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5 border-b border-emerald-200 pb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      2. Citizen Explanation Verified by Government Records
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between gap-3">
                        <span className="text-emerald-800">Verified Pathway:</span>
                        <span className="font-bold text-emerald-950 text-right">
                          {activeRebuttalObj ? activeRebuttalObj.categoryTitle : "Verified Clarification"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-emerald-800">Department Proof:</span>
                        <span className="font-bold text-emerald-900 text-right">
                          {altRebuttalResult
                            ? `Official Record Verified (${altRebuttalResult.documentReference})`
                            : graphResult
                            ? `3 Related Families Verified at Same Address · Zero Duplicate Claims`
                            : vahanResult
                            ? `Sold on ${vahanResult.saleDateExtracted} · 15-Year Registration Expired`
                            : memberSplitResult
                            ? `Employed Member Is Adult Son · 0 kg Ration Collected After Joining`
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-emerald-800">Recommended Decision:</span>
                        <span className="font-bold text-emerald-950 text-right">
                          {graphResult
                            ? `Approve — ₹${graphResult.apportionedBillPerFamily.toLocaleString("en-IN")}/family is within ₹${graphResult.activeThreshold.toLocaleString("en-IN")} limit`
                            : vahanResult
                            ? "Approve — Restore Family Ration Card"
                            : memberSplitResult
                            ? `Approve — Remove Son's 5 kg Unit & Protect Family's ${memberSplitResult.revisedMonthlyQuotaKg} kg Ration`
                            : "Approve & Protect Benefit"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Officer Decision Action Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-bold text-slate-700 block mb-3">
                  Select Official Officer Decision (Generates Reasoned Speaking Order):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={isSigningOrder}
                    onClick={() => handleAdjudicate("APPROVED")}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      adjudicationDecision === "APPROVED"
                        ? "bg-emerald-800 text-white shadow-md ring-2 ring-emerald-500"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Approve Explanation &amp; Protect Benefit
                  </button>

                  <button
                    type="button"
                    disabled={isSigningOrder}
                    onClick={() => handleAdjudicate("FIELD_VISIT")}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      adjudicationDecision === "FIELD_VISIT"
                        ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-500"
                        : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Order 7-Day Field Inspection (Patwari / VDO)
                  </button>

                  <button
                    type="button"
                    disabled={isSigningOrder}
                    onClick={() => handleAdjudicate("REJECTED")}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      adjudicationDecision === "REJECTED"
                        ? "bg-rose-800 text-white shadow-md ring-2 ring-rose-500"
                        : "bg-rose-700 hover:bg-rose-800 text-white"
                    }`}
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    {currentCase.ruleSeries === "A_SERIES"
                      ? "Reject Claim & Escalate to Field Check"
                      : "Reject Claim & Uphold Disqualification"}
                  </button>
                </div>
              </div>

              {/* Generated Reasoned Speaking Order (Zero Code Tags!) */}
              {adjudicationDecision && (
                <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-6 shadow-sm animate-in fade-in space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Scale className="w-6 h-6 text-slate-800 shrink-0" />
                      <div>
                        <h3 className="font-black text-slate-900 text-base">
                          कार्यालय अपीलीय प्राधिकारी ({currentCase.appellateAuthorityTitle})
                        </h3>
                        <p className="text-xs text-slate-600">
                          कारण सहित पारित आदेश (Official Reasoned Speaking Order)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-white border border-slate-300 px-3 py-1 rounded-md text-slate-800 font-bold self-start sm:self-auto">
                      Order No.: ORD/{currentCase.caseId}/2026
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-2">
                    <p>
                      <strong>विषय:</strong> {currentCase.schemeName} पात्रता निर्णय आदेश (प्रकरण संख्या: {currentCase.caseId})।
                    </p>
                    <p>
                      {adjudicationDecision === "APPROVED" && altRebuttalResult && (
                        <>{altRebuttalResult.explanationHindi}</>
                      )}
                      {adjudicationDecision === "APPROVED" && !altRebuttalResult && currentCase.ruleCode === "RULE_DISCOM_24K" && (
                        <>
                          आवेदक <strong>{currentCase.beneficiaryName}</strong> (जन-आधार: {currentCase.janAadhaarId}) के प्रकरण में जन-आधार 2.0 पारिवारिक रिकॉर्ड एवं विद्युत विभाग के बिल का मिलान किया गया। पैतृक निवास के मीटर पर 3 पृथक जन-आधार परिवार निवासरत हैं। प्रति परिवार वार्षिक बिजली खर्च ₹9,500 आता है जो निर्धारित सीमा ₹{customDiscomThreshold.toLocaleString("en-IN")} से कम है। अतः पेंशन यथावत चालू रखते हुए मासिक सुरक्षा नियम लागू किया जाता है।
                        </>
                      )}
                      {adjudicationDecision === "APPROVED" && !altRebuttalResult && currentCase.ruleCode === "RULE_VAHAN_4W" && (
                        <>
                          आवेदक <strong>{currentCase.beneficiaryName}</strong> द्वारा प्रस्तुत फॉर्म 29/30 विक्रय दस्तावेज एवं वाहन 4.0 परिवहन पोर्टल की जांच से पुष्टि हुई कि कार RJ-14-CC-4821 वर्ष 2019 में बेची जा चुकी है तथा उसका 15-वर्षीय पंजीकरण एवं फिटनेस समाप्त हो चुका है। खाद्य एवं नागरिक आपूर्ति विभाग की अधिसूचना दिनांक 20.07.2017 (खंड 5) के अंतर्गत परिवार की राशन पात्रता बहाल रखी जाती है।
                        </>
                      )}
                      {adjudicationDecision === "APPROVED" && !altRebuttalResult && currentCase.ruleCode === "RULE_GOVT_EMP_K01" && (
                        <>
                          आवेदक मुखिया <strong>{currentCase.beneficiaryName}</strong> (जन-आधार: {currentCase.janAadhaarId}) के प्रकरण में पारिवारिक संबंध एवं राशन दुकान बायोमेट्रिक रिकॉर्ड का सत्यापन किया गया। रेलवे में कार्यरत सदस्य <strong>राहुल जाट (पुत्र)</strong> द्वारा नौकरी लगने के पश्चात 0 किग्रा राशन उठाया गया है। अतः केवल राहुल जाट की 5 किग्रा यूनिट को राशन कार्ड से पृथक करते हुए शेष 3 सदस्यों (गीता देवी, भंवर लाल जाट एवं पूजा जाट — 15 किग्रा/माह) की खाद्य सुरक्षा पात्रता यथावत चालू रखी जाती है।
                        </>
                      )}
                      {adjudicationDecision === "FIELD_VISIT" && (
                        <>
                          प्रस्तुत दस्तावेजों ({tier2DocReference}) की स्थलीय पुष्टि हेतु ग्राम विकास अधिकारी (VDO) / पटवारी, तहसील {currentCase.tehsil} को निर्देशित किया जाता है कि 7 कार्यदिवस में भौतिक पंचनामा रिपोर्ट प्रस्तुत करें। तब तक आवेदक का लाभ सुरक्षित समीक्षा में चालू रहेगा।
                        </>
                      )}
                      {adjudicationDecision === "REJECTED" && currentCase.ruleSeries === "A_SERIES" && (
                        <>
                          यह प्रकरण बिजली बिल आधारित प्रारंभिक जांच श्रेणी में है तथा प्रस्तुत स्पष्टीकरण समाधानकारक नहीं पाया गया। चूंकि केवल बिजली बिल के आधार पर स्वतः लाभ बंद करना वर्जित है, अतः अंतिम निर्णय से पूर्व ग्राम विकास अधिकारी / पटवारी द्वारा अनिवार्य भौतिक सत्यापन किए जाने के निर्देश दिए जाते हैं।
                        </>
                      )}
                      {adjudicationDecision === "REJECTED" && currentCase.ruleSeries === "K_SERIES" && (
                        <>
                          विभागीय रिकॉर्ड एवं प्रस्तुत साक्ष्यों की जांच उपरांत स्पष्टीकरण समाधानकारक नहीं पाया गया। अतः योजना अधिसूचना ({currentCase.statutoryCitation}) के अंतर्गत अपात्रता की पुष्टि करते हुए कारण सहित आदेश पारित किया जाता है।
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Digitally Signed via Raj eSign (Officer SSO Verified)
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("delta")}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      Open Stage 5: Monthly Auto-Protection
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* STAGE 5: MONTHLY AUTO-PROTECTION LEDGER (PLAIN ENGLISH, ZERO CODE!) */}
        {/* ========================================================================= */}
        {activeTab === "delta" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-primary block">
                Stage 5 · Smart Monthly Protection Ledger
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Why Verified Families Are Never Sent Repeat Notices Next Month
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                In traditional government drives, next month&apos;s automated batch flags the exact same widow or elderly parent all over again. Swaraj-Auto saves a <strong>live monthly protection rule</strong> for each resolved case — protecting genuine families automatically every month, while still catching real spikes if circumstances actually change.
              </p>
            </div>

            {/* 3-Case Plain-English Monthly Protection Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {Object.entries(SEEDED_CASES).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCaseKey(key)}
                  className={`p-4 rounded-xl border text-left transition ${
                    selectedCaseKey === key
                      ? "bg-emerald-50/70 border-emerald-400 shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900">{c.beneficiaryName}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                      Active Rule
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {c.statefulPredicateSummary}
                  </p>
                </button>
              ))}
            </div>

            {/* Interactive Next-Month Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Test Next Month&apos;s Electricity Check (Smt. Kamla Devi&apos;s Shared Meter)
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="next-month-bill-slider" className="font-bold text-slate-700">
                      Next Month&apos;s Annualized Meter Bill:
                    </label>
                    <span className="font-black text-primary text-base">
                      ₹{nextMonthBill.toLocaleString("en-IN")} / yr
                    </span>
                  </div>
                  <input
                    id="next-month-bill-slider"
                    type="range"
                    min={12000}
                    max={90000}
                    step={1000}
                    value={nextMonthBill}
                    onChange={(e) => setNextMonthBill(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>₹12,000</span>
                    <span>₹{customDiscomThreshold.toLocaleString("en-IN")} (1-Family Limit)</span>
                    <span>₹{(customDiscomThreshold * 3).toLocaleString("en-IN")} (3-Family Limit)</span>
                    <span>₹90,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Number of Verified Co-Residing Families Sharing This Meter:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setLinkedFamilies(count)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          linkedFamilies === count
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {count} {count === 1 ? "Family" : "Families"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <label htmlFor="separate-meter-toggle" className="text-xs font-bold text-slate-800 block cursor-pointer">
                      Electricity Department Installed Separate Individual Meters
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Ends shared-meter division and checks Kamla Devi&apos;s individual meter only
                    </span>
                  </div>
                  <input
                    id="separate-meter-toggle"
                    type="checkbox"
                    checked={isMeterSegregated}
                    onChange={(e) => setIsMeterSegregated(e.target.checked)}
                    className="w-5 h-5 rounded accent-primary cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                {deltaResult && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Next Month&apos;s Automated Decision
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto ${
                          deltaResult.isBenefitProtected
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {deltaResult.isBenefitProtected ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        )}
                        {deltaResult.shieldStatus === "SHIELD_ACTIVE_PROTECTED"
                          ? "Protection Active"
                          : deltaResult.shieldStatus === "SHIELD_REVOKED_METERS_SPLIT"
                          ? "Switched to Individual Meter"
                          : "Limit Exceeded — Fresh Review"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block">Calculated Per-Family Share</span>
                        <span className="text-xl font-black text-slate-900 mt-0.5 block">
                          ₹{deltaResult.effectivePerFamilyShare.toLocaleString("en-IN")} / yr
                        </span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block">Monthly Pension Status</span>
                        <span
                          className={`text-sm font-bold mt-1 block ${
                            deltaResult.isBenefitProtected ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {deltaResult.isBenefitProtected
                            ? "Paid On Time (Zero Repeat Notice)"
                            : "New 15-Day Clarification Sent"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        deltaResult.isBenefitProtected
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                          : "bg-rose-50/60 border-rose-200 text-rose-950"
                      }`}
                    >
                      <p className="font-bold mb-1">Plain-English Explanation:</p>
                      <p className="font-medium">{deltaResult.reasonHindi}</p>
                      <p className="mt-1.5 text-[11px] opacity-90">{deltaResult.reasonEnglish}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                  Protects genuine joint families month after month while automatically catching real consumption spikes.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Bottom Utility Bar with 1-Click Access to the 12 Connected Databases */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
        <span>
          Hosted inside <strong>Rajasthan State Data Centre (RSDC)</strong> · Integrated with Jan Aadhaar 2.0, RajSewaDwar &amp; Project SMART
        </span>
        <button
          type="button"
          onClick={onOpenDatabasesModal}
          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 self-start sm:self-auto transition"
        >
          <Database className="w-3.5 h-3.5 text-primary shrink-0" />
          View All 12 Connected Government Databases
        </button>
      </div>
    </div>
  );
}
