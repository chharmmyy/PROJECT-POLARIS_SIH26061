"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Sparkles, KeyRound } from "lucide-react";

// --- HELPER ICONS ---

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
    />
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  submitButtonText?: string;
  alternateActionText?: React.ReactNode;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const LiquidGlassInput = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-white/25 bg-white/12 backdrop-blur-xl transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] focus-within:border-sky-300 focus-within:bg-white/20 focus-within:shadow-[0_0_18px_rgba(56,189,248,0.35)]">
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span>Sign <span className="text-cyan-300">In</span></span>,
  description = "Access polar microgrid telemetry and predictive dispatch intelligence.",
  heroImageSrc,
  submitButtonText = "Sign In",
  alternateActionText,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@polaris.polar");
  const [password, setPassword] = useState("polaris2026");

  const fillAdminCredentials = () => {
    setEmail("admin@polaris.polar");
    setPassword("polaris2026");
  };

  return (
    <div className="relative h-screen w-screen max-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#0c2452] via-[#164282] via-[#2a68b8] to-[#8ebfe8] text-white p-3 sm:p-5 lg:p-6">
      {/* Background Liquid Light Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-400/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-cyan-300/20 blur-3xl" />

      {/* Main Liquid Glass Card */}
      <div className="relative z-10 w-full max-w-5xl max-h-[94vh] rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/30 shadow-[0_24px_64px_-12px_rgba(4,24,64,0.45)] overflow-hidden flex flex-col md:flex-row">
        {/* Left column: streamlined sign-in form */}
        <section className="flex-1 flex flex-col justify-center p-5 sm:p-7 lg:p-9 overflow-y-auto scrollbar-none">
          <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
            {/* Logo Link */}
            <a href="/" className="inline-flex items-center gap-2 select-none w-fit group">
              <div className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center bg-white/15 backdrop-blur-md group-hover:border-white transition-colors shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="2.5" fill="#67e8f9" />
                  <line x1="12" y1="2" x2="12" y2="6" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="12" y1="18" x2="12" y2="22" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="2" y1="12" x2="6" y2="12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="18" y1="12" x2="22" y2="12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-white font-bold text-base tracking-wider drop-shadow-sm uppercase">
                POLARIS<span className="text-sky-200 font-normal text-xs ml-1.5 normal-case tracking-normal">polar energy AI</span>
              </span>
            </a>

            <div>
              <h1 className="animate-element animate-delay-100 text-2xl sm:text-3xl font-bold leading-tight text-white drop-shadow-sm">
                {title}
              </h1>
              <p className="animate-element animate-delay-200 text-xs sm:text-sm text-blue-100/90 mt-1 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Admin Demo Credentials Badge */}
            <div className="animate-element animate-delay-200 p-2.5 rounded-2xl bg-white/15 border border-sky-300/40 backdrop-blur-md flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-sky-400/20 text-sky-200 flex items-center justify-center shrink-0 border border-sky-300/30">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-[11px] font-bold text-sky-200 tracking-wide flex items-center gap-1">
                    Demo Admin Access
                  </span>
                  <span className="text-[10px] text-blue-100/80 font-mono truncate">
                    admin@polaris.polar &bull; polaris2026
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={fillAdminCredentials}
                className="px-2.5 py-1 rounded-lg bg-sky-400/30 hover:bg-sky-400/50 text-sky-100 border border-sky-300/50 text-[11px] font-bold transition cursor-pointer shrink-0"
                title="Fill example admin credentials"
              >
                Auto-Fill
              </button>
            </div>

            <form className="space-y-3" onSubmit={onSignIn}>
              {/* Email Address */}
              <div className="animate-element animate-delay-300">
                <label className="text-xs font-semibold text-sky-100 tracking-wide mb-1 block">
                  Email Address
                </label>
                <LiquidGlassInput>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@polaris.polar"
                    className="w-full bg-transparent text-sm p-2.5 sm:p-3 rounded-xl text-white placeholder:text-blue-200/50 focus:outline-none font-mono"
                  />
                </LiquidGlassInput>
              </div>

              {/* Password */}
              <div className="animate-element animate-delay-400">
                <label className="text-xs font-semibold text-sky-100 tracking-wide mb-1 block">
                  Password
                </label>
                <LiquidGlassInput>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-transparent text-sm p-2.5 sm:p-3 pr-11 rounded-xl text-white placeholder:text-blue-200/50 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-blue-200 hover:text-white transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </LiquidGlassInput>
              </div>

              {/* Remember Me & Reset Password */}
              <div className="animate-element animate-delay-500 flex items-center justify-between text-xs text-blue-100 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" name="rememberMe" defaultChecked className="custom-checkbox rounded cursor-pointer" />
                  <span>Keep me signed in</span>
                </label>
                <a
                  href="#reset"
                  onClick={(e) => {
                    e.preventDefault();
                    onResetPassword?.();
                  }}
                  className="hover:underline text-cyan-300 font-medium transition-colors"
                >
                  Reset password
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="animate-element animate-delay-600 w-full rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-200 hover:from-sky-300 hover:via-cyan-200 hover:to-white text-[#061838] py-2.5 sm:py-3 font-bold transition-all shadow-[0_8px_20px_rgba(56,189,248,0.35)] hover:shadow-[0_10px_28px_rgba(56,189,248,0.55)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <span>{submitButtonText}</span>
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-white/20"></span>
              <span className="px-2.5 text-[11px] text-blue-200/80 bg-[#164282]/80 rounded-full backdrop-blur-md absolute">
                Or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={onGoogleSignIn}
              className="animate-element animate-delay-800 w-full flex items-center justify-center gap-2.5 border border-white/25 hover:border-white/50 bg-white/10 hover:bg-white/20 rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all backdrop-blur-md cursor-pointer shadow-sm"
            >
              <GoogleIcon />
              Continue with Google SSO
            </button>

            <p className="animate-element animate-delay-900 text-center text-xs text-blue-100">
              {alternateActionText || (
                <>
                  New to Polaris Microgrid?{" "}
                  <a
                    href="#create"
                    onClick={(e) => {
                      e.preventDefault();
                      onCreateAccount?.();
                    }}
                    className="text-cyan-300 hover:underline transition-colors font-semibold ml-1"
                  >
                    Create Account
                  </a>
                </>
              )}
            </p>
          </div>
        </section>

        {/* Right column: Pristine photograph */}
        {heroImageSrc && (
          <section className="hidden md:block flex-1 relative p-3.5 lg:p-4 min-h-[460px]">
            <div className="animate-slide-right animate-delay-300 relative w-full h-full rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
              <img
                src={heroImageSrc}
                alt="Bharati Antarctic Research Station"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SignInPage;
