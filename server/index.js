import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import askRouter from "./routes/ask.js";
import saveRouter from "./routes/save.js";

dotenv.config();
const app = express();
app.use(cors());
//json 파싱 미들웨어 적용
app.use(express.json());

// 라우트 연결
app.use("/ask", askRouter);
app.use("/save", saveRouter);




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
