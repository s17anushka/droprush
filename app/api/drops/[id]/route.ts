import { NextRequest, NextResponse } from "next/server";
import { getDrop } from "@/lib/drops";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const drop = await getDrop(id);
    if (!drop) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ drop });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}