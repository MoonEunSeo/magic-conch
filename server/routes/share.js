// routes/share.js
import express from "express";
import { supabase } from "../utils/supabase.js";

const router = express.Router();

// 📦 공유 로그 저장
router.post("/", async (req, res) => {
  try {
    const { user_id, question, answer, platform } = req.body || {};

    if (!user_id || !question || !answer) {
      return res.status(400).json({ error: "필수 항목 누락" });
    }

    const { error } = await supabase.from("share_log").insert([
      {
        user_id,
        question,
        answer,
        platform,
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert 실패:", error.message);
      return res.status(500).json({ error: "DB 저장 실패" });
    }

    console.log(`📤 공유 로그 저장 완료 (${platform}) → ${user_id}`);
    res.status(200).json({ message: "공유 로그 저장 완료" });
  } catch (err) {
    console.error("🔥 /share API 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
