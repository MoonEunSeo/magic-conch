import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import askRouter from "./routes/ask.js";
import saveRouter from "./routes/save.js";



dotenv.config();
const app = express();


// CORS 설정
app.use(cors({
    origin: process.env.CLIENT_URL || "*", // 필요 시 클라이언트 주소 지정
    credentials: true,
  }));


//json 파싱 미들웨어 적용
app.use(express.json());

// 라우트 연결
app.use("/ask", askRouter);
app.use("/save", saveRouter);



// 서버 실행
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});