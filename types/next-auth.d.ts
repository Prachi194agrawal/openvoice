import "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isBlocked: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
