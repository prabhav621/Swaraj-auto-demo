"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { cn } from "@/components/ui/utils";
import { CheckCircle2, Shield, Database, X } from "lucide-react";
import SmartDisputePoc from "@/components/SmartDisputePoc";
import { DATA_ENDPOINTS_CATALOG } from "@/lib/dispute-engine";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"sovereign_engine" | "deployment">("sovereign_engine");
  const databasesDialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogTitleId = useId();

  const openDatabasesModal = () => {
    const dialog = databasesDialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  };

  // Fallback for browsers without native <dialog closedby="any"> support (modern-web-guidance: light-dismiss-a-dialog)
  useEffect(() => {
    const dialog = databasesDialogRef.current;
    if (!dialog || typeof HTMLDialogElement === "undefined") return;

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };

      dialog.addEventListener("click", handleBackdropClick);
      return () => dialog.removeEventListener("click", handleBackdropClick);
    }
  }, []);

  const stateDatabases = DATA_ENDPOINTS_CATALOG.filter((ep) => ep.tier === "STATE_RAJ_SEWA_DWAAR");
  const centralDatabases = DATA_ENDPOINTS_CATALOG.filter((ep) => ep.tier === "CENTRAL_API_SETU_DFPD");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Compact Single-Row Government Portal Header (< 12% viewport height) */}
      <header className="bg-slate-950 text-white shadow-sm px-4 sm:px-6 py-2.5 flex flex-wrap justify-between items-center gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-black text-sm text-white shrink-0">
            SA
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-black tracking-tight">Swaraj-Auto · स्वराज-ऑटो</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                iStart Rajasthan Startup
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Welfare Eligibility Verification &amp; Citizen Due-Process Portal · Rajasthan State Data Centre (RSDC)
            </p>
          </div>
        </div>

        {/* Compact Top Navigation Actions */}
        <nav aria-label="Primary Portal Views" className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveView("sovereign_engine")}
            className={cn(
              "px-3 py-1.5 font-bold rounded-lg transition flex items-center gap-1.5",
              activeView === "sovereign_engine"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            5-Stage Workflow
          </button>

          <button
            type="button"
            onClick={openDatabasesModal}
            className="px-3 py-1.5 font-bold rounded-lg text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            12 Connected Databases
          </button>

          <button
            type="button"
            onClick={() => setActiveView("deployment")}
            className={cn(
              "px-3 py-1.5 font-bold rounded-lg transition",
              activeView === "deployment"
                ? "bg-slate-800 text-white border border-slate-600"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            )}
          >
            Pilot &amp; Procurement
          </button>
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeView === "sovereign_engine" ? (
          <SmartDisputePoc onOpenDatabasesModal={openDatabasesModal} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 max-w-4xl mx-auto mt-2 animate-in fade-in duration-300">
            <h1 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-200 pb-4">
              State Hosting &amp; iStart Rajasthan Pilot Procurement
            </h1>
            <div className="space-y-6 text-sm">
              <div className="flex gap-4 items-start">
                <CheckCircle2 className="text-emerald-600 mt-0.5 w-5 h-5 shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    100% Hosted Inside Rajasthan State Data Centre (RSDC)
                  </h2>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Swaraj-Auto runs entirely inside Rajasthan&apos;s own State Data Centre alongside Jan Aadhaar 2.0, RajSewaDwar, and Project SMART. Citizen family and welfare records never leave government servers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <CheckCircle2 className="text-emerald-600 mt-0.5 w-5 h-5 shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Sanctioned iStart Procurement Routes (RTPP Rules, 2013)
                  </h2>
                  <div className="text-slate-600 mt-1.5 leading-relaxed space-y-2">
                    <p>
                      <strong className="text-slate-900">Direct Startup Pilot Work Order:</strong>{" "}
                      Under <strong>RTPP Rules, 2013 — Rule 32</strong> (Finance Department Notification G.S.R. 143 dated 17.03.2023), departments can issue direct pilot work orders up to <strong>₹25 Lakhs (inclusive of taxes)</strong> via <strong>iStart QRate</strong> and <strong>iStart eBazaar</strong>.
                    </p>
                    <p>
                      <strong className="text-slate-900">System-Integrator Scale-Up Route:</strong>{" "}
                      Under <strong>RTPP Rules, 2013 — Rule 36(3)(ff)</strong> (Notification G.S.R. 98), Swaraj-Auto can also be integrated as an iStart startup module alongside <strong>Project SMART</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <CheckCircle2 className="text-emerald-600 mt-0.5 w-5 h-5 shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Standard RajSewaDwar &amp; Central API Setu Integration
                  </h2>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Connects cleanly to 7 Rajasthan state registries over RajSewaDwar and 5 Central Government registries over API Setu / Food Ministry feeds using standard government API credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Light-Dismiss Modal Dialog for the 12 Connected Government Databases */}
      <dialog
        ref={databasesDialogRef}
        {...({ closedby: "any" } as React.HTMLAttributes<HTMLDialogElement>)}
        aria-labelledby={dialogTitleId}
        className="w-[calc(100%-2rem)] max-w-5xl rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl"
      >
        <div className="p-5 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                Cross-Department Verification Network
              </span>
              <h1 id={dialogTitleId} className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                12 Connected Government Databases (7 State · 5 Central)
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Swaraj-Auto cross-checks household eligibility and citizen explanations across these 12 official government registries inside RSDC. Click outside this window or press Esc to close.
              </p>
            </div>

            <form method="dialog">
              <button
                type="submit"
                autoFocus
                ref={(el) => el?.setAttribute("autofocus", "")}
                aria-label="Close connected databases dialog"
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Close
              </button>
            </form>
          </div>

          {/* 7 Rajasthan State Databases */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg inline-block">
              7 Rajasthan State Databases (Connected via RajSewaDwar)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {stateDatabases.map((ep) => (
                <div key={ep.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <span className="font-bold text-slate-900 block text-sm">{ep.displayName}</span>
                  <span className="text-[11px] font-semibold text-primary block">{ep.department}</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">{ep.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Central Government Databases */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg inline-block">
              5 Central Government Databases (Connected via API Setu &amp; Food Ministry)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {centralDatabases.map((ep) => (
                <div key={ep.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <span className="font-bold text-slate-900 block text-sm">{ep.displayName}</span>
                  <span className="text-[11px] font-semibold text-primary block">{ep.department}</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">{ep.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
