import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./App.css";

// 🐚 이미지 & 에셋
import conchFull from "./assets/conch_full.svg";
import conchErase from "./assets/conch_erase.svg";
import lineSvg from "./assets/line.svg";
import reloadButton from "./assets/reload_button.svg";
import saveButton from "./assets/save_button.svg";
import background from "./assets/background.svg";
import background_sponge from "./assets/spongebob-bg.svg";
import searchbar from "./assets/searchbar.svg";
import shareButton from "./assets/share-button.svg";

// 🧩 컴포넌트 & 유틸
import ShareModal from "./components/ShareModal";
import {
  shareToDiscord,
  shareToKakao,
  shareToInstagram,
  shareToSMS,
} from "./utils/share";
import { saveConchImage } from "./utils/saveImage"; // ✅ 새로 추가된 저장 함수

// 🌊 버블 애니메이션
function BubbleBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const bubble = document.createElement("div");
      bubble.classList.add("bubble");
      const size = Math.random() * 30 + 5;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${Math.random() * 15 + 8}s`;
      bubble.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(bubble);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div className="bubble-container" ref={containerRef}></div>;
}

// 🌀 메인 앱
function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isPulled, setIsPulled] = useState(false);
  const [bgImage, setBgImage] = useState(background);
  const [shareOpen, setShareOpen] = useState(false);

  // 🟡 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY);
      console.log("Kakao SDK initialized");
    }
  }, []);

  // 🐚 줄 당기기 핸들러
  const handlePull = async () => {
    if (!question.trim()) return;
    setIsPulled(true);
    setThinking(true);
    setAnswer("");
    setShowButtons(false);

    setTimeout(() => setIsPulled(false), 1000);

    // 스폰지밥 효과 (3초간만 적용)
    if (question.includes("스폰지밥")) {
      setBgImage(background_sponge);
      setTimeout(() => setBgImage(background), 3000);
    }

    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:4000";

    const res = await fetch(`${API_BASE_URL}/ask`, {
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
    <div
      className="app"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundColor: "#10003c",
        backgroundPosition: "center center",
        transition: "background-image 0.8s ease-in-out",
      }}
    >
      <BubbleBackground />

      {/* 🐚 소라고동 본체 */}
      <div className="conch-wrapper">
        <img src={conchFull} className="conch-full" />

        <motion.img
          src={lineSvg}
          className="line"
          drag="y"
          dragConstraints={{ top: 0, bottom: 120 }}
          dragElastic={0.6}
          whileTap={{ scale: 1.9 }}
          onDragEnd={handlePull}
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

      {/* 입력창 */}
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

      {/* 답변 영역 */}
      <div className="answer-area">
        {thinking && <p>🐚 소라고동이 생각 중...</p>}
        {!thinking && answer && <p>{answer}</p>}
      </div>

      {/* 버튼 영역 */}
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
          {/* ✅ 새 저장 방식 적용 */}
          <img
            src={saveButton}
            className="action-button"
            onClick={() => saveConchImage(question, answer)}
          />
          <img
            src={shareButton}
            className="action-button"
            onClick={() => setShareOpen(true)}
          />
        </div>
      )}

      {/* 공유 모달 */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        onSelect={(type) => {
          const payload = { question, answer };
          if (type === "kakao") shareToKakao(payload);
          else if (type === "discord") shareToDiscord(payload);
          else if (type === "insta") shareToInstagram(payload);
          else if (type === "sms") shareToSMS(payload);
          setShareOpen(false);
        }}
      />

      {/* 결과 카드 (렌더링용) */}
      {answer && (
        <div id="result-card" className="result-card">
          <img src="/download_graph.png" className="result-bg" alt="background" />
          <div className="question-text">{question}</div>
          <div className="answer-text">{answer}</div>
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
