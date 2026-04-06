"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PhoneScreenPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user?.email) {
        setUserEmail(data.user.email);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchInterviews() {
      if (!userEmail) return;

      const { data, error } = await supabase
        .from("Interviews")
        .select("jobposition, duration, questionlist, interview_id")
        .eq("useremail", userEmail)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInterviews(
          data.map((i) => ({
            ...i,
            duration: Number(i.duration ?? i.questionlist?.duration ?? 30),
          }))
        );
      }
    }

    fetchInterviews();
  }, [userEmail]);

  useEffect(() => {
    if (!selectedJob) return;
    const interview = interviews.find((i) => i.jobposition === selectedJob);
    if (interview) {
      setDuration(interview.duration);
    }
  }, [selectedJob, interviews]);

  function handleSchedule() {
    if (!selectedJob) return;
    const interview = interviews.find((i) => i.jobposition === selectedJob);
    if (interview) {
      setLoading(true);
      router.push(`/interview/${interview.interview_id}`);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Phone Screening Setup
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a job position to start the interview
          </p>
        </header>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job Position
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">Select a position</option>
              {interviews.map((i) => (
                <option key={i.interview_id} value={i.jobposition}>
                  {i.jobposition}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSchedule}
            disabled={!selectedJob || loading}
            className="cursor-pointer w-full h-11 rounded-md bg-sky-600 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting…" : "Start Screening"}
          </button>
        </div>
      </section>
    </main>
  );
}
