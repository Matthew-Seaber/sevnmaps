import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const hdrs = await headers();
  
  return NextResponse.json(hdrs.get("x-vercel-ip-country") || "US");
}
