import { NextResponse } from "next/server";
import { SIMULATIONS_CATALOG } from "@/lib/simulationsData";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    count: SIMULATIONS_CATALOG.length,
    simulations: SIMULATIONS_CATALOG,
  });
}
