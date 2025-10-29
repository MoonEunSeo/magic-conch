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
  const { question, user_id, platform = "web" } = req.body;

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "질문이 비어 있어요." });
  }

  const prompt = promptTemplate(question);
  const start = Date.now(); // ⚡ 응답 시간 측정 시작

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
    });

    const data = await response.json();

    if (!response.ok || !data?.choices?.length) {
      throw new Error("Groq API 응답 오류");
    }

    const answer = data.choices[0].message.content.trim();
    const responseTime = Date.now() - start;

    // 💾 Supabase 로그 저장
    const { error: dbError } = await supabase
      .from("questions_log")
      .insert([{ 
        question, 
        answer, 
        response_time_ms: responseTime, 
        user_id,
        platform 
      }]);

    if (dbError) console.error("🔥 Supabase insert error:", dbError.message);

    // 📊 PostHog 이벤트 기록
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

    return res.json({ question, answer, responseTime });
  } catch (error) {
    console.error("🔥 ask API error:", error);
    return res.status(500).json({ error: "소라고동이 말을 거부했어요.. 😭" });
  }
});

export default router;
