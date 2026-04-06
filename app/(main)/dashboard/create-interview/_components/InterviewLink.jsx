"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Copy, List, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

function InterviewLink({ interview_id, formdata = {} }) {

  const interviewUrl = useMemo(() => {
    if (!interview_id) return "";

    const base =
      process.env.NEXT_PUBLIC_HOST_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    return `${base}/${interview_id}`;
  }, [interview_id]);

  const onCopyLink = async () => {
    if (!interviewUrl) {
      toast.error("Invalid interview link ❌");
      return;
    }

    try {
      await navigator.clipboard.writeText(interviewUrl);
      toast.success("Link copied successfully ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link ❌");
    }
  };

  const questionList = Array.isArray(formdata?.questionList)
    ? formdata.questionList
    : [];

  return (
    <div className="flex flex-col items-center w-full justify-center mt-10">
      <Image src="/check.png" alt="check" width={50} height={50} />

      <h2 className="font-bold text-lg mt-4">
        Your AI Interview is Ready!
      </h2>

      <p className="mt-3">
        Share this with your candidates to start interview process
      </p>

      <div className="w-full p-7 mt-6 rounded-lg bg-white">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">Interview Link</h2>
          <span className="p-1 px-2 text-primary bg-blue-50 rounded-full">
            Valid for 30 Days
          </span>
        </div>

        <div className="mt-3 flex gap-3 items-center">
          <Input value={interviewUrl} readOnly />
          <Button onClick={onCopyLink} disabled={!interview_id}>
            <Copy className="mr-1" /> Copy Link
          </Button>
        </div>

        <hr className="my-5" />

        <div className="flex gap-5">
          <p className="text-sm text-gray-500 flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            {formdata?.duration || "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-7 bg-white p-5 rounded-lg w-full">
        <h2 className="font-bold">Share Via</h2>
        <div className="flex gap-4 mt-2">
          <Button variant="outline"><Mail /> Email</Button>
          <Button variant="outline"><Mail /> Slack</Button>
        </div>
      </div>

      <div className="flex w-full gap-5 justify-between mt-6">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft /> Back to Dashboard
          </Button>
        </Link>

        <Link href="/create-interview">
          <Button>
            <Plus /> Create New Interview
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default InterviewLink;
