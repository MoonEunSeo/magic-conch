import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import askRouter from "./routes/ask.js";
import saveRouter from "./routes/save.js";



dotenv.config();
const app = express();

// ✅ JSON 파싱, CORS
app.use(express.json());
app.use(cors());

// ✅ 라우트 연결 (정적 파일보다 위에)
app.use("/ask", askRouter);
app.use("/save", saveRouter);

// ✅ 마지막에 정적 파일 서빙
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

// 서버 실행
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});