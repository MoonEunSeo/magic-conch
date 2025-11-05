// routes/ask.js
import express from "express";
//import fetch from "node-fetch"; - node18이상인 경우 필요없음
import { supabase } from "../utils/supabase.js";
import { PostHog } from "posthog-node";
import { promptTemplate } from "../utils/prompt.js";

const router = express.Router();

// 📊 PostHog 초기화
const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: "https://app.posthog.com",
});

// 🧠 메인 라우터: /ask
router.post("/ask", async (req, res) => {
  const { question, user_id, platform = "web", sentiment } = req.body || {};

  console.log("🧭 user_id received:", user_id);
  console.log("📩 full body:", req.body);

  if (!question?.trim()) {
    return res.status(400).json({ error: "질문이 비어 있어요." });
  }

  const prompt = promptTemplate(question);
  const start = Date.now();
  let fullAnswer = "";

  try {
    // 🧩 Groq API 요청 (스트리밍 모드)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "너는 마법의 소라고동이다. 반드시 10글자 이하로, 한 문장으로만 대답한다. 말투는 신비롭고 단호하다." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 30,
        stream: false, //스트리밍 안써 
      }),
    });

    if (!response.ok || !response.body) {
      console.error("Groq API Error:", await response.text());
      return res.status(502).json({ error: "Groq API 오류 발생" });
    }

    // 📊 응답시간 계산
    const responseTime = Date.now() - start;

    // 💾 Supabase 저장
    const { error: dbError } = await supabase.from("questions_log").insert([
      {
        question,
        answer: fullAnswer,
        response_time_ms: responseTime,
        user_id,
        platform,
        sentiment,
      },
    ]);

    if (dbError) {
      console.warn("⚠️ Supabase insert 실패:", dbError.message);
    }

    // 📈 PostHog 이벤트 전송
    posthog.capture({
      distinctId: user_id || "anonymous",
      event: "ask_question",
      properties: {
        question_length: question.length,
        response_time: responseTime,
        platform,
      },
    });

    console.log(`✨ ${question} → ${fullAnswer}`);

    // ✅ 단일 JSON 응답
    res.status(200).json({ answer: fullAnswer });
  } catch (err) {
    console.error("🔥 API Error:", err);
    res.status(500).json({ error: "응답 생성 중 오류가 발생했습니다." });
  }
});

export default router;