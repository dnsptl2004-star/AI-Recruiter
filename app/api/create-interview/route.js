export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

function serializeError(err) {
  if (!err) return { message: "Unknown error" };
  return {
    message: err.message ?? String(err),
    code: err.code ?? null,
    details: err.details ?? null,
    hint: err.hint ?? null,
  };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userEmail = body.useremail ?? body.userEmail ?? null;
    const rawQuestions = Array.isArray(body.questionlist) ? body.questionlist
      : Array.isArray(body.questionList) ? body.questionList
      : Array.isArray(body.questions) ? body.questions
      : null;

    if (!userEmail || !rawQuestions || rawQuestions.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanQuestions = rawQuestions.map((q, i) => {
      if (typeof q === "string") return { id: i + 1, question: String(q).trim(), type: null };
      return { id: q?.id ?? i + 1, question: String(q?.question ?? q?.text ?? "").trim(), type: q?.type ?? null };
    });

    const payload = {
      jobposition: body.jobposition ?? body.jobPosition ?? null,
      jobdescription: body.jobdescription ?? body.jobDescription ?? null,
      duration: body.duration ?? null,
      type: body.type ?? null,
      questionlist: cleanQuestions,
      useremail: userEmail,
      interview_id: body.interview_id || randomUUID(),
      created_at: new Date().toISOString()
    };

    let attempt = 0;
    const maxAttempts = 2;
    let lastError = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const { data, error } = await supabase
          .from("Interviews")
          .insert(payload)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: "Database insert failed", detail: serializeError(error) }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
      } catch (e) {
        lastError = e;
        const errMsg = String(e?.message ?? e);
        const isTimeout = /timeout/i.test(errMsg) || /ConnectTimeoutError/i.test(errMsg);
        if (!isTimeout || attempt >= maxAttempts) break;
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    return NextResponse.json({ error: "Supabase insert failed", detail: serializeError(lastError) }, { status: 504 });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected server error", detail: serializeError(err) }, { status: 500 });
  }
}