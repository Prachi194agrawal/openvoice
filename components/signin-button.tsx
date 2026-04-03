"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full">
      Continue with IIITM Google
    </Button>
  );
}
