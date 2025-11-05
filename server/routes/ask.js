import express from "express";
import fetch from "node-fetch";
import { supabase } from "../utils/supabase.js";
import { PostHog } from "posthog-node";
import { promptTemplate } from "../utils/prompt.js";

const router = express.Router();

// 📈 PostHog 서버 SDK 초기화
const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: "https://app.posthog.com",
});

router.post("/", async (req, res) => {
  const { question, user_id, platform = "web" } = req.body || {};

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "질문이 비어 있어요." });
  }

  const prompt = promptTemplate(question);
  const start = Date.now();

  // ⏱️ 요청 타임아웃 (15초)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    // ⚙️ Groq API 호출
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "당신은 마법의 소라고동입니다." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 40,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // ✅ 응답 JSON 파싱 안전하게 처리
    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      console.error("⚠️ Groq 응답이 JSON이 아닙니다:", text.slice(0, 200));
      return res.status(502).json({ error: "Groq API 응답 형식 오류" });
    }

    if (!response.ok || !data?.choices?.length) {
      console.error("⚠️ Groq API 응답 오류:", data);
      return res.status(502).json({ error: "소라고동이 대답을 망설였어요." });
    }

    const answer = data.choices[0].message.content.trim();
    const responseTime = Date.now() - start;

    // 💾 Supabase 로그 저장
    const { error: dbError } = await supabase
      .from("questions_log")
      .insert([
        {
          question,
          answer,
          response_time_ms: responseTime,
          user_id,
          platform,
        },
      ]);

    if (dbError) {
      console.warn("⚠️ Supabase insert 실패:", dbError.message);
    }

    // 📊 PostHog 이벤트
    posthog.capture({
      distinctId: user_id || "anonymous",
      event: "ask_question",
      properties: {
        question_length: question.length,
        response_time: responseTime,
        platform,
      },
    });

    console.log(`✨ 질문: ${question} → 대답: ${answer} (${responseTime}ms)`);

    return res.status(200).json({ question, answer, responseTime });
  } catch (err) {
    clearTimeout(timeout);

    // 🧩 네트워크 or 타임아웃 구분 처리
    if (err.name === "AbortError") {
      console.error("⏰ Groq API 타임아웃:", err);
      return res
        .status(504)
        .json({ error: "응답이 너무 느려요. 잠시 후 다시 시도해주세요." });
    }

    console.error("🔥 ask API error:", err);
    return res.status(500).json({ error: "소라고동이 말을 거부했어요.. 😭" });
  }
});

export default router;
