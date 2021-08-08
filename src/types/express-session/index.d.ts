import { Session } from "express-session";
import { User } from "src/entity/User";

type UserSession = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  deactivatedAt: Date;
};

declare module "express-session" {
  export interface Session {
    userId: string;
  }
}
