import Redis from "ioredis";
import { json } from "zod";

declare global {
  var __redisClient: Redis | undefined;
  var __redisLogged: boolean | undefined;
}

export function getRedisClient(): Redis {
  if (!global.__redisClient) {
    const client = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

    client.once("ready", () => {
      if (!global.__redisLogged) {
        console.log("Redis connected");
        global.__redisLogged = true;
      }
    });

    client.on("error", (err) => {
      console.error("Redis error", err);
    });

    global.__redisClient = client;
  }

  return global.__redisClient;
}

export type CacheValue = {
  value: string;
  max_views?: number | null;
  created_at: string;
  expires_at?: number | null;
};

class RedisService {
  private redis = getRedisClient();
  async set(
    key: string,
    value: string,
    options?: { ttl_seconds?: number; max_views?: number },
  ): Promise<{ existed: boolean }> {
    const expiresAt = options?.ttl_seconds
      ? Date.now() + options.ttl_seconds * 1000
      : null;

    const existingValue = await this.redis.hget(key, "value");

    if (existingValue === null) {
      await this.redis.hset(key, {
        value,
        max_views: options?.max_views ?? "",
        expires_at: expiresAt ?? "",
        created_at: new Date().toISOString(),
      });

      if (options?.ttl_seconds) {
        await this.redis.expire(key, options.ttl_seconds);
      }

      return { existed: false };
    }
    return { existed: true };
  }

  // we need to verify this only for touching purpose

  async get(key: string): Promise<Record<string, string> | null> {
    const data = await this.redis.hgetall(key);
    return data;
  }

  async update(key: string): Promise<number> {
    const remaining = await this.redis.hincrby(key, "max_views", -1);
    return remaining;
  }

  async del(key: string) {
    await this.redis.del(key);
  }
  async ping() {
    return this.redis.ping();
  }
}

declare global {
  var __redisService: RedisService | undefined;
}

export const redis =
  global.__redisService ?? (global.__redisService = new RedisService());
