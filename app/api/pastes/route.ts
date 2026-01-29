import { generateHash } from "@/app/utils/hashGenerator";
import { redis } from "@/app/utils/redis";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

let url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const pastesSchema = z.object({
  content: z
    .string({
      error: "content must be text",
    })
    .min(1, "content should not be empty")
    .max(100_000, "content is too large"),

  ttl_seconds: z
    .number()
    .min(1, { error: "expiration time must be >=1 sec" })
    .optional(),
  max_views: z.number().min(1, { error: "max_views must be >=1" }).optional(),
});
export async function POST(req: NextRequest) {
  try {
    const _data = pastesSchema.safeParse(await req.json());

    if (!_data.success) {
      return NextResponse.json(
        {
          success: false,
          error: _data.error.issues,
        },
        { status: 400 },
      );
    }

    const id = generateHash();

    const { content, max_views, ttl_seconds } = _data.data;
    // set the redis instance and get back the data here;

    const result = await redis.set(id, content, {
      max_views,
      ttl_seconds,
    });

    if (result.existed) {
      return NextResponse.json({
        success: false,
        error: "Hash already set please try again",
      });
    }

    return NextResponse.json(
      {
        success: true,
        id,
        url: `${url}/p/${id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
