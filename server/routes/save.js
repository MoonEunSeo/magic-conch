import express from "express";
import { supabase } from "../utils/supabase.js";
import { PostHog } from "posthog-node";

const router = express.Router();

// 📈 PostHog 서버 SDK 초기화
const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: "https://app.posthog.com",
});

router.post("/", async (req, res) => {
  try {
    const { question, answer, user_id } = req.body; // user_id도 함께 받기

    // ✅ 기본 유효성 검사
    if (!question || !answer) {
      return res.status(400).json({ error: "question과 answer가 모두 필요합니다." });
    }

    // 📊 PostHog 이벤트 기록
    posthog.capture({
      distinctId: user_id || "anonymous",
      event: "save_answer",
      properties: {
        question,
        answer_length: answer.length,
      },
    });

    // 💾 Supabase Insert
    const { data, error } = await supabase
      .from("questions_log")
      .insert([{ question, answer, user_id }])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "질문과 답변이 성공적으로 저장되었습니다!",
      saved: data[0],
    });

  } catch (error) {
    console.error("🔥 save API error:", error.message);
    res.status(500).json({ error: "데이터 저장 중 오류가 발생했습니다." });
  }
});

export default router;
