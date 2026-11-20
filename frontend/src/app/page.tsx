"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";
import { CheckCircle2, Shield } from "lucide-react";
import SmartDisputePoc from "@/components/SmartDisputePoc";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"poc_v2" | "deployment">("poc_v2");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Header with Platform Switcher */}
      <header className="bg-slate-950 text-white shadow-lg px-6 py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-md">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">Swaraj-Auto / स्वराज-ऑटो</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                iStart Incubated (Techno Hub)
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-medium">
              Post-SMART Welfare Dispute Resolution &amp; Cross-Registry Proof Engine
            </p>
          </div>
        </div>

        {/* Mode Switcher Nav */}
        <nav className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView("poc_v2")}
            className={cn(
              "px-3.5 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5",
              activeView === "poc_v2"
                ? "bg-primary text-white shadow-md"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            PoC v2: SMART Dispute Engine
          </button>
          <button
            onClick={() => setActiveView("deployment")}
            className={cn(
              "px-3 py-1.5 font-medium rounded-lg transition-all",
              activeView === "deployment"
                ? "bg-slate-800 text-white border border-slate-700 font-bold"
                : "text-slate-400 hover:text-white"
            )}
          >
            Deployment Info
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeView === "poc_v2" ? (
          <SmartDisputePoc />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border p-10 max-w-4xl mx-auto mt-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Deployment Checklist</h2>
            <div className="space-y-8">
              <div className="flex gap-5 items-start">
                <CheckCircle2 className="text-green-500 mt-1 w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800">RSDC Dockerization</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">
                    Application containerized and deployed on Rajasthan State Data Centre (RSDC) infrastructure
                    ensuring data localization constraints are met.
                  </p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <CheckCircle2 className="text-green-500 mt-1 w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800">iStart Green Channel Eligibility</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">
                    Evaluated and approved under the iStart framework. Fast-tracked procurement process applicable
                    under RTPP Rule 19B / Section 5G.
                  </p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <CheckCircle2 className="text-green-500 mt-1 w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800">RajSewaDwar &amp; API Setu Compliance</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">
                    Logical Service Namespaces (RajSewaDwar &amp; Central API Setu / DFPD) align with open API
                    governance and deterministic Jan Aadhaar 2.0 integration standards for live RSDC onboarding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
