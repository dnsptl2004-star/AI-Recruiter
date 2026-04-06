"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { supabase } from "@/lib/services/supabaseClient";
import { useUser } from "@/app/provider";
import InterviewCard from "./InterviewCard";
import { useRouter } from "next/navigation";

export default function LatestInterviewsList() {
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const router = useRouter();
  
  const GetInterviewList = useCallback(async () => {
    setError(null);
    if (!user?.email) {
      setInterviewList([]);
      return;
    }

    if (!supabase) {
      console.error("Supabase client not initialized (client). Check lib/services/supabaseClient.js");
      setError("Supabase client not initialized");
      return;
    }

    setLoading(true);
    try {
   
      const { data: interviews, error: fetchError } = await supabase
        .from("Interviews") 
        .select(
          `
            id,
            interview_id,
            jobposition,
            duration,
            created_at
          `
        )
        .eq("useremail", user.email)
        .order("id", { ascending: false })
        .limit(6);

      if (fetchError) {
        console.error("GetInterviewList supabase error:", fetchError);
        setError(fetchError.message || "Failed to load interviews");
        setInterviewList([]);
        return;
      }

      setInterviewList(interviews || []);
    } catch (err) {
      console.error("GetInterviewList unexpected error:", err);
      setError(String(err));
      setInterviewList([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    GetInterviewList();
   
  }, [GetInterviewList]);

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl">Previously Created Interviews</h2>

      {loading && (
        <div className="p-5 mt-5 bg-white rounded-md flex items-center gap-3">
          <Video className="h-6 w-6 animate-spin text-primary" />
          <div>Loading your interviews…</div>
        </div>
      )}

      {!loading && error && (
        <div className="p-4 mt-5 bg-red-50 text-red-800 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && interviewList?.length === 0 && !error && (
        <div className="p-5 flex flex-col gap-3 items-center mt-5 bg-white">
          <Video className="h-10 w-10 text-primary" />
          <h2>You don't have any interviews created!</h2>
          <Button onClick={() => router.push("/dashboard/create-interview")}> + Create New Interview </Button>
        </div>
      )}

      {!loading && interviewList?.length > 0 && (
        <div className="grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5">
          {interviewList.map((interview) => (
            <InterviewCard interview={interview} key={interview.id ?? interview.interview_id} />
          ))}
        </div>
      )}
    </div>
  );
}
