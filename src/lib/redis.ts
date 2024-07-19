import Redis from "ioredis";
import env from "../env";

const REDIS_HOST = env.REDIS_HOST ?? "redis";
const redisClient = new Redis({ host: REDIS_HOST });

export default redisClient;
