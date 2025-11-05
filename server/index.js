// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 🧩 라우터 불러오기
import askRouter from "./routes/ask.js";
import saveRouter from "./routes/save.js";

dotenv.config();
const app = express();

// ✅ 허용할 도메인 (개발 + 배포)
const allowedOrigins = [
  "http://localhost:5173",
  "https://magic-conch.vercel.app",
  "https://magic-conch-omega.vercel.app",
];

// ✅ CORS 설정
app.use(
  cors({
    origin: function (origin, callback) {
      // 🪄 origin이 없을 때(예: 모바일 WebView)도 허용
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 차단된 Origin: ${origin}`);
        callback(new Error("CORS 차단: 허용되지 않은 도메인"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// ✅ JSON 파싱
app.use(express.json());

// ✅ 라우터 연결 (순서 중요)
app.use("/", askRouter);  // /ask → 질문/응답 처리
app.use("/save", saveRouter); // /save → 결과 저장용 (이미지 등)

// ✅ 헬스체크용 기본 라우트
app.get("/", (req, res) => {
  res.send("🐚 Magic Conch API is alive!");
});

// ✅ 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Magic Conch API server running on port ${PORT}`);
});
