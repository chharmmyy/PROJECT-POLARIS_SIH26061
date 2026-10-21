"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInPage } from "@/components/ui/sign-in";

export default function SignUpPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "admin@polaris.polar";

    try {
      localStorage.setItem("polaris_user", JSON.stringify({
        email,
        role: "Station Operations Lead",
        station: "Maitri",
        loginTime: new Date().toISOString()
      }));
    } catch {}

    setSuccessMessage(`Authenticated as ${email}. Launching polar microgrid digital twin...`);
    
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handleGoogleAuth = () => {
    try {
      localStorage.setItem("polaris_user", JSON.stringify({
        email: "admin@polaris.polar",
        role: "National Polar Research Center Lead",
        station: "Maitri",
        loginTime: new Date().toISOString()
      }));
    } catch {}

    setSuccessMessage("Connecting via National Polar Research Center SSO... Redirecting to Dashboard");
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handleResetPassword = () => {
    alert("Password reset instructions have been transmitted via secure satellite uplink to admin@polaris.polar.");
  };

  const handleCreateAccount = () => {
    alert("To register a new research station or operator seat, contact the Polar Logistics Operations lead at ops@polaris.polar.");
  };

  return (
    <main className="h-screen w-screen max-h-screen overflow-hidden bg-gradient-to-br from-[#0c2452] via-[#164282] via-[#2a68b8] to-[#8ebfe8] flex items-center justify-center">
      {successMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0d2a60]/95 border border-cyan-400/70 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <p className="text-xs sm:text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <SignInPage
        title={
          <span>
            Sign <span className="text-cyan-300">In</span>
          </span>
        }
        description="Access polar microgrid telemetry and predictive dispatch intelligence."
        submitButtonText="Sign In"
        heroImageSrc="/images/bharati-station-hd.jpg"
        onSignIn={handleSubmit}
        onGoogleSignIn={handleGoogleAuth}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </main>
  );
}
