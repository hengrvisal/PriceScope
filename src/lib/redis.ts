import IORedis, { Redis } from "ioredis";
import { env } from "./env";

const globalForRedis = globalThis as unknown as { redis?: Redis };

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL is required to use the queue/worker");
}

export const redis: Redis =
  globalForRedis.redis ??
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
