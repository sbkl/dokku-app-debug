import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Session } from "express-session";

export type MyContext = {
  prisma: PrismaClient;
  req: Request & { session: Session };
  res: Response;
};
