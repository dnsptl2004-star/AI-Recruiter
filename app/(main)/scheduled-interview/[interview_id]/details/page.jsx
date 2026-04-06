"use client";

import { useUser } from "@/app/provider";
import { supabase } from "@/lib/services/supabaseClient";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import InterviewDetailContainer from "./_components/InterviewDetailContainer";
import CandidateList from "./_components/CandidateList";

function InterviewDetail() {
  const params = useParams();
  const interview_id = Array.isArray(params?.interview_id)
    ? params.interview_id[0]
    : params?.interview_id;

  const { user } = useUser();
  const [interviewDetail, setInterviewDetail] = useState(null);

  useEffect(() => {
    if (user && interview_id) GetInterviewDetail();
  }, [user, interview_id]);

  const GetInterviewDetail = async () => {
    try {
      const { data: interview, error } = await supabase
        .from("Interviews")
        .select("*")
        .eq("useremail", user?.email)
        .eq("interview_id", interview_id)
        .single();

      if (error || !interview) {
        console.warn("No interview found");
        setInterviewDetail(null);
        return;
      }

      const { data: feedbackData } = await supabase
        .from("interview_feedback")
        .select("*")
        .eq("interview_id", interview.interview_id);

      setInterviewDetail({
        ...interview,
        interview_feedback: feedbackData ?? [],
      });
    } catch (err) {
      console.error("Supabase error:", err);
      setInterviewDetail(null);
    }
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl">Interview Detail</h2>
      <InterviewDetailContainer interviewDetail={interviewDetail} />
      <CandidateList
        candidateList={interviewDetail?.interview_feedback ?? []}
      />
    </div>
  );
}

export default InterviewDetail;
