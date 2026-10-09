"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { requestResetAction } from "./actions";

function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await requestResetAction(email);
      setLoading(false);

      if (res?.error) {
        setError(res.error);
        return;
      }

      setSubmitted(true);
      toast("Password recovery request processed", "success");
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto text-violet-600 mb-2">
                <KeyRound className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-600 font-semibold">
                Account Security
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
                Recover Password
              </h1>
              <p className="text-xs text-zinc-500">
                Enter your registered email address to receive a secure password reset link
              </p>
            </div>

            {submitted ? (
              <div className="space-y-6 pt-2">
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-950">
                    Check Your Inbox
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    If an account is registered with <strong className="font-semibold">{email}</strong>, a secure reset link valid for 30 minutes has been dispatched.
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Send to a different email
                  </Button>

                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Input
                  label="Registered Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="collector@example.com"
                  icon={Mail}
                  error={error}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Dispatching Link..." : "Send Password Reset Link"}
                  </Button>
                </div>

                <div className="text-center pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                  <Link
                    href="/login"
                    className="font-semibold text-zinc-600 hover:text-zinc-950 transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <ToastProvider>
      <ForgotPasswordForm />
    </ToastProvider>
  );
}
