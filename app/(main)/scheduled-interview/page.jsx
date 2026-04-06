"use client";

import { useUser } from "@/app/provider";
import { supabase } from "@/lib/services/supabaseClient";
import React, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/InterviewCard";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

function ScheduledInterview() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    if (user) GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    try {
      const { data, error } = await supabase
        .from("Interviews")
        .select(`
          jobposition,
          duration,
          interview_id,
          created_at
        `)
        .eq("useremail", user?.email)
        .order("id", { ascending: false });

      if (error) throw error;

      setInterviewList(data ?? []);
    } catch (err) {
      console.error("Supabase error:", err?.message || err);
      setInterviewList([]);
    }
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl">Interview List</h2>

      {interviewList.length === 0 ? (
        <div className="p-5 flex flex-col gap-3 items-center mt-5 bg-white">
          <Video className="h-10 w-10 text-primary" />
          <h2>You don't have any interview created!</h2>
          <Button>+Create New Interview</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5">
          {interviewList.map((interview) => (
            <InterviewCard
              interview={interview}
              key={interview.interview_id}
              viewDetail={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScheduledInterview;
