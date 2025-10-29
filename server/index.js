import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import askRouter from "./routes/ask.js";
import saveRouter from "./routes/save.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ API 라우터는 정적 파일보다 위에 선언
app.use("/ask", askRouter);
app.use("/save", saveRouter);

// ✅ ESM 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 정적 파일 서빙 (빌드된 프론트 연결용)
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
// ✅ 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
