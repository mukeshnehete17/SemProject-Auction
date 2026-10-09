import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 font-semibold">
            Access Restricted
          </span>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight">
            Unauthorized Clearance
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Your current account credentials do not hold the required role privileges to access this console route.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-white bg-zinc-950 hover:bg-zinc-800 transition-colors px-6 py-3 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}