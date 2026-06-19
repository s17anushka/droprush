import { NextResponse } from "next/server";
import { listDrops } from "@/lib/drops";

export async function GET() {
  try {
    return NextResponse.json({ drops: await listDrops() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}