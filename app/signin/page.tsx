"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { isPreviewMode } from "@/lib/preview";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/signin-button";
import { BookOpen } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/iiitm-campus.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-slate-950/80"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="glass-card soft-glow relative z-10 w-full max-w-md rounded-3xl p-7"
      >
        <div className="mb-6 flex items-center gap-2 text-cyan-300">
          <BookOpen className="size-5" />
          <span className="text-sm font-semibold tracking-wide">OpenVoice IIITM</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Login/Signup</h1>
        <p className="mt-2 text-sm text-slate-300">Your Campus. Your Voice.</p>

        <div className="mt-6">
          {isPreviewMode ? (
            <Link href="/" className="block">
              <Button className="h-11 w-full rounded-xl">Open preview directly</Button>
            </Link>
          ) : (
            <SignInButton />
          )}
        </div>
      </motion.div>
    </div>
  );
}
