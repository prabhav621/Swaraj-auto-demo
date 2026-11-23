"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";
import { CheckCircle2, Shield } from "lucide-react";
import SmartDisputePoc from "@/components/SmartDisputePoc";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"sovereign_engine" | "deployment">("sovereign_engine");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Header with View Switcher */}
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
              Swaraj-Auto (स्वराज-ऑटो): Unified Sovereign Welfare Exclusion &amp; Due-Process Engine (RSDC · Jan Aadhaar 2.0 · RajSewaDwar · Project SMART)
            </p>
          </div>
        </div>

        {/* Top View Navigation */}
        <nav className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView("sovereign_engine")}
            className={cn(
              "px-3.5 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1.5",
              activeView === "sovereign_engine"
                ? "bg-primary text-white shadow-md"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            5-Stage Sovereign Engine
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
        {activeView === "sovereign_engine" ? (
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
                    Application containerized and deployed inside Rajasthan State Data Centre (RSDC) infrastructure
                    atop Jan Aadhaar 2.0, RajSewaDwar, and Project SMART, ensuring strict data localization.
                  </p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <CheckCircle2 className="text-green-500 mt-1 w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    iStart Rajasthan Procurement Compliance (RTPP Rules, 2013)
                  </h3>
                  <div className="text-slate-600 mt-2 leading-relaxed space-y-2">
                    <p>
                      <strong className="text-slate-800">Primary Direct Pilot Route:</strong>{" "}
                      <span className="font-semibold text-slate-900">
                        RTPP Rules, 2013: Rule 32 (Finance Dept Notification G.S.R. 143 dated 17.03.2023)
                      </span>{" "}
                      — Direct pilot work orders up to <strong>₹25 Lakhs (inclusive of taxes)</strong> via{" "}
                      <strong>iStart QRate</strong> &amp; <strong>iStart eBazaar</strong>.
                    </p>
                    <p>
                      <strong className="text-slate-800">Scale-Up Subcontracting Option:</strong>{" "}
                      <span className="font-semibold text-slate-900">
                        RTPP Rules, 2013: Rule 36(3)(ff) (Notification G.S.R. 98)
                      </span>{" "}
                      — Startup integration alongside <strong>Project SMART</strong>.
                    </p>
                  </div>
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
