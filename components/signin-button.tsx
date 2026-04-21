"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function SignInButton() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    try {
      await signIn("credentials", { email, password, callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="admin123@iiitm.ac.in"
          className="rounded-xl border-white/10 bg-slate-900/60 placeholder:text-slate-400/60"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="12345"
          className="rounded-xl border-white/10 bg-slate-900/60 placeholder:text-slate-400/60"
          autoComplete="current-password"
        />
      </div>

      <Button
        onClick={onLogin}
        disabled={loading}
        className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Only <span className="text-cyan-200">admin123@iiitm.ac.in</span> with password <span className="text-cyan-200">12345</span> can sign in.
      </p>
    </div>
  );
}
