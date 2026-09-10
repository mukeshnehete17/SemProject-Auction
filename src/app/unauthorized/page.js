import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-3 text-gray-600">
            You do not have permission to access this page.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-6 py-3 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}