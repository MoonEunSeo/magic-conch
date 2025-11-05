// routes/ask.js
import express from "express";
import fetch from "node-fetch";
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
        stream: true, 
      }),
    });

    if (!response.ok || !response.body) {
      console.error("Groq API Error:", await response.text());
      return res.status(502).json({ error: "Groq API 오류 발생" });
    }

    // ⚙️ SSE (Server-Sent Events) 헤더 세팅
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.(); // 일부 환경에서 스트림 활성화 강제

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // 🔁 스트리밍 루프
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const jsonStr = line.replace("data:", "").trim();
        if (jsonStr === "[DONE]") {
          res.write(`event: done\ndata: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const token = parsed?.choices?.[0]?.delta?.content;
          if (token) {
            fullAnswer += token;
            // 🪄 클라이언트로 토큰 전송
            res.write(`event: message\ndata: ${JSON.stringify({ token })}\n\n`);
          }
        } catch (e) {
          console.warn("⚠️ 스트림 파싱 실패:", e.message);
        }
      }
    }

    // 📊 응답시간 계산
    const responseTime = Date.now() - start;

    // 💾 Supabase 저장
    const { error: dbError } = await supabase.from("questions_log").insert([
      {
        question,
        answer: fullAnswer.trim(),
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
  } catch (err) {
    console.error("🔥 Streaming error:", err);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "스트리밍 중 오류 발생" })}\n\n`);
      res.end();
    } catch {}
  } finally {
    // 💨 연결 닫힘 시 안전 종료
    res.end();
  }
});

export default router;
