"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { Mail, Lock, User, ShoppingBag, Store, ArrowUpRight } from "lucide-react";
import { registerAction } from "./actions";

function RegisterForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "",
  });

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (!form.accountType) errs.accountType = "Please select an account type";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setFormError("");

    const result = await registerAction(
      form.fullName.trim(),
      form.email.trim(),
      form.password,
      form.accountType
    );

    if (result?.error) {
      setFormError(result.error);
      setLoading(false);
      return;
    }

    toast("Account created successfully! Redirecting to login...", "success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
                New Participant
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
                Create TORI Account
              </h1>
              <p className="text-xs text-zinc-500">
                Join the platform for verified auction participation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Rohan Sharma"
                icon={User}
                error={errors.fullName}
                required
              />

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

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword}
                required
              />

              {/* Account Type Selector */}
              <div className="pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                  Designated Role <span className="text-rose-500 ml-1 font-normal">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, accountType: "buyer" })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      form.accountType === "buyer"
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Buyer</span>
                    <span className={`text-[10px] ${form.accountType === "buyer" ? "text-zinc-400" : "text-zinc-500"}`}>
                      Place bids & win
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, accountType: "seller" })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      form.accountType === "seller"
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <Store className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Seller</span>
                    <span className={`text-[10px] ${form.accountType === "seller" ? "text-zinc-400" : "text-zinc-500"}`}>
                      List lots & consign
                    </span>
                  </button>
                </div>
                {errors.accountType && (
                  <p className="text-rose-600 text-xs mt-1.5 font-medium">
                    {errors.accountType}
                  </p>
                )}
              </div>

              {formError && (
                <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl p-3">
                  {formError}
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Registering Record..." : "Confirm & Create Account"}
                </Button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              Already possess an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-0.5"
              >
                <span>Sign in here</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ToastProvider>
      <RegisterForm />
    </ToastProvider>
  );
}
