import { Request, Response } from "express";
import session from "express-session";
import Redis from "ioredis";
import { createUpdootLoader } from "./utils/createUpdootLoader";

export type MyContext = {
  req: Request & {
    session: session.Session & Partial<session.SessionData> & { userId?: any };
  };
  res: Response;
  redis: Redis.Redis;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
