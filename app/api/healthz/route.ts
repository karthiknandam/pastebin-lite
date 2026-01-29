import { redis } from "@/app/utils/redis";
import { NextResponse } from "next/server";

export async function GET() {
  let res = await redis.ping();
  if (res === "PONG") {
    return NextResponse.json(
      {
        success: true,
        message: "Server is running....",
      },
      { status: 200 },
    );
  }
  return NextResponse.json(
    {
      success: false,
      message: "Internal Server Error / Database error",
    },
    { status: 500 },
  );
}
