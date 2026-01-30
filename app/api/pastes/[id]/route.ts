import { redis } from "@/app/utils/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    let param = await params;
    let id = param.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id not found" },
        { status: 404 },
      );
    }

    let data = await redis.get(id);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Data not found",
        },
        { status: 404 },
      );
    }

    let res = {
      content: data.value,
      remaining_views: data?.max_views || null,
      expires_at: data?.ttl,
    };

    return NextResponse.json(
      {
        success: true,
        data: res,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
