import { NextResponse } from "next/server";
import {
  runMultiFamilyGraphCheck,
  runVahanFootprintCheck,
  runMemberSplitGraphCheck,
  evaluateDeltaWatcherPredicate,
} from "@/lib/dispute-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "graph-check") {
      const { primaryJanAadhaar, coResidingJanAadhaars, simulateCollision, customThreshold } = body;
      const result = runMultiFamilyGraphCheck(
        primaryJanAadhaar || "4829103847",
        coResidingJanAadhaars || ["4829103848", "4829103849"],
        Boolean(simulateCollision),
        Number(customThreshold ?? 24000)
      );
      return NextResponse.json(result);
    }

    if (action === "vahan-check") {
      const { simulateFraud } = body;
      const result = runVahanFootprintCheck(Boolean(simulateFraud));
      return NextResponse.json(result);
    }

    if (action === "member-split-check") {
      const { simulateFraud } = body;
      const result = runMemberSplitGraphCheck(Boolean(simulateFraud));
      return NextResponse.json(result);
    }

    if (action === "delta-watcher") {
      const { nextMonthBill, linkedFamiliesCount, isMeterSegregated, customThreshold } = body;
      const result = evaluateDeltaWatcherPredicate(
        Number(nextMonthBill ?? 28500),
        Number(linkedFamiliesCount ?? 3),
        Boolean(isMeterSegregated),
        Number(customThreshold ?? 24000)
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Dispute verify API error:", error);
    return NextResponse.json(
      { error: "Internal server error processing dispute verification" },
      { status: 500 }
    );
  }
}
