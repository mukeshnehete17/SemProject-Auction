"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { Mail, Lock, ArrowUpRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    if (searchParams.get("registered")) {
      toast("Account registered successfully! Please sign in.", "success");
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const validate = () => {
    const errs = {};
    if (!form.email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setFormError("");

    try {
      const result = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Invalid email or password credentials.");
        setLoading(false);
        return;
      }

      toast("Authentication successful!", "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("An unexpected error occurred during authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
                Member Access
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
                Sign In to TORI
              </h1>
              <p className="text-xs text-zinc-500">
                Enter your credentials to manage active bids and consignments
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="collector@example.com"
                icon={Mail}
                error={errors.email}
                required
              />

              <Input
                label="Security Password"
                type="password"
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                icon={Lock}
                error={errors.password}
                required
              />

              {formError && (
                <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-3">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) =>
                      setForm({ ...form, remember: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-zinc-950"
                  />
                  <span className="text-zinc-600">Remember session</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Authenticating..." : "Sign In to Console"}
                </Button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              New to the auction house?{" "}
              <Link
                href="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-0.5"
              >
                <span>Register Account</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Development-Only Demo Accounts Callout */}
            {process.env.NODE_ENV !== "production" && (
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 text-[11px] font-mono text-zinc-600 space-y-1">
                <p className="font-bold uppercase tracking-wider text-zinc-500 text-[10px]">
                  Development Demo Credentials:
                </p>
                <p className="truncate">
                  Buyer: <span className="font-semibold text-zinc-900">buyer@bidzone.local</span>
                </p>
                <p className="truncate">
                  Seller: <span className="font-semibold text-zinc-900">seller@bidzone.local</span>
                </p>
                <p>
                  Password: <span className="font-semibold text-zinc-900">BidZone@123</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </ToastProvider>
  );
}