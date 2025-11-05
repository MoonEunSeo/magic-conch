// routes/save.js
import express from "express";
import { supabase } from "../utils/supabase.js";
import { PostHog } from "posthog-node";

const router = express.Router();

// 📊 PostHog 서버 SDK 초기화
const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: "https://app.posthog.com",
});

router.post("/", async (req, res) => {
  try {
    const { question, answer, user_id } = req.body || {};

    // ✅ 유효성 검사
    if (!question?.trim() || !answer?.trim()) {
      return res
        .status(400)
        .json({ error: "❌ question과 answer는 필수 입력값입니다." });
    }

    // 🔍 기존에 같은 question + answer가 존재하는지 확인 (중복 방지)
    const { data: existing, error: checkError } = await supabase
      .from("questions_log")
      .select("id, created_at")
      .eq("question", question)
      .eq("answer", answer)
      .maybeSingle();

    if (checkError) {
      console.warn("⚠️ 중복 검사 실패:", checkError.message);
    }

    if (existing) {
      return res.status(200).json({
        message: "ℹ️ 이미 저장된 질문과 답변입니다.",
        saved: existing,
      });
    }

    // 💾 Supabase Insert
    const { data, error } = await supabase
      .from("questions_log")
      .insert([{ question, answer, user_id }])
      .select();

    if (error) throw error;

    const saved = data?.[0];

    // 📈 PostHog 이벤트 (저장 성공 시만 전송)
    posthog.capture({
      distinctId: user_id || "anonymous",
      event: "save_answer",
      properties: {
        question_length: question.length,
        answer_length: answer.length,
        platform: "web",
      },
    });

    console.log(`💾 저장 완료 → ${question} → ${answer}`);

    res.status(201).json({
      message: "질문과 답변이 성공적으로 저장되었습니다!",
      saved,
    });
  } catch (error) {
    console.error("🔥 save API error:", error);
    res
      .status(500)
      .json({ error: "데이터 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
});

export default router;
