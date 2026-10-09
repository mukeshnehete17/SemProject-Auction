"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-zinc-50 font-sans">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 sm:p-10 max-w-md w-full text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-7 w-7" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 font-semibold">
              Execution Interrupted
            </span>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              An Unexpected Exception Occurred
            </h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The application encountered a transient runtime issue. You may retry the action or reload the session.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="lg" className="w-full" onClick={() => reset()}>
                Retry Execution
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}