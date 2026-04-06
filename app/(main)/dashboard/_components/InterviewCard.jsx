"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Send } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

function InterviewCard({ interview, viewDetail = false }) {
  const url = `${process.env.NEXT_PUBLIC_HOST_URL}/${interview?.interview_id}`;

  const copyLink = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast("Copied");
  };

  const onSend = () => {
  if (!interview) return;

  const subject = encodeURIComponent(`AiCruiter Interview – ${interview?.jobposition ?? ""}`);

  const createdOn = interview?.created_at
    ? moment(interview.created_at).format("DD MMM YYYY")
    : "";

  const body = encodeURIComponent(
    `Job Position: ${interview?.jobposition ?? ""}
Duration: ${interview?.duration ?? ""}
Created On: ${createdOn}

Interview Link:
${typeof url !== "undefined" ? url : ""}`
  );

  window.open(
    `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
    "_blank",
    "noopener,noreferrer"
  );
};

  return (
    <div className="p-5 bg-white rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 bg-primary rounded-full" />
        <h2 className="text-sm">
          {moment(interview?.created_at).format("DD MMM YYYY")}
        </h2>
      </div>

      <h2 className="mt-3 font-bold text-lg">
        {interview?.jobposition}
      </h2>

      <div className="mt-2 flex justify-between text-gray-500">
        <span>{interview?.duration}</span>
        <span className="text-green-700">
          Created Interview
        </span>
      </div>

      {!viewDetail ? (
        <div className="flex gap-3 w-full mt-5">
          <Button variant="outline" onClick={copyLink}>
            <Copy className="mr-1" /> Copy Link
          </Button>
          <Button onClick={onSend}>
            <Send className="mr-1" /> Send
          </Button>
        </div>
      ) : (
        <Link
          href={`/scheduled-interview/${interview?.interview_id}/details`}
        >
          <Button className="mt-5 w-full" variant="outline">
            View Detail <ArrowRight className="ml-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default InterviewCard;
