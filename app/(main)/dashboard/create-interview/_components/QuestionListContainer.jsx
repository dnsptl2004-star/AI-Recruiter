"use client";
import React from "react";

function QuestionListContainer({ questionList = [] }) {
  const validQuestions = Array.isArray(questionList)
    ? questionList
        .map((q, index) => {
          if (!q) return null;

          if (typeof q === "string") {
            const text = q.trim();
            return text
              ? {
                  id: index + 1,
                  question: text,
                  type: "General",
                }
              : null;
          }

          if (typeof q === "object" && typeof q.question === "string") {
            const text = q.question.trim();
            return text
              ? {
                  id: q.id ?? index + 1,
                  question: text,
                  type: q.type || "General",
                }
              : null;
          }

          return null;
        })
        .filter(Boolean)
    : [];

  if (validQuestions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No interview questions generated yet.
      </div>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Generated Interview Questions
      </h2>

      <div className="space-y-3">
        {validQuestions.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {index + 1}
              </span>

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {item.question}
                </p>

                {item.type && (
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.type}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuestionListContainer;
