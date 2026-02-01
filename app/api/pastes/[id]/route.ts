import { CacheValue, redis } from "@/app/utils/redis";
import { NextRequest, NextResponse } from "next/server";
import { getNowMs } from "@/app/utils/helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id not found" },
        { status: 404 },
      );
    }

    // fetch data
    const data = (await redis.get(id)) as CacheValue | null;

    if (!data || !data.value) {
      return NextResponse.json(
        { success: false, message: "Data not found" },
        { status: 404 },
      );
    }

    // TTL check with header here as per tests
    if (data.expires_at) {
      const now = getNowMs(req);
      const expiresAt = Number(data.expires_at);

      if (!Number.isNaN(expiresAt) && now >= expiresAt) {
        await redis.del(id); // cleanup expired key
        return NextResponse.json(
          { success: false, message: "Expired" },
          { status: 404 },
        );
      }
    }

    // views handling
    let remainingViews: number | null = null;

    if (data.max_views) {
      const remaining = await redis.update(id);
      remainingViews = remaining;

      if (remaining < 0) {
        await redis.del(id);
        return NextResponse.json(
          { success: false, message: "Data not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          content: data.value,
          remaining_views: remainingViews,
          expires_at: data.expires_at
            ? new Date(Number(data.expires_at)).toISOString()
            : null,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
