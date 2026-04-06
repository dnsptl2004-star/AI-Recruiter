import { NextResponse } from "next/server";
import { QUESTIONS_PROMPT } from "@/lib/services/Constants";

async function fetchWithTimeout(url, options = {}, ms = 120000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function callOpenRouter(model, payload, apiKey, timeoutMs = 120000) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  return await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({ ...payload, model })
  }, timeoutMs);
}

function tryParseJSONLoose(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstObj = trimmed.indexOf("{");
    const lastObj = trimmed.lastIndexOf("}");
    if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
      try {
        return JSON.parse(trimmed.slice(firstObj, lastObj + 1));
      } catch {}
    }
    return null;
  }
}

function extractAssistantContent(rawText, parsedData) {
  const text = String(rawText || "").trim();
  let out = "";
  const choice = parsedData?.choices?.[0] ?? null;
  if (choice) {
    out = String(choice?.message?.content ?? choice?.text ?? choice?.message?.reasoning ?? "").trim();
    if (!out && Array.isArray(choice?.message?.reasoning_details)) {
      out = choice.message.reasoning_details.map((d) => (d && d.text ? String(d.text).trim() : "")).filter(Boolean).join("\n\n");
    }
  }
  if (!out) {
    const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      out = jsonArrayMatch[0].trim();
    }
  }
  if (!out) out = text;
  return out;
}

function isTransientNetworkError(e) {
  if (!e) return false;
  const name = e.name || "";
  const code = e.code || (e?.cause && e.cause.code) || "";
  const msg = String(e.message || "").toLowerCase();
  if (name === "AbortError") return true;
  if (code && /timeout|ECONNRESET|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|UND_ERR_CONNECT_TIMEOUT/i.test(String(code))) return true;
  if (/connect.*timeout|connect.*refused|network.*error|connect timeout|connection timed out|timeout/i.test(msg)) return true;
  return false;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobPosition, jobDescription, duration = "30", type = "technical" } = body || {};
    if (!jobPosition || !jobDescription) {
      return NextResponse.json({ error: "Missing jobPosition or jobDescription" }, { status: 400 });
    }

    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY?.trim();
    if (!OPENROUTER_KEY) {
      return NextResponse.json({ error: "Server misconfiguration: missing OPENROUTER_API_KEY" }, { status: 500 });
    }

    const configuredModel = (process.env.OPENROUTER_MODEL || "openrouter/gpt-4o-mini").trim();
    const fallbackModels = ["openrouter/free", "openrouter/gpt-4o-mini", "openrouter/gpt-4o"];
    const safeDuration = /^\s*\d+\s*$/i.test(String(duration)) ? `${String(duration).trim()}min` : String(duration);

    const FINAL_PROMPT = (QUESTIONS_PROMPT || "")
      .replace("{{jobTitle}}", String(jobPosition))
      .replace("{{jobDescription}}", String(jobDescription))
      .replace("{{duration}}", String(safeDuration))
      .replace("{{type}}", String(type));

    const payload = {
      messages: [{ role: "user", content: FINAL_PROMPT }],
      temperature: 0.2,
      max_tokens: 400
    };

    async function tryModelWithRetries(model) {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const resp = await callOpenRouter(model, payload, OPENROUTER_KEY, 120000);
          if (!resp) throw new Error("no response");
          const status = resp.status;
          const rawText = await resp.text().catch(() => "");
          if (status === 404) {
            throw Object.assign(new Error("model_not_found"), { status, rawText });
          }
          if (!resp.ok) {
            const parsedErr = tryParseJSONLoose(rawText) ?? {};
            const upstreamMsg = (parsedErr?.error && parsedErr.error.message) ? parsedErr.error.message : rawText;
            throw Object.assign(new Error("upstream_error"), { status, upstreamMsg, rawText });
          }
          const parsed = tryParseJSONLoose(rawText) ?? {};
          const extractedText = extractAssistantContent(rawText, parsed);
          if (!extractedText || extractedText.length === 0) {
            throw Object.assign(new Error("empty_content"), { status: 502, rawText });
          }
          return { ok: true, status, text: extractedText };
        } catch (e) {
          if (e && e.status === 404) {
            return { ok: false, status: 404, text: e.rawText || "model not found" };
          }
          if (isTransientNetworkError(e) && attempt < maxAttempts) {
            const delay = 500 * Math.pow(2, attempt - 1);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          if (e && e.upstreamMsg) {
            return { ok: false, status: e.status || 502, text: e.upstreamMsg || e.rawText || String(e) };
          }
          return { ok: false, status: e?.status || 502, text: e?.message || String(e) };
        }
      }
      return { ok: false, status: 504, text: "network timeout after retries" };
    }

    const modelsToTry = [configuredModel, ...fallbackModels.filter((m) => m !== configuredModel)];
    for (const model of modelsToTry) {
      const result = await tryModelWithRetries(model);
      if (result.ok) {
        return NextResponse.json({ content: result.text }, { status: 200 });
      }
      if (result.status === 404) {
        continue;
      } else {
        return NextResponse.json({ error: `OpenRouter error ${result.status}`, upstream: result.text }, { status: 502 });
      }
    }

    return NextResponse.json({ error: "OpenRouter: no working model available" }, { status: 502 });
  } catch (err) {
    const safeMsg = err && err.message ? String(err.message) : "AI service failed";
    return NextResponse.json({ error: safeMsg }, { status: 502 });
  }
}