"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function InterviewCompletedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 to-white p-6">
      <section
        role="main"
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl p-8 sm:p-12 ring-1 ring-slate-100"
        aria-labelledby="interview-completed-title"
      >
        <div className="flex flex-col items-center text-center gap-6">
          <div className="grid place-items-center h-28 w-28 rounded-full bg-green-50" aria-hidden>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 id="interview-completed-title" className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Interview Completed
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Your interview has finished successfully. We've saved your feedback to your account — you can review
            detailed feedback on your dashboard. Thank you for using our interview platform.
          </p>

          <div className="mt-2 flex w-full justify-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Return to dashboard"
            >
              <span>Return to dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
