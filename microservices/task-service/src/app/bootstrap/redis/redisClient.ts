
import { createClient } from "redis";

export const redis = createClient({
    url: process.env.REDIS_URL ?? "redis://redis-cache:6379",
});

redis.on('connection', (stream) => {
  console.log('connected to redis');
});

redis.on("error", (err) => {
    console.error("Redis Error:", err);
});


redis.on("reconnecting", () => {
  console.log("🔄 Reconnecting to Redis...");
});

