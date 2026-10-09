"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { verifyTokenAction, resetPasswordAction } from "@/app/forgot-password/actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { toast } = useToast();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        setTokenError("Missing or incomplete password reset token.");
        return;
      }

      const res = await verifyTokenAction(token);
      setVerifying(false);
      if (res?.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setTokenError(res?.error || "This reset link is invalid or has expired.");
      }
    }

    checkToken();
  }, [token]);

  const validate = () => {
    const errs = {};
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setSubmitError("");

    try {
      const res = await resetPasswordAction(token, password, confirmPassword);
      setLoading(false);

      if (res?.error) {
        setSubmitError(res.error);
        return;
      }

      setSuccess(true);
      toast("Password successfully reset! You may now sign in.", "success");
    } catch {
      setLoading(false);
      setSubmitError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-600 font-semibold">
                Access Credentials
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
                Set New Password
              </h1>
              <p className="text-xs text-zinc-500">
                Create a strong new password for your TORI account
              </p>
            </div>

            {verifying ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-zinc-500">
                  Verifying cryptographic security token...
                </p>
              </div>
            ) : !tokenValid ? (
              <div className="space-y-6 pt-2">
                <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
                  <h3 className="text-sm font-bold text-rose-950">
                    Invalid or Expired Link
                  </h3>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {tokenError}
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <Button
                    href="/forgot-password"
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    Request a New Reset Link
                  </Button>

                  <Link
                    href="/login"
                    className="inline-block text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
                  >
                    Return to Sign In
                  </Link>
                </div>
              </div>
            ) : success ? (
              <div className="space-y-6 pt-2">
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-950">
                    Password Updated Successfully
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your account password has been changed. You can now access your account using your new credentials.
                  </p>
                </div>

                <Button
                  href="/login"
                  variant="primary"
                  size="lg"
                  className="w-full group"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Input
                  label="New Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.password}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.confirmPassword}
                  required
                />

                {submitError && (
                  <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-3">
                    {submitError}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Updating Credentials..." : "Confirm New Password"}
                  </Button>
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

export default function ResetPasswordPage() {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </ToastProvider>
  );
}
