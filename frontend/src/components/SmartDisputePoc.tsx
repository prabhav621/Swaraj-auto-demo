"use client";

import React, { useState, useEffect } from "react";
import {
  SEEDED_CASES,
  SCHEME_PLAYBOOK_PRESETS,
  DATA_ENDPOINTS_CATALOG,
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
} from "lucide-react";

export default function SmartDisputePoc() {
  const [selectedCaseKey, setSelectedCaseKey] = useState<string>("CASE_DISCOM_KAMLA");
  const [activeTab, setActiveTab] = useState<"step0" | "intake" | "emitra" | "adjudication" | "delta">("step0");

  // Step 0 Scheme Playbook Builder State
  const [selectedPresetKey, setSelectedPresetKey] = useState<SchemeId>("RJ_SSP_PENSION");
  const activePreset = SCHEME_PLAYBOOK_PRESETS[selectedPresetKey];
  const [customDiscomThreshold, setCustomDiscomThreshold] = useState<number>(24000);
  const [customIncomeThreshold, setCustomIncomeThreshold] = useState<number>(48000);
  const [customIrrigatedHaCap, setCustomIrrigatedHaCap] = useState<number>(2.0);
  const [simBaraniPumpHa, setSimBaraniPumpHa] = useState<number>(0.5);

  const currentCase: DisputeCase = SEEDED_CASES[selectedCaseKey];

  // Tab 1 (Layer-1 Scrutiny & Dual-Ingress + 15-Day Cure Notice) state
  const [ingressSource, setIngressSource] = useState<"FULL_12_ENDPOINT_ROLL" | "EXTERNAL_BATCH_REVERIFY">(
    "FULL_12_ENDPOINT_ROLL"
  );
  const [isPlayingIvr, setIsPlayingIvr] = useState(false);

  // Tab 2 (e-Mitra) state
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

  // Tab 3 (Adjudication) state
  const [adjudicationDecision, setAdjudicationDecision] = useState<
    "APPROVED" | "FIELD_VISIT" | "REJECTED" | null
  >(null);
  const [isSigningOrder, setIsSigningOrder] = useState(false);

  // Tab 4 (Delta-Watcher) state
  const [nextMonthBill, setNextMonthBill] = useState(28500);
  const [linkedFamilies, setLinkedFamilies] = useState(3);
  const [isMeterSegregated, setIsMeterSegregated] = useState(false);
  const [deltaResult, setDeltaResult] = useState<DeltaWatcherEvaluation | null>(null);

  const handleSelectPreset = (presetKey: SchemeId) => {
    setSelectedPresetKey(presetKey);
    const p = SCHEME_PLAYBOOK_PRESETS[presetKey];
    if (p) {
      setCustomDiscomThreshold(p.maxDiscomBill);
      setCustomIncomeThreshold(p.maxAnnualIncome);
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
        console.error("Delta watcher error:", err);
      }
    }
    runDelta();
  }, [nextMonthBill, linkedFamilies, isMeterSegregated, customDiscomThreshold]);

  const activeRebuttalObj = currentCase.allowedRebuttals.find((r) => r.id === selectedRebuttalId);

  // Audit Fix #20: Route T1/T5/T6 rebuttals explicitly to their verification handler
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
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Scenario Selector & Unified 5-Stage Sovereign Architecture */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Unified 5-Stage Sovereign Engine · Hosted in RSDC
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Stage 0: Playbook Compiler &rarr; Stage 1: L1 Pre-Notice Scrutiny &rarr; Stage 2: 15-Day Cure Notice &rarr; Stage 3: e-Mitra (T1–T6) &rarr; Stage 4: Speaking Order &amp; Delta Shield
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Swaraj-Auto (स्वराज-ऑटो): Unified Sovereign Welfare Exclusion &amp; Due-Process Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Hosted inside RSDC atop Jan Aadhaar 2.0, RajSewaDwar, and Project SMART. Parameterizes Rajasthan welfare schemes in 60 seconds, clears false positives in Layer-1 pre-notice scrutiny, and resolves household-graph disputes (joint-family meters, un-split employed children, and un-transferred vehicle RCs) in one unified pipeline.
            </p>
          </div>

          {/* 3 Authentic Rajasthan Scenario Switcher Pills */}
          <div className="flex flex-wrap gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start xl:self-center">
            <button
              onClick={() => setSelectedCaseKey("CASE_DISCOM_KAMLA")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCaseKey === "CASE_DISCOM_KAMLA"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Case 1: ₹24k Bill Split (A03 · T4)
            </button>
            <button
              onClick={() => setSelectedCaseKey("CASE_VAHAN_RAMLAL")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCaseKey === "CASE_VAHAN_RAMLAL"
                  ? "bg-blue-500 text-white shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Case 2: Sold 4W RC (K03 · T2)
            </button>
            <button
              onClick={() => setSelectedCaseKey("CASE_RAILWAY_GOVT_SON")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCaseKey === "CASE_RAILWAY_GOVT_SON"
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              Case 3: 1.82L Railway Son Split (K01 · T3)
            </button>
          </div>
        </div>

        {/* Selected Case Quick Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Case Docket, Scheme &amp; Endpoint:</span>
            <span className="font-mono font-bold text-white text-sm">
              {currentCase.caseId}{" "}
              <span className="text-[11px] text-amber-300">({currentCase.schemeId})</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400 block truncate">{currentCase.sourceEndpointUri}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Beneficiary / Jan Aadhaar:</span>
            <span className="font-bold text-white text-sm">
              {currentCase.beneficiaryName} ({currentCase.janAadhaarId})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Tehsil &amp; LGD Village / Ward:</span>
            <span className="font-bold text-slate-200">
              {currentCase.tehsil}, {currentCase.district} (LGD #{currentCase.lgdWardCode})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Layer-1 Firewall &amp; Cure Protection:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] mt-0.5 ${
                currentCase.ruleSeries === "A_SERIES"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {currentCase.dueProcessBadgeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentCase.cureWindowDaysLeft} Days Protected ({currentCase.cureWindowExpiryDate})
            </span>
          </div>
        </div>
      </div>

      {/* 5-Stage Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveTab("step0")}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "step0"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-black">
            STAGE 0
          </span>
          Scheme Onboarding &amp; Playbook Builder
        </button>

        <button
          onClick={() => setActiveTab("intake")}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "intake"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-black">
            1–2
          </span>
          Stage 1–2: Layer-1 Scrutiny &amp; 15-Day Cure Notice
        </button>

        <button
          onClick={() => setActiveTab("emitra")}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "emitra"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black">
            3
          </span>
          e-Mitra Kiosk (T1–T6 Proof Engine)
        </button>

        <button
          onClick={() => setActiveTab("adjudication")}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "adjudication"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black">
            4
          </span>
          BDO / DSO / SDO Workbench
        </button>

        <button
          onClick={() => setActiveTab("delta")}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "delta"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black">
            5
          </span>
          Live &quot;Delta-Watcher&quot; Ledger
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white rounded-b-xl rounded-tr-xl p-6 shadow-md border border-slate-100 min-h-[540px]">
        {/* ========================================================================= */}
        {/* TAB 0: STEP 0 SCHEME ONBOARDING & PLAYBOOK BUILDER */}
        {/* ========================================================================= */}
        {activeTab === "step0" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Step 0: No-Code Policy Compiler (Decouples Engine Math from Scheme Numbers)
                </span>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-400" />
                  Onboard Any Rajasthan Welfare Scheme in 60 Seconds
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                  Select an official Rajasthan Government Order preset or edit the <code className="text-amber-300">$Placeholders</code> below. Statutory <code className="text-emerald-300">K-Series</code> rules follow official Gazette Notifications, while <code className="text-amber-300">A-Series</code> risk proxies (<code className="text-amber-300">$MAX_DISCOM_BILL</code>, kW, triage weights) are configured jointly with Department / RISL Nodal Officers to parameterize Layer 1, Layer 3 (<code className="text-emerald-300">T1–T6</code>), and Layer 4 Delta-Watcher.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SCHEME_PLAYBOOK_PRESETS) as SchemeId[]).map((key) => {
                  const p = SCHEME_PLAYBOOK_PRESETS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition ${
                        selectedPresetKey === key
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {p.schemeId}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Column 1 */}
              <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-xs">
                <div className="font-black text-slate-800 text-sm border-b pb-2 flex items-center justify-between">
                  <span>1. Government Order &amp; Exemptions</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {activePreset.schemeId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Active Scheme:</span>
                  <span className="font-bold text-slate-900 text-sm">{activePreset.schemeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Statutory GO Reference:</span>
                  <span className="font-mono text-slate-800 bg-white p-2 rounded border block mt-1">
                    {activePreset.goReference}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Designated Appellate Authority:</span>
                  <span className="font-bold text-slate-800">{activePreset.appellateAuthority}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1.5">
                    Statutorily Exempt Categories (models.py Parity — Auto-Protected in L1):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePreset.exemptCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded-md font-mono font-bold text-[11px]"
                      >
                        ✓ {cat}
                      </span>
                    ))}
                  </div>
                  {activePreset.statutoryRuleExemptions && activePreset.statutoryRuleExemptions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {activePreset.statutoryRuleExemptions.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-md font-semibold text-[10px]"
                        >
                          Rule Shield: {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Enabled K-Rules (Hard Statutory · {activePreset.enabledKRules.join(", ")}):
                  </span>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {activePreset.activeKRules.map((rule) => (
                      <span
                        key={rule}
                        className="px-2 py-0.5 bg-slate-800 text-white rounded font-mono text-[10px] font-semibold"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Enabled A-Rules (Soft Proxies · {activePreset.enabledARules.join(", ")}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activePreset.activeARules.map((rule) => (
                      <span
                        key={rule}
                        className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-[10px] font-semibold"
                      >
                        {rule}
                      </span>
                    ))}
                    {!activePreset.enabledARules.includes("A03") && (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 border border-slate-300 rounded font-mono text-[10px] font-bold">
                        A03 Discom Proxy: OFF by default
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-xs">
                <div className="font-black text-slate-800 text-sm border-b pb-2 flex items-center justify-between">
                  <span>2. Parameterized Thresholds ($X)</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                    Live Binding
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  <b>Ministry Calibration Split:</b> Statutory <code>K-Series</code> hard rules follow official Gazette Notifications; <code>A-Series</code> risk proxies (<code>$MAX_DISCOM_BILL</code>, kW, triage weights) are configured jointly with Department / RISL Nodal Officers.
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>$MAX_ANNUAL_INCOME (K02):</span>
                      <span className="font-mono text-primary">₹{customIncomeThreshold.toLocaleString("en-IN")}/yr</span>
                    </div>
                    <input
                      type="range"
                      min={48000}
                      max={300000}
                      step={12000}
                      value={customIncomeThreshold}
                      onChange={(e) => setCustomIncomeThreshold(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                      <span>$MAX_DISCOM_BILL (A03 Proxy):</span>
                      <div className="flex items-center gap-1.5">
                        {!activePreset.enabledARules.includes("A03") && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            A03 OFF by default
                          </span>
                        )}
                        <span className="font-mono text-amber-600 font-black">
                          ₹{customDiscomThreshold.toLocaleString("en-IN")}/yr
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={18000}
                      max={60000}
                      step={2000}
                      value={customDiscomThreshold}
                      onChange={(e) => setCustomDiscomThreshold(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Updates Case 1 &amp; Stage 5 Delta-Watcher threshold in real time
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Guardrail: A3 Worst-Case Materiality Gate
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        max(V1, V2) &gt; {customIrrigatedHaCap} Ha
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Test a marginal farmer with <b>Barani (unirrigated) land + Borewell Pump</b>:
                    </p>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Farmer Land: {simBaraniPumpHa.toFixed(1)} Ha</span>
                      <input
                        type="range"
                        min={0.5}
                        max={3.5}
                        step={0.5}
                        value={simBaraniPumpHa}
                        onChange={(e) => setSimBaraniPumpHa(Number(e.target.value))}
                        className="w-28 accent-emerald-600"
                      />
                    </div>
                    <div
                      className={`p-2 rounded-lg font-bold text-[11px] ${
                        simBaraniPumpHa <= customIrrigatedHaCap
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {simBaraniPumpHa <= customIrrigatedHaCap
                        ? `✓ PROTECTED (0 Pts Deducted): Even if 100% irrigated (${simBaraniPumpHa} Ha <= ${customIrrigatedHaCap} Ha cap). Citizen is NEVER harassed!`
                        : `⚠ MATERIAL BREACH: Reclassified ${simBaraniPumpHa} Ha exceeds ${customIrrigatedHaCap} Ha cap -> Triggers K04-A / A06 review.`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-4 space-y-3 text-xs">
                <div className="font-black text-sm border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span className="text-emerald-400">3. Universal Rebuttal Matrix (T1–T6)</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    Flow vs. Stock Aware
                  </span>
                </div>

                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                  {activePreset.boundRebuttalOperators.map((op) => (
                    <div
                      key={op.code}
                      className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          [{op.code}] {op.name}
                        </span>
                        <code className="text-[10px] text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded">
                          {op.formula}
                        </code>
                      </div>
                      <p className="text-[11px] text-slate-300">{op.description}</p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-[11px] space-y-1">
                  <span className="font-bold text-emerald-300 block">
                    ✓ Layer-1 First-Check Database Auto-Shields Active:
                  </span>
                  <span className="text-slate-300 block">
                    • <b>CBDT Nil-Tax ITR:</b> <code>net_tax_liability == ₹0</code> auto-cleared in L1
                  </span>
                  <span className="text-slate-300 block">
                    • <b>RFCTLARR Sec. 96:</b> Highway land award subtracted in L1
                  </span>
                  <span className="text-slate-300 block">
                    • <b>MCA21 Companies Act, 2013 Chapter XXIA (Sec. 378B–378F):</b> FPO <code>PRODUCER_COMPANY</code> directors exempted in L1
                  </span>
                </div>
              </div>
            </div>

            {/* 12-Endpoint Connector Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div>
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    12-Endpoint Golden Record Integration Topology (7 State RajSewaDwar + 5 Central API Setu / DFPD)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Logical Service Namespaces (<code>RajSewaDwar</code> / <code>API Setu</code>) mapped to live departmental endpoints during RSDC onboarding.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("intake")}
                  className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                >
                  Test Live Cases in Stage 1–5 Pipeline
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px]">
                {DATA_ENDPOINTS_CATALOG.map((ep) => (
                  <div key={ep.id} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-slate-900 truncate">{ep.id}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          ep.tier === "STATE_RAJ_SEWA_DWAAR"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {ep.tier === "STATE_RAJ_SEWA_DWAAR" ? "RajSewaDwar" : "API Setu / DFPD"}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-700 mb-0.5">{ep.department}</p>
                    <div className="mb-1 space-y-0.5">
                      {ep.uri.split(" | ").map((u) => (
                        <code key={u} className="text-[10px] text-emerald-700 block break-all">
                          {u}
                        </code>
                      ))}
                    </div>
                    <p className="text-slate-500 leading-snug">{ep.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: STAGE 1-2 — LAYER-1 SCRUTINY & 15-DAY CURE NOTICE ENGINE */}
        {/* ========================================================================= */}
        {activeTab === "intake" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Unified Layer-1 Pre-Notice Scrutiny & Dual-Ingress Status Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Unified Layer-1 Pre-Notice Scrutiny &amp; Dual-Ingress
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ALL records pass through Layer-1 Pre-Notice Shields first
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">
                    Stage 1–2: Unified Layer-1 Auto-Shield Matrix &rarr; 15-Day Cure Notice
                  </h3>
                </div>

                {/* Dual-Ingress Source Selector */}
                <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setIngressSource("FULL_12_ENDPOINT_ROLL")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      ingressSource === "FULL_12_ENDPOINT_ROLL"
                        ? "bg-emerald-500 text-slate-950 shadow"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Full 12-Endpoint Roll Scrutiny
                  </button>
                  <button
                    onClick={() => setIngressSource("EXTERNAL_BATCH_REVERIFY")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      ingressSource === "EXTERNAL_BATCH_REVERIFY"
                        ? "bg-blue-500 text-white shadow"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Pre-Flagged External Batch Re-Verify [DFPD / Dept SQL]
                  </button>
                </div>
              </div>

              {/* Mandatory Layer-1 Pre-Notice Shields */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
                {[
                  { label: "Pehchan Death Check", sub: "Flow income -> ₹0 in L1" },
                  { label: "Nil-Tax ITR Auto-Clear", sub: "CBDT tax == ₹0 cleared" },
                  { label: "MCA21 XXIA FPO", sub: "Producer Co. exempted" },
                  { label: "RFCTLARR Sec. 96", sub: "Capital award deducted" },
                  { label: "N-Family Split", sub: "V_gross / N pre-notice" },
                  { label: "Delta-Watcher", sub: "Active shields cleared" },
                ].map((shield) => (
                  <div
                    key={shield.label}
                    className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-2.5"
                  >
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      {shield.label}
                    </span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">{shield.sub}</span>
                  </div>
                ))}
              </div>

              {/* Active Case Layer-1 Decision & Firewall Explanation */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 font-semibold">Ingress Path:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] font-bold">
                      {ingressSource === "FULL_12_ENDPOINT_ROLL"
                        ? "Full 12-Endpoint Roll Scrutiny -> Layer-1 Shields"
                        : "Pre-Flagged External Batch Re-Verify [DFPD / Dept SQL] -> Layer-1 Shields"}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-black border ${
                      currentCase.ruleSeries === "A_SERIES"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {currentCase.dueProcessBadgeLabel}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{currentCase.layer1AuditSummary}</p>

                {currentCase.layer1ResolvedIfLinkedSummary && (
                  <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-emerald-200 text-[11px] leading-snug">
                      <strong className="text-emerald-400">
                        N = 1 (Audit Time) vs. N = 3 (Linked) Reconciliation:
                      </strong>{" "}
                      {currentCase.layer1ResolvedIfLinkedSummary}
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                      N = 3 &rarr; AUTO_RESOLVED_PRE_NOTICE
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Unified Layer-1 Outbound Flag &amp; Ingress Payload
                  </h3>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {currentCase.sourceEndpointUri}
                  </span>
                </div>

                <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                  <p className="text-slate-500">// Deterministic Seeded ID Payload (Passed Layer-1 Pre-Notice Shields)</p>
                  <pre className="mt-2 text-emerald-400">
{`{
  "ingress_source": "${
    ingressSource === "FULL_12_ENDPOINT_ROLL"
      ? "FULL_12_ENDPOINT_ROLL_SCRUTINY"
      : "PRE_FLAGGED_EXTERNAL_BATCH_REVERIFY_DFPD_SQL"
  }",
  "scheme_id": "${currentCase.schemeId}",
  "source_endpoint": "${currentCase.sourceEndpointUri}",
  "jan_aadhaar_family_id": "${currentCase.janAadhaarId}",
  "beneficiary_hof": "${currentCase.beneficiaryName}",
  "rule_series": "${currentCase.ruleSeries}",
  "rule_id": "${currentCase.ruleId}",
  "disqualification_rule": "${currentCase.ruleCode}",
  "layer1_shields_checked": [
    "PEHCHAN_CRS", "CBDT_NIL_TAX_ITR", "MCA21_FPO_XXIA",
    "RFCTLARR_SEC96", "JAN_AADHAAR_N_SPLIT", "DELTA_WATCHER"
  ],
  "rule_metadata": {
    "flagged_value": "${currentCase.flaggedValue}",
    "statutory_limit": "${
      currentCase.ruleCode === "RULE_DISCOM_24K"
        ? `₹${customDiscomThreshold.toLocaleString("en-IN")} / year`
        : currentCase.thresholdValue
    }",
    "source_department": "${currentCase.sourceDepartment}"
  },
  "due_process_status": "${currentCase.dueProcessStatus}",
  "cure_window_days": 15
}`}
                  </pre>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                  <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">
                      Statutory Due-Process Shield ({currentCase.statutoryCitation})
                    </span>
                    Even when an Aadhaar or K-Number match is 100% exact (as in the 1.82 Lakh Railway Employees NFSA drive or the 3 Lakh Rajasthan Pensioner electricity drive), benefits are protected for a 15-day cure window so household member splits (<code>T3</code>) and joint-family meter splits (<code>T4</code>) can be executed at e-Mitra before any cut.
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-primary" />
                    Stage 2: Assisted-First Citizen Notice (Hindi SMS + OBD Call)
                  </h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Status: Delivered
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      Official Hindi SMS Notice
                    </span>
                    <span>{currentCase.mobileNumberMasked}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed shadow-sm">
                    {currentCase.smsTranscriptHindi}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      Automated Outbound Voice Call (Hindi / Local Dialect OBD)
                    </span>
                    <span className="text-slate-400">Duration: 38 sec</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                    &quot;{currentCase.ivrTranscriptHindi}&quot;
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setIsPlayingIvr(!isPlayingIvr)}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow hover:bg-primary/90 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      {isPlayingIvr ? "Pause Audio Stream" : "Simulate Citizen Voice Call (Hindi OBD)"}
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      Zero smartphone dependency
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("emitra")}
                    className="w-full py-3 bg-gradient-to-r from-blue-700 to-primary text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition flex items-center justify-center gap-2"
                  >
                    Proceed to Stage 3: Open Citizen Case in e-Mitra Kiosk Console
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: e-MITRA KIOSK CONSOLE & FORENSIC PROOF ENGINE (T1-T6) */}
        {/* ========================================================================= */}
        {activeTab === "emitra" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
                  eM
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      Rajasthan e-Mitra Kiosk Operator Console
                    </h3>
                    <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                      Kiosk ID: EMITRA-JPR-0492
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Powered by Jan Aadhaar 2.0 Native Family Graph | Biometric Device: Mantra MFS110 (UIDAI L1 RD Connected)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Jan Aadhaar 2.0 Family Graph Inwarded</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {currentCase.janAadhaarId} (Biometric eKYC OK)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: T1-T6 Guided Rebuttal Selection */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Select Guided Rebuttal Operator (T1–T6)
                </h4>

                <div className="space-y-2.5">
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
                      className={`block p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                        selectedRebuttalId === r.id
                          ? "bg-primary/5 border-primary shadow-sm"
                          : r.isTier2Escalation
                          ? "bg-amber-50/40 border-amber-200 hover:bg-amber-50"
                          : "bg-white border-slate-200 hover:bg-slate-50"
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
                          className="mt-0.5 text-primary focus:ring-primary"
                        />
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 text-sm leading-snug">
                              {r.labelHindi}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold shrink-0">
                              {r.operatorCode}
                            </span>
                          </div>
                          <div className="text-slate-500 text-xs mt-1 font-sans">
                            {r.labelEnglish}
                          </div>
                          <div className="mt-2 text-primary font-medium bg-primary/10 px-2 py-1 rounded inline-block">
                            Proof: {r.requiredEvidence}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Tier-2 Progressive Disclosure Guardrail when T6 (Others) is selected */}
                {activeRebuttalObj?.isTier2Escalation && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs space-y-2.5">
                    <span className="font-bold text-amber-950 block">
                      Tier-2 Anti-Abuse Guardrail (T6 Natural Justice Escalation):
                    </span>
                    <label className="flex items-start gap-2 cursor-pointer text-amber-900">
                      <input
                        type="checkbox"
                        checked={tier2ConfirmChecked}
                        onChange={(e) => setTier2ConfirmChecked(e.target.checked)}
                        className="mt-0.5 rounded text-amber-600"
                      />
                      <span>
                        I confirm that standard deterministic categories (T1–T5) do not apply and an official supporting order/FIR is attached for manual Appellate Officer review.
                      </span>
                    </label>
                    <div>
                      <span className="text-amber-800 block mb-1 font-semibold">
                        Supporting Order / FIR / Panchnama Ref No.:
                      </span>
                      <input
                        type="text"
                        value={tier2DocReference}
                        onChange={(e) => setTier2DocReference(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Case-Specific Telemetry / Jan Aadhaar 2.0 Graph Card */}
                {currentCase.ruleCode === "RULE_DISCOM_24K" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <span className="font-bold text-slate-800 block">
                      Jan Aadhaar 2.0 Split-Family Lineage Graph (Auto-Fetched via Parent ID JA-ROOT-1998-080899):
                    </span>
                    <div className="space-y-1.5 font-mono">
                      <div className="p-2 bg-white rounded border flex justify-between items-center">
                        <span>Card 1 (HOF Mother): 4829103847</span>
                        <span className="text-emerald-600 font-bold">Kamla Devi</span>
                      </div>
                      <div className="p-2 bg-white rounded border flex justify-between items-center">
                        <span>Card 2 (Split Son 1): 4829103848</span>
                        <span className="text-slate-700 font-bold">Suresh Meena</span>
                      </div>
                      <div className="p-2 bg-white rounded border flex justify-between items-center">
                        <span>Card 3 (Split Son 2): 4829103849</span>
                        <span className="text-slate-700 font-bold">Mahesh Meena</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <label className="text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateCollision}
                          onChange={(e) => {
                            setSimulateCollision(e.target.checked);
                            setGraphResult(null);
                            setAdjudicationDecision(null);
                          }}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        Simulate Anti-Gaming K-No Collision (Fraud Attempt)
                      </label>
                    </div>
                  </div>
                )}

                {currentCase.ruleCode === "RULE_VAHAN_4W" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <span className="font-bold text-slate-800 block">
                      Vahan 4.0 RC Telemetry &amp; Form 29/30 Verification:
                    </span>
                    <div className="p-2.5 bg-white rounded border space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jan Aadhaar HOF Basis:</span>
                        <span className="font-semibold text-slate-700">Single-Adult Male HOF (Jan Aadhaar Act Sec. 1.1(k))</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Form 29/30 &amp; Delivery Note:</span>
                        <span className="font-bold text-slate-800">Scanned &amp; Verified (14-May-2019)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle:</span>
                        <span className="font-mono font-bold text-slate-800">Maruti Alto 800 (RJ-14-CC-4821)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vahan 4.0 RC / Fitness Status:</span>
                        <span className="font-mono text-emerald-700 font-bold">ELV &gt;15 Yrs (Fitness Expired)</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <label className="text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateFraudVahan}
                          onChange={(e) => {
                            setSimulateFraudVahan(e.target.checked);
                            setVahanResult(null);
                            setAdjudicationDecision(null);
                          }}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        Simulate Active RC / Backdated Sale Deed (Fraud Attempt)
                      </label>
                    </div>
                  </div>
                )}

                {currentCase.ruleCode === "RULE_GOVT_EMP_K01" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Jan Aadhaar 2.0 Member Table &amp; DFPD e-POS Grain Telemetry:
                    </span>
                    <div className="p-2.5 bg-white rounded border space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>1. Smt. Geeta Devi (Relation: SELF (Mukhiya / HOF), Age 58)</span>
                        <span className="text-emerald-700 font-bold">Mukhiya / Homemaker (Keep Active)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Shri Bhanwar Lal Jat (Relation: HUSBAND)</span>
                        <span className="text-emerald-700 font-bold">Farmer (Keep Active)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Pooja Jat (Relation: DAUGHTER)</span>
                        <span className="text-emerald-700 font-bold">Student (Keep Active)</span>
                      </div>
                      <div className="flex justify-between bg-amber-50 p-1 rounded border border-amber-200">
                        <span>4. Rahul Jat (Relation: SON)</span>
                        <span className="text-amber-900 font-bold">Railway HRMS &rarr; Split (T3)</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Semantic relation labels displayed above; backend Jan Aadhaar integer relation IDs are mapped via RSDC config.
                    </p>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <label className="text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateFraudRailway}
                          onChange={(e) => {
                            setSimulateFraudRailway(e.target.checked);
                            setMemberSplitResult(null);
                            setAdjudicationDecision(null);
                          }}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        Simulate Mukhiya (HOF) Herself Is Active Govt Employee Lifting Grain
                      </label>
                    </div>
                  </div>
                )}

                <button
                  disabled={isVerifyingProof || (activeRebuttalObj?.isTier2Escalation && !tier2ConfirmChecked)}
                  onClick={handleRunForensicProof}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow transition flex items-center justify-center gap-2"
                >
                  {isVerifyingProof ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running 12-Endpoint Cross-Registry Proof Engine...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run Swaraj-Auto Cross-Registry Proof Engine
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Automated Forensic Verification Results */}
              <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-black text-sm text-white">
                        Deterministic Jan Aadhaar 2.0 Graph &amp; Registry Attestation
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      100% Auditable Math
                    </span>
                  </div>

                  {!graphResult && !vahanResult && !memberSplitResult && !altRebuttalResult && !isVerifyingProof && (
                    <div className="py-20 text-center text-slate-400 text-sm">
                      <Scale className="w-10 h-10 mx-auto text-slate-600 mb-3 opacity-60" />
                      Click <b>&quot;Run Swaraj-Auto Cross-Registry Proof Engine&quot;</b> to execute deterministic verification across Jan Aadhaar 2.0 and connected registries.
                    </div>
                  )}

                  {isVerifyingProof && (
                    <div className="py-20 text-center text-slate-300 space-y-3">
                      <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
                      <p className="text-sm font-mono">Querying {currentCase.sourceEndpointUri} + Jan Aadhaar 2.0 Family Graph...</p>
                    </div>
                  )}

                  {/* Audit Fix #20: Alternative T1/T5/T6 Rebuttal Verification Output */}
                  {altRebuttalResult && !isVerifyingProof && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div>
                          <span className="text-xs text-slate-400 block">Operator Execution Status:</span>
                          <span
                            className={`font-black text-base flex items-center gap-1.5 ${
                              altRebuttalResult.operatorCode === "T6" ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {altRebuttalResult.operatorCode === "T6" ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {altRebuttalResult.statusCode}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Operator Code:</span>
                          <span className="font-mono font-bold text-amber-400 text-base">
                            {altRebuttalResult.operatorCode} ({altRebuttalResult.recommendedBdoAction})
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <p className="text-slate-200 leading-relaxed font-sans">
                          {altRebuttalResult.explanationHindi}
                        </p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {altRebuttalResult.explanationEnglish}
                        </p>
                        <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[11px]">
                          <span className="text-slate-500">Logged Evidence Ref:</span>
                          <span
                            className={
                              altRebuttalResult.operatorCode === "T6" ? "text-amber-400" : "text-emerald-400"
                            }
                          >
                            {altRebuttalResult.documentReference}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case 1: Electricity Result Output */}
                  {graphResult && !isVerifyingProof && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div>
                          <span className="text-xs text-slate-400 block">Verification Status:</span>
                          <span
                            className={`font-black text-base flex items-center gap-1.5 ${
                              graphResult.verified ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {graphResult.verified ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {graphResult.statusCode}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Jan Aadhaar 2.0 Lineage:</span>
                          <span
                            className={`font-mono font-bold text-base ${
                              graphResult.statusCode === "LINEAGE_MISMATCH_FRAUD"
                                ? "text-rose-400"
                                : "text-amber-400"
                            }`}
                          >
                            {graphResult.statusCode === "LINEAGE_MISMATCH_FRAUD"
                              ? "Lineage Mismatch"
                              : "100% Deterministic Match"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex items-start gap-2">
                          <span
                            className={`font-bold ${
                              graphResult.detailedProof.addressMatches ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {graphResult.detailedProof.addressMatches ? "✓" : "✗"}
                          </span>
                          <span>
                            <b>Jan Aadhaar 2.0 Lineage Match:</b> {graphResult.detailedProof.fatherHusbandLineageMatch}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          {graphResult.detailedProof.antiGamingCollisionPass ? (
                            <span className="text-emerald-400 font-bold">✓</span>
                          ) : (
                            <span className="text-rose-400 font-bold">✗</span>
                          )}
                          <span>
                            <b>State-wide K-Number Collision Ledger:</b>{" "}
                            {graphResult.detailedProof.antiGamingCollisionPass
                              ? "PASS (0 duplicate claims across Rajasthan on these Jan Aadhaar IDs)"
                              : graphResult.detailedProof.collisionDetails}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-3.5 rounded-xl flex items-center justify-between text-xs border ${
                          graphResult.verified
                            ? "bg-emerald-950/40 border-emerald-500/30"
                            : "bg-rose-950/40 border-rose-500/40"
                        }`}
                      >
                        <div>
                          <span className="text-slate-300 block">
                            {graphResult.verified
                              ? "Apportioned Annual Consumption (T4):"
                              : "Forensic Outcome (Blocked / Escalated):"}
                          </span>
                          <span
                            className={`text-lg font-mono font-black ${
                              graphResult.verified ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {graphResult.statusCode === "COLLISION_DETECTED"
                              ? "BLOCKED — Anti-Gaming K-No Collision"
                              : graphResult.statusCode === "LINEAGE_MISMATCH_FRAUD"
                              ? "BLOCKED — Lineage Mismatch Detected"
                              : `₹${graphResult.totalAnnualBill.toLocaleString("en-IN")} ÷ ${graphResult.verifiedFamilyCount} Families = ₹${graphResult.apportionedBillPerFamily.toLocaleString("en-IN")} / family`}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 font-bold rounded-lg border ${
                            graphResult.verified
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          }`}
                        >
                          {graphResult.verified
                            ? `Limit: ₹${graphResult.activeThreshold.toLocaleString("en-IN")}`
                            : graphResult.advisoryDecision}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Case 2: Vahan 4.0 Result Output */}
                  {vahanResult && !isVerifyingProof && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div>
                          <span className="text-xs text-slate-400 block">Vahan 4.0 Corroboration Status:</span>
                          <span
                            className={`font-black text-base flex items-center gap-1.5 ${
                              vahanResult.verified ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {vahanResult.verified ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {vahanResult.statusCode}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Dispossession Confidence:</span>
                          <span
                            className={`font-mono font-bold text-base ${
                              vahanResult.verified ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {(vahanResult.confidenceScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <p className="text-slate-300 leading-relaxed font-sans">
                          {vahanResult.telemetrySignals.explanationHindi}
                        </p>
                        <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Vahan 4.0 RC Status:</span>
                            <span className={vahanResult.verified ? "text-slate-200" : "text-rose-300"}>
                              {vahanResult.telemetrySignals.vahanRcStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Fitness / Tax / Insurance Validity:</span>
                            <span className={vahanResult.verified ? "text-emerald-400" : "text-rose-400"}>
                              {vahanResult.telemetrySignals.fitnessAndTaxExpiry}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case 3: 1.82L Railway Employee Member-Split Result Output */}
                  {memberSplitResult && !isVerifyingProof && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div>
                          <span className="text-xs text-slate-400 block">Household Graph Resolution (T3):</span>
                          <span
                            className={`font-black text-base flex items-center gap-1.5 ${
                              memberSplitResult.verified ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {memberSplitResult.verified ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {memberSplitResult.statusCode}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">e-POS Biometric Drawal:</span>
                          <span
                            className={`font-mono font-bold text-base ${
                              memberSplitResult.verified ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {memberSplitResult.eposGrainDrawnByFlaggedMemberKg} kg by Employee
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <p className="text-slate-300 leading-relaxed font-sans">
                          {memberSplitResult.explanationHindi}
                        </p>
                        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Jan Aadhaar 2.0 Relation:</span>
                            <span className={memberSplitResult.verified ? "text-amber-300" : "text-rose-300"}>
                              {memberSplitResult.relationCodeInJanAadhaar}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Remaining Household NFSA Quota:</span>
                            <span className={memberSplitResult.verified ? "text-emerald-400" : "text-rose-400"}>
                              {memberSplitResult.remainingEligibleMembersCount} Members ({memberSplitResult.revisedMonthlyQuotaKg} kg/month)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4">
                  <button
                    onClick={() => setActiveTab("adjudication")}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-2"
                  >
                    Transmit Docket to Stage 4: {currentCase.appellateAuthorityTitle}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STAGE 4 — BDO / DSO / SDO ADJUDICATION WORKBENCH */}
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
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-black text-base text-white">
                    Appellate Officer Workbench: {currentCase.appellateAuthorityTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Statutory Authority under {currentCase.statutoryCitation}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-xs text-slate-400 block">Case ID · Scheme</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {currentCase.caseId} ({currentCase.schemeId})
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                    currentCase.ruleSeries === "A_SERIES"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {currentCase.dueProcessBadgeLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-slate-700 text-sm block border-b pb-1">
                  1. Inbound Flag ({currentCase.sourceDepartment})
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Rule &amp; Firewall Tier:</span>
                    <span
                      className={`font-bold text-right ${
                        currentCase.ruleSeries === "A_SERIES" ? "text-amber-700" : "text-rose-700"
                      }`}
                    >
                      {currentCase.ruleId} ({currentCase.ruleSeries === "A_SERIES" ? "Soft A-Series Proxy — Manual Verify" : "Hard K-Series Statutory Rule"})
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Detected Value:</span>
                    <span className="font-bold text-rose-600 text-right">{currentCase.flaggedValue}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Statutory Limit:</span>
                    <span className="font-bold text-slate-800 text-right">
                      {currentCase.ruleCode === "RULE_DISCOM_24K"
                        ? `₹${customDiscomThreshold.toLocaleString("en-IN")} / year`
                        : currentCase.thresholdValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Cross-Registry Proof Card (Inspects actual Stage 3 state) */}
              {!hasAnyProof && (
                <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-200 pb-1">
                      <Scale className="w-4 h-4 text-slate-600" />
                      2. Swaraj-Auto Cross-Registry Proof: Pending Execution
                    </span>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      Stage 3 e-Mitra Cross-Registry Proof Engine has not been run for this docket yet. Run verification in Stage 3 to fetch deterministic attestation before adjudication.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("emitra")}
                    className="self-start px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    Open Stage 3 (e-Mitra Proof Engine)
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {hasAnyProof && isFraudDetected && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 space-y-2">
                  <span className="font-black text-rose-900 text-sm flex items-center gap-1.5 border-b border-rose-200 pb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    2. Swaraj-Auto Forensic Alert:{" "}
                    {graphResult?.statusCode === "COLLISION_DETECTED"
                      ? "Anti-Gaming Collision Blocked"
                      : graphResult?.statusCode === "LINEAGE_MISMATCH_FRAUD"
                      ? "Lineage Mismatch Detected"
                      : vahanResult?.statusCode === "SUSPECTED_FRAUD_ACTIVE_RC"
                      ? "Active 2026 Fitness/Insurance Detected — Backdated Sale Suspected"
                      : "Mukhiya Active Govt Payroll + 180 kg e-POS Drawal"}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-2">
                      <span className="text-rose-700 shrink-0">Selected Operator:</span>
                      <span className="font-bold text-rose-950 text-right">
                        {activeRebuttalObj
                          ? `[${activeRebuttalObj.operatorCode}] ${activeRebuttalObj.labelEnglish}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-rose-700 shrink-0">Forensic Finding:</span>
                      <span className="font-bold text-rose-900 text-right">
                        {graphResult?.statusCode === "COLLISION_DETECTED"
                          ? `COLLISION_DETECTED — ${graphResult.detailedProof.collisionDetails}`
                          : graphResult?.statusCode === "LINEAGE_MISMATCH_FRAUD"
                          ? `LINEAGE_MISMATCH_FRAUD — ${graphResult.detailedProof.fatherHusbandLineageMatch}`
                          : vahanResult?.statusCode === "SUSPECTED_FRAUD_ACTIVE_RC"
                          ? `SUSPECTED_FRAUD_ACTIVE_RC (${(vahanResult.confidenceScore * 100).toFixed(1)}% confidence) — ${vahanResult.telemetrySignals.fitnessAndTaxExpiry}`
                          : memberSplitResult?.statusCode === "HOF_ACTIVE_EMPLOYEE_FRAUD"
                          ? `HOF_ACTIVE_EMPLOYEE_FRAUD — ${memberSplitResult.flaggedMemberName} drew ${memberSplitResult.eposGrainDrawnByFlaggedMemberKg} kg via e-POS`
                          : "Fraud Signal Detected"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 pt-1 border-t border-rose-200">
                      <span className="text-rose-700 font-bold shrink-0">Recommended Action:</span>
                      <span className="font-black text-rose-950 text-right">
                        {memberSplitResult?.statusCode === "HOF_ACTIVE_EMPLOYEE_FRAUD"
                          ? "Uphold / Reject Rebuttal — Cancellation & Recovery Recommended"
                          : currentCase.ruleSeries === "A_SERIES"
                          ? "Uphold / Reject Rebuttal (Escalate to Field Verification)"
                          : "Uphold / Reject Rebuttal"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {hasAnyProof && !isFraudDetected && isAmberEscalation && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5 border-b border-amber-200 pb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    2. Swaraj-Auto Escalation Proof (Manual / Field Review Required)
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-2">
                      <span className="text-amber-700">Selected Operator:</span>
                      <span className="font-bold text-amber-950 text-right">
                        {activeRebuttalObj
                          ? `[${activeRebuttalObj.operatorCode}] ${activeRebuttalObj.labelEnglish}`
                          : "T6 Escalation"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-amber-700">Registry Attestation:</span>
                      <span className="font-bold text-amber-900 text-right">
                        {altRebuttalResult
                          ? `${altRebuttalResult.statusCode} (${altRebuttalResult.documentReference})`
                          : graphResult
                          ? `Apportioned ₹${graphResult.apportionedBillPerFamily.toLocaleString("en-IN")} >= ₹${graphResult.activeThreshold.toLocaleString("en-IN")}`
                          : "Escalated"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-amber-700">Effective Assessment:</span>
                      <span className="font-bold text-amber-950 text-right">
                        Field Panchnama / Appellate Review Recommended (Cure Window Protected)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {hasAnyProof && !isFraudDetected && !isAmberEscalation && isVerifiedPass && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5 border-b border-emerald-200 pb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    2. Swaraj-Auto Verified Rebuttal Proof
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-2">
                      <span className="text-emerald-700">Selected Operator:</span>
                      <span className="font-bold text-emerald-950 text-right">
                        {activeRebuttalObj
                          ? `[${activeRebuttalObj.operatorCode}] ${activeRebuttalObj.labelEnglish}`
                          : "T4 Denominator Split"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-emerald-700">Registry Attestation:</span>
                      <span className="font-bold text-emerald-900 text-right">
                        {altRebuttalResult
                          ? `${altRebuttalResult.statusCode} (${altRebuttalResult.documentReference})`
                          : graphResult
                          ? `Parent Jan Aadhaar Lineage Verified | 0 Collisions (${graphResult.verifiedFamilyCount} Families)`
                          : vahanResult
                          ? `${(vahanResult.confidenceScore * 100).toFixed(1)}% Dispossession Confidence | Vahan ELV Expired`
                          : memberSplitResult
                          ? `${memberSplitResult.relationCodeInJanAadhaar} | ${memberSplitResult.eposGrainDrawnByFlaggedMemberKg} kg e-POS Drawal by Son`
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-emerald-700">Effective Assessment:</span>
                      <span className="font-bold text-emerald-950 text-right">
                        {altRebuttalResult
                          ? `Verified (${altRebuttalResult.operatorCode}) — Immediate Benefit Restoration`
                          : graphResult
                          ? `₹${graphResult.apportionedBillPerFamily.toLocaleString("en-IN")} / family (< ₹${graphResult.activeThreshold.toLocaleString("en-IN")} PASS)`
                          : vahanResult
                          ? `Dispossessed on ${vahanResult.saleDateExtracted} (Eligible)`
                          : memberSplitResult
                          ? `Son Unit Severed; HOF & Family Retain ${memberSplitResult.revisedMonthlyQuotaKg} kg/mo Quota`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isFraudDetected && (
              <div className="bg-rose-950 text-rose-100 border border-rose-500/50 rounded-xl p-3.5 text-xs flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  <b>Forensic Guardrail Warning:</b> Stage 3 verification flagged a{" "}
                  <b>
                    {graphResult?.statusCode ||
                      vahanResult?.statusCode ||
                      memberSplitResult?.statusCode}
                  </b>{" "}
                  alert. Recommended statutory action is{" "}
                  <b>
                    {currentCase.ruleSeries === "A_SERIES"
                      ? "Escalate to Field Verification / Reject Rebuttal"
                      : "Uphold / Reject Rebuttal"}
                  </b>
                  .
                </span>
              </div>
            )}

            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
                Statutory Adjudication Action:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  disabled={isSigningOrder}
                  onClick={() => handleAdjudicate("APPROVED")}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    adjudicationDecision === "APPROVED"
                      ? "bg-emerald-700 text-white shadow-lg ring-2 ring-emerald-500"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Rebuttal &amp; Issue Predicate Shield
                </button>

                <button
                  disabled={isSigningOrder}
                  onClick={() => handleAdjudicate("FIELD_VISIT")}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    adjudicationDecision === "FIELD_VISIT"
                      ? "bg-amber-600 text-white shadow-lg ring-2 ring-amber-500"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Dispatch VDO / Patwari Field Panchnama (T6)
                </button>

                <button
                  disabled={isSigningOrder}
                  onClick={() => handleAdjudicate("REJECTED")}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    adjudicationDecision === "REJECTED"
                      ? "bg-rose-700 text-white shadow-lg ring-2 ring-rose-500"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  {currentCase.ruleSeries === "A_SERIES"
                    ? "Escalate to Field Verification / Reject Rebuttal"
                    : "Uphold Exclusion (Final Disqualification)"}
                </button>
              </div>
            </div>

            {adjudicationDecision && (
              <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-6 shadow-md animate-in fade-in space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-6 h-6 text-slate-800" />
                    <div>
                      <h4 className="font-black text-slate-900 text-base">
                        कार्यालय अपीलीय प्राधिकारी ({currentCase.appellateAuthorityTitle})
                      </h4>
                      <p className="text-xs text-slate-500">
                        कारण सहित आदेश (Reasoned Speaking Order under {currentCase.statutoryCitation})
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-white border px-3 py-1 rounded-md text-slate-700 font-bold">
                    Order Ref: ORD/{currentCase.caseId}/2026
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans space-y-2">
                  <p>
                    <b>विषय:</b> {currentCase.schemeName} ({currentCase.schemeId}) पात्रता निर्णय आदेश (केस: {currentCase.caseId})।
                  </p>
                  <p>
                    {adjudicationDecision === "APPROVED" && altRebuttalResult && (
                      <>{altRebuttalResult.explanationHindi}</>
                    )}
                    {adjudicationDecision === "APPROVED" && !altRebuttalResult && currentCase.ruleCode === "RULE_DISCOM_24K" && (
                      <>
                        आवेदक <b>{currentCase.beneficiaryName}</b> (जन-आधार: {currentCase.janAadhaarId}) के प्रकरण में जन-आधार 2.0 फैमिली ग्राफ एवं विद्युत निगम रिकॉर्ड का सत्यापन किया गया। मीटर {currentCase.flaggedValue} पर 3 पृथक जन-आधार परिवार निवासरत हैं। प्रति परिवार वार्षिक हिस्सा ₹9,500 आता है जो निर्धारित सीमा ₹{customDiscomThreshold.toLocaleString("en-IN")} से कम है। अतः पेंशन बहाल रखते हुए सशर्त प्रेडिकेट शील्ड (<code>Bill / 3 &lt; ₹{customDiscomThreshold.toLocaleString("en-IN")}</code>) जारी की जाती है।
                      </>
                    )}
                    {adjudicationDecision === "APPROVED" && !altRebuttalResult && currentCase.ruleCode === "RULE_VAHAN_4W" && (
                      <>
                        आवेदक <b>{currentCase.beneficiaryName}</b> द्वारा प्रस्तुत फॉर्म 29/30 विक्रय दस्तावेज एवं वाहन 4.0 पोर्टल (<code>apisetu://morth-vahan/v4</code>) की जांच से पुष्टि हुई कि वाहन RJ-14-CC-4821 वर्ष 2019 में बेचा जा चुका है तथा फिटनेस/पंजीकरण अवधि समाप्त हो चुकी है। खाद्य एवं नागरिक आपूर्ति विभाग की अधिसूचना दिनांक 20.07.2017 (खंड 5) के अंतर्गत परिवार की NFSA पात्रता बहाल रखी जाती है।
                      </>
                    )}
                    {adjudicationDecision === "APPROVED" && !altRebuttalResult && currentCase.ruleCode === "RULE_GOVT_EMP_K01" && (
                      <>
                        आवेदक मुखिया <b>{currentCase.beneficiaryName}</b> (जन-आधार: {currentCase.janAadhaarId}) के प्रकरण में जन-आधार 2.0 पारिवारिक संबंध एवं DFPD e-POS बायोमेट्रिक रिकॉर्ड का सत्यापन किया गया। रेलवे HRMS में कार्यरत सदस्य <b>राहुल जाट (Relation: SON / पुत्र)</b> द्वारा नौकरी के पश्चात 0 किग्रा राशन उठाया गया है। अतः <code>T3 Member Split</code> के तहत केवल राहुल जाट की 5 किग्रा यूनिट को राशन कार्ड से पृथक करते हुए शेष 3 सदस्यों (मुखिया गीता देवी, भंवर लाल जाट एवं पूजा जाट — 15 किग्रा/माह) की खाद्य सुरक्षा पात्रता यथावत बहाल रखी जाती है।
                      </>
                    )}
                    {adjudicationDecision === "FIELD_VISIT" && (
                      <>
                        प्रस्तुत साक्ष्यों ({tier2DocReference}) की स्थलीय पुष्टि हेतु ग्राम विकास अधिकारी (VDO) / पटवारी {currentCase.tehsil} को निर्देशित किया जाता है कि 7 कार्यदिवस में भौतिक पंचनामा रिपोर्ट प्रस्तुत करें। माननीय सर्वोच्च न्यायालय के <i>S.Q. Masood (2022)</i> सिद्धांत के अनुसार तब तक लाभ सुरक्षित समीक्षा में रहेगा।
                      </>
                    )}
                    {adjudicationDecision === "REJECTED" && currentCase.ruleSeries === "A_SERIES" && (
                      <>
                        यह प्रकरण <code>A03</code> सॉफ्ट रिस्क प्रॉक्सी ({currentCase.dueProcessBadgeLabel}) के अंतर्गत है तथा प्रस्तुत प्रतिवाद / एंटी-गेमिंग जांच समाधानकारक नहीं पाई गई। अतः इस प्रतिवाद को अस्वीकार करते हुए वैधानिक <code>K-Series</code> बहिष्करण से पूर्व BDO / VDO द्वारा अनिवार्य स्थलीय सत्यापन (Field Verification) हेतु अग्रेषित किया जाता है।
                      </>
                    )}
                    {adjudicationDecision === "REJECTED" && currentCase.ruleSeries === "K_SERIES" && (
                      <>
                        जांच उपरांत प्रस्तुत साक्ष्य समाधानकारक नहीं पाए गए। अतः संबंधित योजना अधिसूचना ({currentCase.statutoryCitation}) के अंतर्गत अपात्रता की संपुष्टि करते हुए कारण सहित आदेश जारी किया जाता है।
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Digitally Signed via Raj eSign (SSO Verified)
                  </div>
                  <button
                    onClick={() => setActiveTab("delta")}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    View Delta-Watcher Shield Status
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE "DELTA-WATCHER" SIMULATOR (COVERING ALL 3 CASES - AUDIT FIX #24) */}
        {/* ========================================================================= */}
        {activeTab === "delta" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block mb-1">
                  Stateful Exception Ledger (U6 Upgrade — Active Across All 3 Cases)
                </span>
                <h3 className="text-xl font-black text-white">
                  Live &quot;Delta-Watcher&quot; Next-Month Batch Simulator
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Instead of a static boolean override that fails next month or creates a permanent loophole, Swaraj-Auto writes a live mathematical predicate into the Exception Ledger for every resolved case.
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 block">// Active Case Predicate ({currentCase.caseId}):</span>
                <span className="text-emerald-400 font-bold">
                  {currentCase.statefulPredicateSummary}
                </span>
              </div>
            </div>

            {/* 3-Case Stateful Ledger Summary Strip (Audit Fix #24) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {Object.entries(SEEDED_CASES).map(([key, c]) => (
                <div
                  key={key}
                  onClick={() => setSelectedCaseKey(key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedCaseKey === key
                      ? "bg-emerald-50/70 border-emerald-400 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{c.beneficiaryName}</span>
                    <span className="font-mono text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded">
                      {c.ruleCode}
                    </span>
                  </div>
                  <code className="text-[11px] text-emerald-800 block font-mono break-all">
                    {c.statefulPredicateSummary}
                  </code>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Test Live Next-Month Discom Telemetry (Case 1 Interactive Stress-Test)
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Simulate Next Month&apos;s Discom Bill:</span>
                    <span className="font-mono font-black text-primary text-base">
                      ₹{nextMonthBill.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={12000}
                    max={90000}
                    step={1000}
                    value={nextMonthBill}
                    onChange={(e) => setNextMonthBill(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>₹12,000</span>
                    <span>₹{customDiscomThreshold.toLocaleString("en-IN")} (Cap)</span>
                    <span>₹48,000</span>
                    <span>₹72,000 (3x Cap)</span>
                    <span>₹90,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Verified Co-residing Jan Aadhaar Families at Meter:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
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

                <div className="pt-3 border-t flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Discom Segregated / Split Meter:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Discom installed separate individual meters
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isMeterSegregated}
                    onChange={(e) => setIsMeterSegregated(e.target.checked)}
                    className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                {deltaResult && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Next Month&apos;s Automated Evaluation
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                          deltaResult.isBenefitProtected
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {deltaResult.isBenefitProtected ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <ShieldAlert className="w-4 h-4" />
                        )}
                        {deltaResult.shieldStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border">
                        <span className="text-slate-500 block">Per-Family Share:</span>
                        <span className="text-xl font-mono font-black text-slate-900">
                          ₹{deltaResult.effectivePerFamilyShare.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border">
                        <span className="text-slate-500 block">Benefit State:</span>
                        <span
                          className={`text-sm font-bold ${
                            deltaResult.isBenefitProtected ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {deltaResult.isBenefitProtected
                            ? "DISBURSEMENT UNINTERRUPTED"
                            : "AUTO-FLAGGED FOR FRESH NOTICE"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                        deltaResult.isBenefitProtected
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                          : "bg-rose-50/60 border-rose-200 text-rose-900"
                      }`}
                    >
                      <p className="font-bold mb-1">Reasoning Engine Output:</p>
                      <p>{deltaResult.reasonHindi}</p>
                      <p className="mt-1 text-[11px] opacity-80">{deltaResult.reasonEnglish}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t text-[11px] text-slate-500 text-center font-medium">
                  Prevents recurring monthly harassment of genuine families while catching real consumption spikes automatically.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
