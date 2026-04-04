"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <div className="flex flex-col space-y-3">
      <Button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full">
        Continue with IIITM Google
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <Button 
        variant="secondary" 
        onClick={() => signIn("credentials", { email: "img_2023041@iiitm.ac.in", password: "test", callbackUrl: "/" })} 
        className="w-full"
      >
        Mock Login (Test)
      </Button>
    </div>
  );
}
