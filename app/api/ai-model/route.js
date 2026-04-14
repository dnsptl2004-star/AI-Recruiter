import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function fetchWithTimeout(url, options = {}, ms = 120000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function safeText(v) {
  return String(v ?? "").trim();
}

function fallbackQuestions(jobPosition, type) {
  const title = safeText(jobPosition) || "this role";
  const interviewType = safeText(type).toLowerCase();

  const technical = [
    `Can you explain the core Java concepts you use most often in ${title}?`,
    `How do you debug and fix a bug in a Java application?`,
    `What is the difference between ArrayList and LinkedList in Java?`,
    `How do you handle exceptions in Java code?`,
  ];

  const behavioral = [
    `Tell me about a time you solved a difficult problem in a team.`,
    `How do you handle deadlines when multiple tasks are pending?`,
    `Describe a situation where you learned a new skill quickly.`,
    `How do you handle feedback from a senior developer or interviewer?`,
  ];

  const problemSolving = [
    `How would you approach a performance issue in a Java application?`,
    `How would you design a simple solution for a real-world business problem?`,
    `What steps do you take when your code works locally but fails in production?`,
    `How do you break down a complex task into smaller parts?`,
  ];

  let selected = technical;
  if (interviewType.includes("behavior")) selected = behavioral;
  else if (interviewType.includes("problem")) selected = problemSolving;

  return selected.slice(0, 4).map((question) => ({
    question,
    type:
      interviewType.includes("behavior")
        ? "Behavioral"
        : interviewType.includes("problem")
          ? "Problem Solving"
          : "Technical",
  }));
}

function tryParseJSONLoose(raw) {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  const firstArr = trimmed.indexOf("[");
  const lastArr = trimmed.lastIndexOf("]");
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    try {
      return JSON.parse(trimmed.slice(firstArr, lastArr + 1));
    } catch {}
  }

  const firstObj = trimmed.indexOf("{");
  const lastObj = trimmed.lastIndexOf("}");
  if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
    try {
      return JSON.parse(trimmed.slice(firstObj, lastObj + 1));
    } catch {}
  }

  return null;
}

function normalizeQuestions(data) {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.questions)
      ? data.questions
      : [];

  return source
    .map((item) => {
      if (typeof item === "string") {
        const q = item.trim();
        return q ? { question: q, type: "Technical" } : null;
      }

      if (item && typeof item === "object") {
        const question = safeText(
          item.question ?? item.text ?? item.q ?? item.prompt
        );
        if (!question) return null;

        return {
          question,
          type: safeText(item.type) || "Technical",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function extractAssistantText(rawText) {
  const parsed = tryParseJSONLoose(rawText);

  const content =
    parsed?.choices?.[0]?.message?.content ??
    parsed?.choices?.[0]?.text ??
    parsed?.choices?.[0]?.message?.reasoning ??
    "";

  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  return safeText(rawText);
}

async function callOpenRouter(model, payload, apiKey, timeoutMs = 120000) {
  const url = "https://openrouter.ai/api/v1/chat/completions";

  return await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Interview Generator",
      },
      body: JSON.stringify({ ...payload, model }),
    },
    timeoutMs
  );
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobPosition, jobDescription, duration = "30", type = "technical" } =
      body || {};

    if (!jobPosition || !jobDescription) {
      return NextResponse.json(
        { error: "Missing jobPosition or jobDescription" },
        { status: 400 }
      );
    }

    const fallback = fallbackQuestions(jobPosition, type);

    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY?.trim();
    const model = process.env.OPENROUTER_MODEL?.trim();

    if (!OPENROUTER_KEY || !model) {
      return NextResponse.json(
        { questions: fallback, fallback: true },
        { status: 200 }
      );
    }

    const prompt = `
Return ONLY valid JSON:
{
  "questions": [
    { "question": "string", "type": "Technical" }
  ]
}

Generate 3 to 5 questions for a ${duration}-minute ${type} interview.
Role: ${jobPosition}
Job description: ${jobDescription}

Rules:
- question must be a single interview question
- type must be one of: Technical, Behavioral, Problem Solving, Experience
- no markdown
- no explanation
- no extra keys
`.trim();

    const payload = {
      messages: [
        {
          role: "system",
          content: "You generate interview questions and output only JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
    };

    const resp = await callOpenRouter(model, payload, OPENROUTER_KEY, 120000);
    const rawText = await resp.text().catch(() => "");
    const parsed = tryParseJSONLoose(rawText);

    if (!resp.ok) {
      console.error("OpenRouter error:", resp.status, rawText);
      return NextResponse.json(
        {
          questions: fallback,
          fallback: true,
          upstreamError: rawText || `OpenRouter error ${resp.status}`,
        },
        { status: 200 }
      );
    }

    const assistantText = extractAssistantText(rawText);
    const jsonCandidate = tryParseJSONLoose(assistantText) ?? tryParseJSONLoose(rawText);
    const questions = normalizeQuestions(jsonCandidate);

    if (!questions.length) {
      console.error("No valid questions parsed:", assistantText);
      return NextResponse.json(
        {
          questions: fallback,
          fallback: true,
          upstreamError: "AI returned invalid question format",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ questions }, { status: 200 });
  } catch (err) {
    console.error("ai-model route failed:", err);
    return NextResponse.json(
      {
        questions: fallbackQuestions("Java Developer", "technical"),
        fallback: true,
        error: err?.message || "AI service failed",
      },
      { status: 200 }
    );
  }
}