"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/components/ui/utils";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";

// Types
type RecordStatus = "STATUS_AUTO_APPROVE" | "STATUS_FIELD_VERIFICATION" | "STATUS_REJECTED";

interface ProcessResult {
  id: string | number;
  name: string;
  tehsil: string;
  status: RecordStatus;
  reason: string;
  match_score?: number;
}

export default function Dashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ProcessResult | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "deployment">("dashboard");
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results]);

  const handleLaunch = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    // Generate 50 dummy applications to send to the backend for real batch processing
    const first_names = ["Ramesh", "Suresh", "Ram", "Shyam", "Geeta", "Sita", "Govind", "Sunita", "Anita", "Om"];
    const last_names = ["Kumar", "Sharma", "Singh", "Yadav", "Devi", "Meena", "Jat"];
    const tehsils = ["Bassi", "Phagi", "Jamwa Ramgarh"];

    // Known valid records from master data
    const validRecords = [
        { name: "Om Devi", father_name: "Geeta Jat", tehsil: "Bassi" },
        { name: "Govind Meena", father_name: "Govind Yadav", tehsil: "Jamwa Ramgarh" },
        { name: "Sunita Jat", father_name: "Om Kumar", tehsil: "Bassi" },
        { name: "Anita Devi", father_name: "Sunita Devi", tehsil: "Jamwa Ramgarh" },
        { name: "Govind Sharma", father_name: "Suresh Devi", tehsil: "Bassi" },
        { name: "Govind Yadav", father_name: "Shyam Sharma", tehsil: "Bassi" },
        { name: "Anita Meena", father_name: "Ramesh Meena", tehsil: "Phagi" },
        { name: "Anita Meena", father_name: "Suresh Singh", tehsil: "Bassi" },
        { name: "Om Devi", father_name: "Ram Devi", tehsil: "Jamwa Ramgarh" },
        { name: "Anita Kumar", father_name: "Geeta Jat", tehsil: "Jamwa Ramgarh" },
        { name: "Om Sharma", father_name: "Govind Singh", tehsil: "Phagi" },
        { name: "Anita Kumar", father_name: "Sita Meena", tehsil: "Jamwa Ramgarh" },
        { name: "Shyam Yadav", father_name: "Sita Sharma", tehsil: "Phagi" },
        { name: "Shyam Sharma", father_name: "Om Sharma", tehsil: "Jamwa Ramgarh" },
        { name: "Anita Sharma", father_name: "Anita Jat", tehsil: "Phagi" },
        { name: "Om Devi", father_name: "Om Yadav", tehsil: "Bassi" },
        { name: "Govind Devi", father_name: "Sunita Singh", tehsil: "Phagi" },
        { name: "Suresh Kumar", father_name: "Govind Sharma", tehsil: "Bassi" }
    ];

    const applications = Array.from({ length: 50 }).map((_, i) => {
        let base_first = first_names[Math.floor(Math.random() * first_names.length)];
        let base_last = last_names[Math.floor(Math.random() * last_names.length)];
        let father_name = first_names[Math.floor(Math.random() * first_names.length)] + " " + last_names[Math.floor(Math.random() * last_names.length)];
        let tehsil = tehsils[Math.floor(Math.random() * tehsils.length)];
        
        let name = `${base_first} ${base_last}`;
        let income = 150000;
        let land_holding_ha = 1.0;

        const rand = Math.random();
        if (rand < 0.85) {
           // Provide perfect match data implicitly by pulling from validRecords
           const validRecord = validRecords[Math.floor(Math.random() * validRecords.length)];
           name = validRecord.name;
           father_name = validRecord.father_name;
           tehsil = validRecord.tehsil;
        } else if (rand < 0.95) {
           // Provide fuzzy match data (slightly altering a valid record)
           const validRecord = validRecords[Math.floor(Math.random() * validRecords.length)];
           name = validRecord.name.split(" ")[0]; // Only first name -> fuzzy match
           father_name = validRecord.father_name;
           tehsil = validRecord.tehsil;
        } else {
           // Provide ineligible data
           income = 250000;
        }

        return {
            id: `APP-2026-${1000 + i}`,
            name,
            father_name,
            tehsil,
            income,
            land_holding_ha
        };
    });

    try {
        const response = await fetch('/api/check-eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applications)
        });

        if (!response.ok) {
            console.error("Failed to process batch");
            setIsProcessing(false);
            return;
        }

        const batchResults: ProcessResult[] = await response.json();

        for (let i = 0; i < batchResults.length; i++) {
            await new Promise(res => setTimeout(res, 80)); // simulate UI processing delay
            setResults(prev => [...prev, batchResults[i]]);
            setProgress(Math.round(((i + 1) / batchResults.length) * 100));
        }
    } catch (error) {
        console.error("Error calling batch process API:", error);
    }

    setIsProcessing(false);
  };

  const getStatusIcon = (status: RecordStatus) => {
      switch (status) {
          case "STATUS_AUTO_APPROVE": return <CheckCircle2 className="text-green-600 h-5 w-5" />;
          case "STATUS_FIELD_VERIFICATION": return <AlertTriangle className="text-yellow-500 h-5 w-5" />;
          case "STATUS_REJECTED": return <XCircle className="text-red-500 h-5 w-5" />;
      }
  };

  const getStatusChip = (status: RecordStatus) => {
       switch (status) {
          case "STATUS_AUTO_APPROVE": return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium border border-green-200">Auto Approve</span>;
          case "STATUS_FIELD_VERIFICATION": return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium border border-yellow-200">Field Verify</span>;
          case "STATUS_REJECTED": return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium border border-red-200">Rejected</span>;
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-primary text-primary-foreground shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-secondary-foreground shadow-sm">
                SA
            </div>
            <div>
                <h1 className="text-xl font-bold">Swaraj-Auto / स्वराज-ऑटो</h1>
                <p className="text-sm opacity-90 pl-1 tracking-wide font-medium">Jaipur Rural Pilot Dashboard</p>
            </div>
        </div>
        <nav className="flex gap-4">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={cn("px-4 py-2 font-semibold transition-colors border-b-2", activeTab === "dashboard" ? "border-secondary text-white" : "border-transparent text-primary-foreground/70 hover:text-white")}
            >
                Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("deployment")}
              className={cn("px-4 py-2 font-semibold transition-colors border-b-2", activeTab === "deployment" ? "border-secondary text-white" : "border-transparent text-primary-foreground/70 hover:text-white")}
            >
                Deployment Info
            </button>
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === "deployment" ? (
            <div className="bg-white rounded-2xl shadow-lg border p-10 max-w-4xl mx-auto mt-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Deployment Checklist</h2>
                <div className="space-y-8">
                    <div className="flex gap-5 items-start">
                        <CheckCircle2 className="text-green-500 mt-1 w-6 h-6 shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">RSDC Dockerization</h3>
                            <p className="text-slate-600 mt-2 leading-relaxed">Application containerized and deployed on Rajasthan State Data Centre (RSDC) infrastructure ensuring data localization constraints are met.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 items-start">
                        <CheckCircle2 className="text-green-500 mt-1 w-6 h-6 shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">iStart Green Channel Eligibility</h3>
                            <p className="text-slate-600 mt-2 leading-relaxed">Evaluated and approved under the iStart framework. Fast-tracked procurement process applicable.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 items-start">
                        <CheckCircle2 className="text-green-500 mt-1 w-6 h-6 shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">API Setu Compliance</h3>
                            <p className="text-slate-600 mt-2 leading-relaxed">Integration with NDHM and standard Rajasthan government APIs aligns with API Setu (Open API policy) requirements for robust data exchange.</p>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Actions & Feed */}
                <div className="lg:col-span-1 space-y-8 flex flex-col h-[calc(100vh-140px)]">
                    <div className="bg-white p-8 rounded-2xl shadow-md border text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
                        <div className="relative">
                            <button
                                disabled={isProcessing}
                                onClick={handleLaunch}
                                className={cn(
                                    "w-full py-5 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex justify-center items-center gap-2 relative overflow-hidden",
                                    isProcessing ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-primary to-blue-800 text-white hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0"
                                )}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        Processing Batch...
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                        Launch Swaraj-Auto Batch Processing
                                    </>
                                )}
                            </button>
                            
                            {(isProcessing || results.length > 0) && (
                                <div className="mt-8 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex justify-between text-sm mb-2 text-slate-700 font-bold tracking-wide">
                                        <span>BATCH PROGRESS</span>
                                        <span className="text-primary">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200 shadow-inner">
                                        <div 
                                            className="bg-gradient-to-r from-secondary to-yellow-300 h-4 rounded-full transition-all duration-300 ease-out relative"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_ease-in-out_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border overflow-hidden flex flex-col flex-1">
                        <div className="p-5 bg-gradient-to-b from-slate-50 to-white font-bold text-slate-800 flex items-center justify-between border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                Live Feed
                            </div>
                            <span className="text-xs bg-slate-800 text-white px-3 py-1 rounded-full">{results.length} / 50</span>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/50 relative">
                            {results.length === 0 && !isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic text-sm">
                                    System armed. Ready to process batch...
                                </div>
                            )}
                            {results.map((r, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm flex gap-3 animate-in slide-in-from-right-4 fade-in duration-300 hover:shadow-md transition-shadow">
                                    <div className="mt-0.5 flex-shrink-0">
                                        {getStatusIcon(r.status)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-800 truncate text-base">
                                            {r.status === 'STATUS_AUTO_APPROVE' && "Approved"}
                                            {r.status === 'STATUS_FIELD_VERIFICATION' && "Flagged for Verification"}
                                            {r.status === 'STATUS_REJECTED' && "Rejected"} 
                                            {" "}<span className="font-bold text-primary">{r.name}</span> in {r.tehsil}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">{r.id}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={feedEndRef} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Triage Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                    <div className="p-6 border-b flex justify-between items-center bg-gradient-to-b from-slate-50 to-white">
                        <h2 className="text-2xl font-bold text-slate-800">Triage Summary</h2>
                        <div className="flex gap-6 text-sm font-bold bg-white px-4 py-2 rounded-lg border shadow-sm">
                            <span className="text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> {results.filter(r => r.status === 'STATUS_AUTO_APPROVE').length}</span>
                            <span className="text-yellow-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {results.filter(r => r.status === 'STATUS_FIELD_VERIFICATION').length}</span>
                            <span className="text-red-600 flex items-center gap-2"><XCircle className="w-4 h-4"/> {results.filter(r => r.status === 'STATUS_REJECTED').length}</span>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto flex-1 p-2">
                        <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                            <thead className="text-xs text-slate-500 uppercase sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-6 py-4 font-bold border-b">App ID</th>
                                    <th className="px-6 py-4 font-bold border-b">Applicant Data</th>
                                    <th className="px-6 py-4 font-bold border-b">Decision</th>
                                    <th className="px-6 py-4 font-bold border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic font-medium">Awaiting execution of the batch processor.</td>
                                    </tr>
                                )}
                                {results.map((r, i) => (
                                    <tr key={i} onClick={() => setSelectedRecord(r)} className="bg-white hover:bg-slate-50 cursor-pointer transition-colors group shadow-sm border border-slate-100 rounded-lg">
                                        <td className="px-6 py-5 font-mono text-slate-500 rounded-l-lg border-y border-l border-slate-100 group-hover:border-slate-200">{r.id}</td>
                                        <td className="px-6 py-5 border-y border-slate-100 group-hover:border-slate-200">
                                            <div className="font-bold text-slate-800 text-base">{r.name}</div>
                                            <div className="text-slate-500 text-xs mt-1 font-medium">{r.tehsil}</div>
                                        </td>
                                        <td className="px-6 py-5 border-y border-slate-100 group-hover:border-slate-200">
                                            {getStatusChip(r.status)}
                                        </td>
                                        <td className="px-6 py-5 rounded-r-lg border-y border-r border-slate-100 group-hover:border-slate-200">
                                            <button className="bg-primary/5 text-primary px-3 py-1.5 rounded-md text-xs font-bold hover:bg-primary/10 transition-colors flex items-center group-hover:shadow-sm">
                                                View Logic <ChevronRight className="w-3 h-3 ml-1" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Logic Trail Drawer / Sidebar Overlay */}
      {selectedRecord && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRecord(null)}></div>
              <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col">
                  <div className="p-8 border-b bg-gradient-to-br from-slate-50 to-white relative">
                      <div className="absolute top-0 right-0 p-6">
                            <button onClick={() => setSelectedRecord(null)} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition shadow-sm border">
                                <XCircle className="w-6 h-6" />
                            </button>
                      </div>
                      <p className="text-xs font-black text-secondary tracking-widest uppercase mb-2">Reasoning Trail</p>
                      <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedRecord.name}</h3>
                      <p className="text-primary font-mono mt-2 font-semibold bg-primary/5 inline-block px-3 py-1 rounded-md">{selectedRecord.id}</p>
                  </div>
                  <div className="p-8 flex-1 overflow-y-auto bg-slate-50">
                      <div className="space-y-10 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                          
                          {/* Step 1: Data Retrieval */}
                          <div className="relative flex items-start gap-6">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center z-10 shrink-0 border-4 border-slate-100 shadow-sm font-black text-slate-500">1</div>
                              <div className="bg-white p-5 rounded-xl shadow-sm border w-full">
                                  <h4 className="font-bold text-slate-800 text-lg">Master Data Retrieved</h4>
                                  <p className="text-sm text-slate-600 mt-2 font-medium">Cross-referenced with Jaipur Rural (<span className="text-primary font-bold">{selectedRecord.tehsil}</span>) registry.</p>
                              </div>
                          </div>

                          {/* Step 2: Model Assessment */}
                          <div className="relative flex items-start gap-6">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center z-10 shrink-0 border-4 border-slate-100 shadow-sm font-black text-slate-500">2</div>
                              <div className="bg-white p-5 rounded-xl shadow-sm border w-full">
                                  <h4 className="font-bold text-slate-800 text-lg">Identity Resolution</h4>
                                  {selectedRecord.match_score !== undefined ? (
                                      <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-slate-500">RapidFuzz Match Score</span> 
                                              <span className="font-mono font-black text-primary text-lg">{(selectedRecord.match_score * 100).toFixed(1)}%</span>
                                          </div>
                                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={cn("h-2 rounded-full", selectedRecord.match_score >= 0.95 ? "bg-green-500" : "bg-yellow-500")}
                                                style={{ width: `${selectedRecord.match_score * 100}%` }}
                                            ></div>
                                        </div>
                                      </div>
                                  ) : (
                                      <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium flex items-center gap-2">
                                          <XCircle className="w-4 h-4 shrink-0" />
                                          Skipped due to prior eligibility failure.
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Step 3: Final Decision */}
                          <div className="relative flex items-start gap-6">
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center z-10 shrink-0 border-4 border-slate-100 shadow-md text-white">
                                  <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/20 w-full relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
                                  <h4 className="font-bold text-slate-800 text-lg">Rule-engine Verdict</h4>
                                  <div className="mt-4">
                                      {getStatusChip(selectedRecord.status)}
                                  </div>
                                  <div className="mt-4 p-4 bg-slate-50/80 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed font-semibold">
                                      {selectedRecord.reason}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
