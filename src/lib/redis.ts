import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

const globalForRedis = globalThis as unknown as {
  redis?: RedisClient;
};

function createRedisClient(): RedisClient {
  const client = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    // Fail fast instead of queueing commands indefinitely when Redis is down,
    // so pages never hang waiting on a dead connection.
    disableOfflineQueue: true,
    socket: {
      reconnectStrategy(retries) {
        // Give up after ~1 minute of failed reconnection attempts.
        if (retries > 10) return new Error("Redis connection lost");
        return Math.min(retries * 200, 2000);
      },
    },
  });
  client.on("error", (err) => {
    console.error("[redis] client error:", err.message);
  });
  return client as unknown as RedisClient;
}

export const redis: RedisClient = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/**
 * Run a Redis command, ensuring the client is connected first.
 * Throws immediately if Redis cannot be reached.
 */
export async function redisCmd<T>(
  fn: (client: RedisClient) => Promise<T>
): Promise<T> {
  if (!redis.isReady) {
    if (!redis.isOpen) {
      await redis.connect().catch((err) => {
        console.error("[redis] connection failed:", err.message);
      });
    }
    if (!redis.isReady) {
      throw new Error("Redis is not available");
    }
  }
  return fn(redis);
}
