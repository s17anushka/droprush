import { NextRequest, NextResponse } from "next/server";
import { createDrop, listDrops } from "@/lib/drops";

export async function GET() {
  try {
    return NextResponse.json({ drops: await listDrops() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, brand, description, price, imageUrl, totalStock, startTime } = await req.json();
    if (!name || !brand || !totalStock || !startTime) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const drop = await createDrop({ name, brand, description: description || "", price: price || 0, imageUrl: imageUrl || "", totalStock, startTime });
    return NextResponse.json({ drop }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}