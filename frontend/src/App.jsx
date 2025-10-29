import { useState } from "react";
import { motion, animate } from "framer-motion";
import "./App.css";

import conchFull from "./assets/conch_full.svg";
import conchErase from "./assets/conch_erase.svg";
import lineSvg from "./assets/line.svg";
import reloadButton from "./assets/reload_button.svg";
import saveButton from "./assets/save_button.svg";
import background from "./assets/background.svg";
import searchbar from "./assets/searchbar.svg";
import { useEffect, useRef } from "react";

function BubbleBackground() {
  const containerRef = useRef(null); // ✅ DOM 참조 생성

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return; // ✅ 안전하게 체크

    for (let i = 0; i < 15; i++) {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");

      // 랜덤 속성 지정
      const size = Math.random() * 30 + 5; // 5~35px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${Math.random() * 15 + 8}s`;
      bubble.style.animationDelay = `${Math.random() * 5}s`;

      container.appendChild(bubble);
    }

    // ✅ cleanup: 중복 방지
    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div className="bubble-container" ref={containerRef}></div>;
}


function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isPulled, setIsPulled] = useState(false); // ✅ 줄이 당겨졌는지 여부

  const handlePull = async () => {
    if (!question.trim()) return;
    setIsPulled(true);
    setThinking(true);
    setAnswer("");
    setShowButtons(false);

    // 1초 뒤 줄이 다시 원위치로 복귀
    setTimeout(() => setIsPulled(false), 1000);

    // 🧠 AI 응답 요청
    const res = await fetch("http://localhost:4000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer);
    setThinking(false);
    setTimeout(() => setShowButtons(true), 2000);
  };

  return (
    <div className="app" style={{ backgroundImage: `url(${background})` }}>
      <BubbleBackground />
      <div className="conch-wrapper">
        <img src={conchFull} className="conch-full" />

        {/* 줄 애니메이션 (땡기면 위치 바뀜) */}
          <motion.img
          src={lineSvg}
          className="line"
          drag="y"                            // ✅ 세로로 드래그 가능
          dragConstraints={{ top: 0, bottom: 120 }} // ✅ 드래그 가능한 거리
          dragElastic={0.6}                   // ✅ 당겼을 때 탄성감
          whileTap={{ scale: 1.90 }}          // ✅ 손으로 잡은 듯한 반응
          onDragEnd={handlePull}              // ✅ 드래그 끝나면 AI 호출
          animate={{
            top: isPulled ? "19%" : "25%",
            left: isPulled ? "70%" : "30%",
          }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 15,
          }}
        />

        <img src={conchErase} className="conch-erase" />
      </div>

      <div className="input-section">
        <img src={searchbar} className="searchbar" />
        <input
          type="text"
          className="question-input"
          placeholder="질문을 입력하고 줄을 당겨보세요"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div className="answer-area">
        {thinking && <p>🐚 소라고동이 생각 중...</p>}
        {!thinking && answer && <p>{answer}</p>}
      </div>

      {showButtons && (
        <div className="button-area">
          <img
            src={reloadButton}
            className="action-button"
            onClick={() => {
              setQuestion("");
              setAnswer("");
              setShowButtons(false);
            }}
          />
          <img
            src={saveButton}
            className="action-button"
            onClick={() => alert("저장되었습니다! (임시)") }
          />
        </div>
      )}

<footer>
  본 사이트는 팬이 만든 비상업적 프로젝트이며,<br />
  Nickelodeon 또는 <em>SpongeBob SquarePants</em>와 무관합니다.<br />
  © 2025 Norang. All rights reserved. |{" "}
  <a
    href="https://telepathy.my"
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "rgba(255,255,255,0.9)", textDecoration: "underline" }}
  >
    텔레파시 바로가기
  </a>
</footer>
    </div>
  );
}

export default App;
