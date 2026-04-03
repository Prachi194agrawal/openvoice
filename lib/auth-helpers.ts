import { auth } from "@/auth";
import { db } from "@/lib/prisma";

export async function getRequiredUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.isBlocked) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
