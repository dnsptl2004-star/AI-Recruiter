"use client";

import { Calendar, ClipboardListIcon, Clock } from "lucide-react";
import React from "react";
import moment from "moment";

function InterviewDetailContainer({ interviewDetail }) {
  if (!interviewDetail) {
    return <p className="mt-5 text-gray-500">No interview details found.</p>;
  }

  let questions = [];

  try {
    if (Array.isArray(interviewDetail?.questionlist)) {
      questions = interviewDetail.questionlist;
    } else if (typeof interviewDetail?.questionlist === "string") {
      questions = JSON.parse(interviewDetail.questionlist);
    }
  } catch (e) {
    console.warn("Invalid questionlist JSON:", e);
    questions = [];
  }

  return (
    <div className="p-5 bg-white rounded-lg mt-5">
      <h2 className="font-semibold text-lg">{interviewDetail?.jobposition}</h2>

      <div className="mt-4 flex items-center justify-between lg:pr-52">
        <div>
          <h2 className="text-sm text-gray-500">Duration</h2>
          <h2 className="flex text-sm font-bold items-center gap-2">
            <Clock className="h-4 w-4" />
            {interviewDetail?.duration}
          </h2>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">Created On</h2>
          <h2 className="flex text-sm font-bold items-center gap-2">
            <Calendar className="h-4 w-4" />
            {moment(interviewDetail?.created_at).format("MMM DD, YYYY")}
          </h2>
        </div>

        {interviewDetail?.type && (
          <div>
            <h2 className="text-sm text-gray-500">Type</h2>
            <h2 className="flex text-sm font-bold items-center gap-2">
              <ClipboardListIcon className="h-4 w-4" />
              {(() => {
                try {
                  return JSON.parse(interviewDetail.type)?.[0];
                } catch {
                  return interviewDetail.type;
                }
              })()}
            </h2>
          </div>
        )}
      </div>

      <div className="mt-5">
        <h2 className="font-bold">Job Description</h2>
        <p className="text-sm leading-6">
          {interviewDetail?.jobdescription}
        </p>
      </div>

      <div className="mt-5">
        <h2 className="font-bold">Interview Questions</h2>

        {questions.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">
            No questions available.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {questions.map((item, index) => (
              <h2 key={index} className="text-xs flex">
                {index + 1}. {item?.question ?? item}
              </h2>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewDetailContainer;
