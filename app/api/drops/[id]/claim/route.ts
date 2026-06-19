import { NextRequest, NextResponse } from "next/server";
import { claimDrop } from "@/lib/drops";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const result = await claimDrop(id, userId);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch {
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}