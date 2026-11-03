"use client";

import React, { useState, useEffect } from "react";
import {
  SEEDED_CASES,
  ExclusionNoticeCase,
  MultiFamilyGraphResult,
  VahanFootprintResult,
  DeltaWatcherEvaluation,
} from "@/lib/dispute-engine";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Building2,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  UserCheck,
  ChevronRight,
  Sliders,
  Sparkles,
  Printer,
  Scale,
  Car,
  Zap,
} from "lucide-react";

export default function SmartDisputePoc() {
  const [selectedCaseKey, setSelectedCaseKey] = useState<string>("CASE_DISCOM_KAMLA");
  const [activeTab, setActiveTab] = useState<"intake" | "emitra" | "adjudication" | "delta">("intake");

  const currentCase: ExclusionNoticeCase = SEEDED_CASES[selectedCaseKey];

  // Tab 1 state
  const [isPlayingIvr, setIsPlayingIvr] = useState(false);

  // Tab 2 (e-Mitra) state
  const [selectedRebuttalId, setSelectedRebuttalId] = useState<string>(
    currentCase.allowedRebuttals[0]?.id || ""
  );
  const [simulateCollision, setSimulateCollision] = useState(false);
  const [simulateFraudVahan, setSimulateFraudVahan] = useState(false);
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [graphResult, setGraphResult] = useState<MultiFamilyGraphResult | null>(null);
  const [vahanResult, setVahanResult] = useState<VahanFootprintResult | null>(null);

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

  // Reset states when switching cases
  useEffect(() => {
    const c = SEEDED_CASES[selectedCaseKey];
    setSelectedRebuttalId(c.allowedRebuttals[0]?.id || "");
    setGraphResult(null);
    setVahanResult(null);
    setAdjudicationDecision(null);
    setIsPlayingIvr(false);

    if (c.ruleCode === "RULE_DISCOM_24K") {
      setNextMonthBill(28500);
      setLinkedFamilies(3);
      setIsMeterSegregated(false);
    }
  }, [selectedCaseKey]);

  // Trigger delta-watcher evaluation automatically when inputs change
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
  }, [nextMonthBill, linkedFamilies, isMeterSegregated]);

  // Execute Forensic Proof check
  const handleRunForensicProof = async () => {
    setIsVerifyingProof(true);
    try {
      if (currentCase.ruleCode === "RULE_DISCOM_24K") {
        const res = await fetch("/api/dispute-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "graph-check",
            primaryJanAadhaar: currentCase.janAadhaarId,
            coResidingJanAadhaars: ["4829103848", "4829103849"],
            simulateCollision,
          }),
        });
        const data = await res.json();
        setGraphResult(data);
      } else {
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
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Scenario Selector & System Architecture Seam */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Post-SMART Lifecycle Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Seam: SMART Outbound Webhook → Swaraj-Auto → Speaking Order
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Swaraj-Auto: Cross-Registry Dispute & Proof Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Automated show-cause cure windows, multi-family graph resolution, and tamper-proof evidence adjudication for algorithmic welfare exclusions in Rajasthan.
            </p>
          </div>

          {/* Scenario Switcher Pills */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 self-start lg:self-center">
            <button
              onClick={() => setSelectedCaseKey("CASE_DISCOM_KAMLA")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCaseKey === "CASE_DISCOM_KAMLA"
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Case 1: ₹24k Electricity Bill (Kamla Devi)
            </button>
            <button
              onClick={() => setSelectedCaseKey("CASE_VAHAN_RAMLAL")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCaseKey === "CASE_VAHAN_RAMLAL"
                  ? "bg-blue-500 text-white shadow-md font-black"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Case 2: Sold 4-Wheeler RC (Ram Lal Meena)
            </button>
          </div>
        </div>

        {/* Selected Case Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Case Docket ID:</span>
            <span className="font-mono font-bold text-white text-sm">{currentCase.caseId}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Beneficiary / Jan Aadhaar:</span>
            <span className="font-bold text-white text-sm">
              {currentCase.beneficiaryName} ({currentCase.janAadhaarId})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Tehsil & LGD Ward:</span>
            <span className="font-bold text-slate-200">
              {currentCase.tehsil}, {currentCase.district} (Ward #{currentCase.lgdWardCode})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Cure-Window Protection:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentCase.cureWindowDaysLeft} Days Remaining ({currentCase.cureWindowExpiryDate})
            </span>
          </div>
        </div>
      </div>

      {/* 4-Stage Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveTab("intake")}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "intake"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black">
            1
          </span>
          SMART Intake & Notice
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
            2
          </span>
          e-Mitra Kiosk & Proof Engine
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
            3
          </span>
          BDO / SDO Adjudication
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
            4
          </span>
          Live "Delta-Watcher" Simulator
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white rounded-b-xl rounded-tr-xl p-6 shadow-md border border-slate-100 min-h-[520px]">
        {/* ========================================================================= */}
        {/* TAB 1: SMART INTAKE & NOTICE ENGINE */}
        {/* ========================================================================= */}
        {activeTab === "intake" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
            {/* Left: Raw Inbound Webhook from SMART */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  SMART Outbound Webhook Ingestion
                </h3>
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  POST /v1/flags/ingest
                </span>
              </div>

              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                <p className="text-slate-500">// Inbound Exclusion Flag Record from Deloitte SMART Data Lake</p>
                <pre className="mt-2 text-emerald-400">
{`{
  "source_platform": "RAJ-SMART-DELOITTE-LAKE",
  "batch_run_id": "BATCH-2026-10-31-0941",
  "jan_aadhaar_id": "${currentCase.janAadhaarId}",
  "beneficiary_name": "${currentCase.beneficiaryName}",
  "scheme_code": "SSP-OLD-AGE-WIDOW",
  "disqualification_rule": "${currentCase.ruleCode}",
  "rule_metadata": {
    "flagged_value": "${currentCase.flaggedValue}",
    "statutory_limit": "${currentCase.thresholdValue}",
    "source_department": "${currentCase.sourceDepartment}"
  },
  "exclusion_action": "PROVISIONAL_FLAG_HOLD",
  "timestamp": "2026-10-31T09:41:22Z"
}`}
                </pre>
              </div>

              {/* Legal & Policy Anchor Callout */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">
                    Legal Principle of Natural Justice (Audi Alteram Partem)
                  </span>
                  As mandated by the Supreme Court in <i>S.Q. Masood v. State of Telangana (2022)</i>,
                  welfare benefits cannot be cancelled purely by automated machine algorithms without prior
                  notice, a 15-day cure window, and human speaking orders. Benefit disbursement is protected in escrow.
                </div>
              </div>
            </div>

            {/* Right: Phone Simulator (Hindi SMS + IVR Voice Call) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-primary" />
                  Assisted-First Notification Dispatch (Mobile / IVR)
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Status: Delivered
                </span>
              </div>

              {/* SMS Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    Official SMS (Sender: RJ-GOV-SSP)
                  </span>
                  <span>{currentCase.mobileNumberMasked}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed shadow-sm">
                  {currentCase.smsTranscriptHindi}
                </div>
              </div>

              {/* Automated Voice Call (IVR / OBD) Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    Automated Voice Call (Outbound Dial / 181 Rajasthan Helpline)
                  </span>
                  <span className="text-slate-400">Duration: 38 sec</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                  "{currentCase.ivrTranscriptHindi}"
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setIsPlayingIvr(!isPlayingIvr)}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow hover:bg-primary/90 transition"
                  >
                    {isPlayingIvr ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        Pause Audio Stream
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-3.5 h-3.5" />
                        Simulate Citizen Voice Call (Hindi OBD)
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    Zero smartphone dependency
                  </span>
                </div>
              </div>

              {/* Next Step Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("emitra")}
                  className="w-full py-3 bg-gradient-to-r from-blue-700 to-primary text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition flex items-center justify-center gap-2"
                >
                  Proceed to Step 2: Open Citizen Case in e-Mitra Kiosk Console
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: e-MITRA KIOSK CONSOLE & FORENSIC PROOF ENGINE */}
        {/* ========================================================================= */}
        {activeTab === "emitra" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* e-Mitra Plus Authentic Header */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
                  eM
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      Rajasthan e-Mitra Plus Operator Console
                    </h3>
                    <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                      Kiosk ID: EMITRA-JPR-0492
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Operator: Mohan Lal Sharma (Panchayat Samiti Bassi) | Biometric Device: Mantra MFS100 (Connected)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Case Inwarded via Jan Aadhaar</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {currentCase.janAadhaarId} (Biometric eKYC OK)
                </span>
              </div>
            </div>

            {/* Guided Rebuttal Selection (No free-text typing) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Rebuttal Options & Evidence Form */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Select Legally Grounded Rebuttal Category
                </h4>

                <div className="space-y-2.5">
                  {currentCase.allowedRebuttals.map((r) => (
                    <label
                      key={r.id}
                      onClick={() => setSelectedRebuttalId(r.id)}
                      className={`block p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                        selectedRebuttalId === r.id
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="rebuttal"
                          checked={selectedRebuttalId === r.id}
                          onChange={() => setSelectedRebuttalId(r.id)}
                          className="mt-0.5 text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm leading-snug">
                            {r.labelHindi}
                          </div>
                          <div className="text-slate-500 text-xs mt-1 font-sans">
                            {r.labelEnglish}
                          </div>
                          <div className="mt-2 text-primary font-medium bg-primary/10 px-2 py-1 rounded inline-block">
                            Required: {r.requiredEvidence}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Evidence Details Card */}
                {currentCase.ruleCode === "RULE_DISCOM_24K" ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <span className="font-bold text-slate-800 block">
                      Co-residing Jan Aadhaar Families Sharing Meter (K-No 21049201122):
                    </span>
                    <div className="space-y-1.5 font-mono">
                      <div className="p-2 bg-white rounded border flex justify-between items-center">
                        <span>Family 1 (Applicant): 4829103847</span>
                        <span className="text-emerald-600 font-bold">Kamla Devi</span>
                      </div>
                      <div className="p-2 bg-white rounded border flex justify-between items-center">
                        <span>Family 2 (Son): 4829103848</span>
                        <span className="text-slate-700 font-bold">Suresh Meena</span>
                      </div>
                      <div className="p-2 bg-white rounded border flex justify-between items-center">
                        <span>Family 3 (Son): 4829103849</span>
                        <span className="text-slate-700 font-bold">Mahesh Meena</span>
                      </div>
                    </div>

                    {/* Fraud Simulation Toggle for Presentation */}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <label className="text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateCollision}
                          onChange={(e) => setSimulateCollision(e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        Simulate Anti-Gaming Collision (Fraud Attempt)
                      </label>
                      <span className="text-[10px] text-slate-500">Test Edge Case</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <span className="font-bold text-slate-800 block">
                      Uploaded Transfer Documents (OCR Extracted):
                    </span>
                    <div className="p-2.5 bg-white rounded border space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Form 29/30 & Delivery Note:</span>
                        <span className="font-bold text-slate-800">Scanned & Validated</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vehicle:</span>
                        <span className="font-mono font-bold text-slate-800">Maruti Alto 800 (RJ-14-CC-4821)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Buyer Aadhaar/Mobile:</span>
                        <span className="font-mono text-slate-800">+91-98294-XXXXX (Sikar)</span>
                      </div>
                    </div>

                    {/* Fraud Simulation Toggle for Vahan */}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <label className="text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simulateFraudVahan}
                          onChange={(e) => setSimulateFraudVahan(e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        Simulate Backdated Stamp Paper (Fraud Attempt)
                      </label>
                      <span className="text-[10px] text-slate-500">Test Edge Case</span>
                    </div>
                  </div>
                )}

                <button
                  disabled={isVerifyingProof}
                  onClick={handleRunForensicProof}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow transition flex items-center justify-center gap-2"
                >
                  {isVerifyingProof ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running Cross-Registry Graph Engine...
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
                        Deterministic Forensics & Collision Proof Engine
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      Zero-Trust Algorithmic Attestation
                    </span>
                  </div>

                  {!graphResult && !vahanResult && !isVerifyingProof && (
                    <div className="py-20 text-center text-slate-400 text-sm">
                      <Scale className="w-10 h-10 mx-auto text-slate-600 mb-3 opacity-60" />
                      Click <b>"Run Swaraj-Auto Cross-Registry Proof Engine"</b> to execute multi-family lineage matching and anti-gaming checks.
                    </div>
                  )}

                  {isVerifyingProof && (
                    <div className="py-20 text-center text-slate-300 space-y-3">
                      <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
                      <p className="text-sm font-mono">Querying Jan Aadhaar Graph + Discom Meter Master...</p>
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
                          <span className="text-xs text-slate-400 block">Lineage Fuzzy Score:</span>
                          <span className="font-mono font-bold text-amber-400 text-base">
                            {(graphResult.lineageSimilarityScore * 100).toFixed(0)}% Match
                          </span>
                        </div>
                      </div>

                      {/* Detailed Proof points */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>
                            <b>Lineage & Address Match:</b> {graphResult.detailedProof.fatherHusbandLineageMatch}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          {graphResult.detailedProof.antiGamingCollisionPass ? (
                            <span className="text-emerald-400 font-bold">✓</span>
                          ) : (
                            <span className="text-rose-400 font-bold">✗</span>
                          )}
                          <span>
                            <b>State-wide Collision Ledger:</b>{" "}
                            {graphResult.detailedProof.antiGamingCollisionPass
                              ? "PASS (0 duplicate claims across Rajasthan on these Jan Aadhaar IDs)"
                              : graphResult.detailedProof.collisionDetails}
                          </span>
                        </div>
                      </div>

                      {/* Calculation Box */}
                      <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-300 block">Apportioned Annual Consumption:</span>
                          <span className="text-lg font-mono font-black text-emerald-400">
                            ₹{graphResult.totalAnnualBill.toLocaleString("en-IN")} ÷ {graphResult.verifiedFamilyCount} Families = ₹
                            {graphResult.apportionedBillPerFamily.toLocaleString("en-IN")} / family
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/40">
                          Within ₹24k Limit
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Case 2: Vahan Result Output */}
                  {vahanResult && !isVerifyingProof && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <div>
                          <span className="text-xs text-slate-400 block">Corroboration Status:</span>
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
                          <span className="font-mono font-bold text-emerald-400 text-base">
                            {(vahanResult.confidenceScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <p className="text-slate-300 leading-relaxed font-sans">
                          {vahanResult.telemetrySignals.explanationHindi}
                        </p>
                        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Buyer District:</span>
                            <span className="text-slate-200">{vahanResult.telemetrySignals.buyerDistrict}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">FASTag / Insurance Footprint:</span>
                            <span className="text-emerald-400">Buyer Mobile (+91-98294)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Handover to BDO Action */}
                <div className="pt-4 border-t border-slate-800 mt-4">
                  <button
                    onClick={() => setActiveTab("adjudication")}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-2"
                  >
                    Transmit Pre-Verified Docket to BDO / SDO Workbench
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BDO / SDO ADJUDICATION WORKBENCH */}
        {/* ========================================================================= */}
        {activeTab === "adjudication" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Appellate Authority Header */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-black text-base text-white">
                    Appellate Officer Workbench: Block Development Officer (BDO)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Designated First Appellate Authority under Rajasthan Jan-Aadhaar Authority Act, 2020 (Panchayat Samiti {currentCase.tehsil})
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Case ID</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{currentCase.caseId}</span>
              </div>
            </div>

            {/* Side-by-Side: SMART Algorithmic Flag vs Swaraj-Auto Verified Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-slate-700 text-sm block border-b pb-1">
                  1. Algorithmic Flag (Deloitte SMART Data Lake)
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exclusion Rule:</span>
                    <span className="font-bold text-slate-800">{currentCase.ruleCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Detected Value:</span>
                    <span className="font-bold text-rose-600">{currentCase.flaggedValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statutory Threshold:</span>
                    <span className="font-bold text-slate-800">{currentCase.thresholdValue}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-emerald-900 text-sm block border-b border-emerald-200 pb-1">
                  2. Swaraj-Auto Pre-Verified Rebuttal Proof
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Rebuttal Type:</span>
                    <span className="font-bold text-emerald-950">
                      {currentCase.ruleCode === "RULE_DISCOM_24K"
                        ? "Joint Family Shared Meter (3 Jan Aadhaar Families)"
                        : "Sold Vehicle (Un-transferred RC Verified)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Algorithmic Attestation:</span>
                    <span className="font-bold text-emerald-900">
                      {currentCase.ruleCode === "RULE_DISCOM_24K"
                        ? "94% Lineage Match | Zero Anti-Gaming Collisions"
                        : "98.4% Dispossession Confidence | FASTag Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Effective Assessment:</span>
                    <span className="font-bold text-emerald-950">
                      {currentCase.ruleCode === "RULE_DISCOM_24K"
                        ? "₹9,500 / family (< ₹24,000 PASS)"
                        : "No Material Benefit from Vehicle"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Action Bar (3 Choices) */}
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
                  Restore Benefit & Issue Predicate Shield
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
                  Dispatch VDO / Patwari Field Panchnama
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
                  Uphold Exclusion (Final Disqualification)
                </button>
              </div>
            </div>

            {/* Generated Official Speaking Order (कारण सहित आदेश) */}
            {adjudicationDecision && (
              <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-6 shadow-md animate-in fade-in space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-6 h-6 text-slate-800" />
                    <div>
                      <h4 className="font-black text-slate-900 text-base">
                        कार्यालय विकास अधिकारी, पंचायत समिति {currentCase.tehsil} (जयपुर ग्रामीण)
                      </h4>
                      <p className="text-xs text-slate-500">
                        न्यायिक अपील आदेश (Speaking Order under Section 19, Rajasthan Jan-Aadhaar Authority Act)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-white border px-3 py-1 rounded-md text-slate-700 font-bold">
                    Order Ref: ORD/{currentCase.caseId}/2026
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans space-y-2">
                  <p>
                    <b>विषय:</b> सामाजिक सुरक्षा पेंशन / खाद्य सुरक्षा पात्रता बहाली बाबत (केस: {currentCase.caseId})।
                  </p>
                  <p>
                    {adjudicationDecision === "APPROVED" && (
                      <>
                        आवेदक <b>{currentCase.beneficiaryName}</b> (जन-आधार: {currentCase.janAadhaarId}) द्वारा प्रस्तुत
                        साक्ष्यों एवं स्वराज-ऑटो क्रॉस-रजिस्ट्री सत्यापन रिपोर्ट का अवलोकन किया गया। पाया गया कि बिजली मीटर K-No {currentCase.flaggedValue} पर एक ही परिसर में 3 पृथक जन-आधार परिवार निवासरत हैं। प्रति परिवार वार्षिक हिस्सा ₹9,500 आता है जो निर्धारित सीमा ₹24,000 से कम है।
                        <br />
                        <br />
                        <b>आदेश:</b> अतः आवेदक की पेंशन तत्काल बहाल की जाती है तथा डाटा लेक में सशर्त प्रेडिकेट शील्ड (Predicate Exception Shield) जारी की जाती है।
                      </>
                    )}
                    {adjudicationDecision === "FIELD_VISIT" && (
                      <>
                        प्रस्तुत साक्ष्यों की स्थलीय पुष्टि हेतु ग्राम विकास अधिकारी (VDO) / पटवारी {currentCase.tehsil} को निर्देशित किया जाता है कि 7 कार्यदिवस में भौतिक पंचनामा रिपोर्ट प्रस्तुत करें। तब तक पेंशन सुरक्षित समीक्षा में रहेगी।
                      </>
                    )}
                    {adjudicationDecision === "REJECTED" && (
                      <>
                        जांच उपरांत प्रस्तुत साक्ष्य समाधानकारक नहीं पाए गए। अतः अपात्रता की संपुष्टि की जाती है। कारण सहित आदेश जन-आधार पोर्टल पर दर्ज किया गया।
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Digitally Signed via Raj e-Sign (BDO Bassi SSO: BDO.BASSI.01)
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
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE "DELTA-WATCHER" SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === "delta" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Explanatory Header */}
            <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block mb-1">
                  The #1 Moat: Stateful Exception Ledger
                </span>
                <h3 className="text-xl font-black text-white">
                  Live "Delta-Watcher" Next-Month Simulation
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Simulates what happens next month when SMART re-checks Discom: instead of blindly whitelisting the citizen for a year or re-excluding them, Swaraj-Auto dynamically evaluates the live bill against the verified formula!
                </p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-400 block">// Active Predicate Rule:</span>
                <span className="text-emerald-400 font-bold">
                  (Bill / Families) &lt; ₹24,000
                </span>
              </div>
            </div>

            {/* Interactive Sliders / Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Test Live Policy Variables
                </h4>

                {/* Slider: Next Month's Annual Bill */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Simulate Next Month's Discom Bill:</span>
                    <span className="font-mono font-black text-primary text-base">
                      ₹{nextMonthBill.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={12000}
                    max={90000}
                    step={2500}
                    value={nextMonthBill}
                    onChange={(e) => setNextMonthBill(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>₹12,000</span>
                    <span>₹24,000 (Limit)</span>
                    <span>₹48,000</span>
                    <span>₹72,000</span>
                    <span>₹90,000</span>
                  </div>
                </div>

                {/* Linked Families Count Selector */}
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

                {/* Meter Segregated Switch */}
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

              {/* Reactive Output Card */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                {deltaResult && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Next Month's Automated Evaluation
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
                        <span className="text-slate-500 block">Pension State:</span>
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
                  Prevents recurring harassment of genuine pensioners while ensuring fraud is immediately detected upon consumption spikes.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
