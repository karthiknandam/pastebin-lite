import { NextRequest } from "next/server";

export function getNowMs(req: NextRequest): number {
  if (process.env.TEST_MODE === "1") {
    const header = req.headers.get("x-test-now-ms");
    if (header) {
      const parsed = Number(header);
      if (!Number.isNaN(parsed)) {
        return parsed; // absolute ms since epoch
      }
    }
  }
  return Date.now();
}
