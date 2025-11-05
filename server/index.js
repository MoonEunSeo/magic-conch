import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import askRouter from "./routes/ask.js";
import saveRouter from "./routes/save.js";

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:5173", // 개발용
  "https://magic-conch.vercel.app", // 배포 프론트 주소
];

app.use(
  cors({
    origin: function (origin, callback) {
      // 요청 origin이 없을 때(모바일 WebView 등)도 허용
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS 차단: 허용되지 않은 도메인"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.json());

//  API 라우터는 정적 파일보다 위에 선언
app.use("/ask", askRouter);
app.use("/save", saveRouter);

//  서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
