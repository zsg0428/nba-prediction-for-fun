"use client";

import { googleLogin } from "@/actions/login";
import { Trophy } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-slate-950 to-blue-600/10" />
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 mx-4 flex w-full max-w-md flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Logo */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 sm:h-20 sm:w-20">
          <Trophy className="h-8 w-8 text-white sm:h-10 sm:w-10" />
        </div>

        {/* Title */}
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Welcome Back 老哥们!
        </h1>
        <p className="mb-2 text-lg text-orange-400">
          猜就完事儿了！
        </p>
        <p className="mb-8 text-sm text-slate-400">
          Sign in to start making your picks
        </p>

        {/* Google Login Button */}
        <button
          onClick={async () => {
            await googleLogin();
          }}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Pick game winners across NBA playoff rounds and compete with friends on the leaderboard
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
