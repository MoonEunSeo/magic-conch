import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import askRouter from "./routes/ask.js";
import saveRouter from "./routes/save.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ API 라우터는 정적 파일보다 위에 선언
app.use("/ask", askRouter);
app.use("/save", saveRouter);

// ✅ 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
