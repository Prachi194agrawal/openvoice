"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn } from "lucide-react";
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
    <Tabs defaultValue="login">
      <TabsList className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        <TabsTrigger
          value="login"
          className="rounded-xl px-3 py-1.5 text-sm text-slate-300 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
        >
          Login
        </TabsTrigger>
        <TabsTrigger
          value="signup"
          className="rounded-xl px-3 py-1.5 text-sm text-slate-300 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
        >
          Signup
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="mt-5 space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
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
            placeholder="Enter your password"
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
      </TabsContent>

      <TabsContent value="signup" className="mt-5 space-y-4">
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(34,211,238,0.4)]"
        >
          <LogIn className="mr-2 size-4" />
          Continue with Google
        </Button>

        <p className="text-xs text-muted-foreground">
          College email signup allowed only for <span className="text-cyan-200">@iiitm.ac.in</span>.
        </p>
      </TabsContent>
    </Tabs>
  );
}
