const redis = require("redis");
require("dotenv").config();

const redisEnabled =
  process.env.REDIS_ENABLED === "true" || process.env.REDIS_ENABLED === "1";

let client = null;

if (redisEnabled) {
  client = redis.createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  });

  let loggedError = false;
  client.on("error", (err) => {
    if (!loggedError) {
      console.log("Redis Client Error:", err.message);
      loggedError = true;
    }
  });

  (async () => {
    try {
      await client.connect();
      console.log("redis connection established");
    } catch (err) {
      console.log("redis not connected:", err.message);
    }
  })();
} else {
  console.log("redis disabled (set REDIS_ENABLED=true in .env to enable)");
}

async function blacklistToken(token, ttlSeconds = 60 * 60) {
  if (!client?.isReady || !token) return false;
  await client.setEx(String(token), ttlSeconds, "true");
  return true;
}

module.exports = { client, blacklistToken };
