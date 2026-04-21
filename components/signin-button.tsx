"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  return (
    <div className="space-y-4">
      <Button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(34,211,238,0.4)]"
      >
        <LogIn className="mr-2 size-4" />
        Signup with Google
      </Button>

      <p className="text-xs text-muted-foreground">
        Signup allowed only for <span className="text-cyan-200">@iiitm.ac.in</span> emails.
      </p>
    </div>
  );
}
