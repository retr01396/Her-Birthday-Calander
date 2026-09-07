import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}
