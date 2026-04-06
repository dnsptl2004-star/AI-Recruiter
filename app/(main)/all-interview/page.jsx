"use client";

import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/services/supabaseClient";
import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/InterviewCard";

export default function AllInterview() {
  const [interviewList, setInterviewList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    let mounted = true;
    if (user?.email) {
      (async () => {
        try {

          const { data, error } = await supabase
            .from("Interviews")
            .select("*")
            .eq("useremail", user.email)           
            .order("id", { ascending: false })
            .limit(6);

          if (error) {
            console.error("Failed to fetch interviews:", error);
            if (mounted) setInterviewList([]);
            return;
          }

    
          const list = Array.isArray(data) ? data : [];
          if (mounted) setInterviewList(list);
        } catch (err) {
          console.error("Unexpected error fetching interviews:", err);
          if (mounted) setInterviewList([]);
        }
      })();
    } else {
   
      setInterviewList([]);
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl">Previously Created Interviews</h2>

      {(!interviewList || interviewList.length === 0) && (
        <div className="p-5 flex flex-col gap-3 items-center mt-5 bg-white">
          <Video className="h-10 w-10 text-primary" />
          <h2>You don't have any interviews created!</h2>
          <Button>+ Create New Interview</Button>
        </div>
      )}

      {interviewList && interviewList.length > 0 && (
        <div className="grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5">
          {interviewList.map((interview) => (
           
            <InterviewCard interview={interview} key={interview.id ?? interview.interview_id ?? interview.created_at} />
          ))}
        </div>
      )}
    </div>
  );
}
