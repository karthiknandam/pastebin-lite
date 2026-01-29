import Redis from "ioredis";

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
  max_views?: number;
  created_at: string;
  ttl?: string | null;
};

class RedisService {
  private redis = getRedisClient();

  async set(
    key: string,
    value: string,
    options?: { ttl_seconds?: number; max_views?: number },
  ): Promise<{ existed: boolean }> {
    const payload: CacheValue = {
      value,
      max_views: options?.max_views,
      created_at: new Date().toISOString(),
    };

    const data = JSON.stringify(payload);

    const created = options?.ttl_seconds
      ? await this.redis.call("SET", key, data, "NX", "EX", options.ttl_seconds)
      : await this.redis.call("SET", key, data, "NX");

    return { existed: created !== "OK" };
  }

  async get(key: string): Promise<CacheValue | null> {
    const data = await this.redis.get(key);
    if (!data) return null;

    let parsed: CacheValue;
    try {
      parsed = JSON.parse(data);
    } catch {
      await this.redis.del(key);
      return null;
    }

    const ttl = await this.redis.ttl(key);
    parsed.ttl =
      ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null;

    if (typeof parsed.max_views === "number") {
      parsed.max_views -= 1;
      if (parsed.max_views <= 0) {
        await this.redis.del(key);
      } else {
        await this.redis.set(key, JSON.stringify(parsed));
      }
    }

    return parsed;
  }

  del(key: string) {
    return this.redis.del(key);
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
