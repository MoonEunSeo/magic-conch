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
import background_sponge from "./assets/spongebob-bg.svg"
import shareButton from "./assets/share-button.svg";
import ShareModal from "./components/ShareModal";
import html2canvas from "html2canvas";

import { useEffect, useRef } from "react";

import {
  shareToDiscord,
  shareToKakao,
  shareToInstagram,
  shareToSMS,
} from "./utils/share";


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

    // cleanup: 중복 방지
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
  const [isPulled, setIsPulled] = useState(false); // 줄이 당겨졌는지 여부
  const [bgImage, setBgImage] = useState(background); //배경 
  const [shareOpen, setShareOpen] = useState(false);

// 📸 저장 기능 (1824×1237 고정 버전)
const handleSave = async () => {
  const original = document.getElementById("result-card");
  if (!original) return;

  // ✅ 캡처용 복제 DOM 생성
  const temp = original.cloneNode(true);
  temp.style.width = "1824px";
  temp.style.height = "1237px";
  temp.style.position = "absolute";
  temp.style.left = "-9999px"; // 화면에 보이지 않게 숨김
  temp.style.transform = "none"; // 스케일 영향 제거
  temp.style.fontSize = "40px"; // 폰트 고정
  temp.style.lineHeight = "1.4";
  temp.style.backgroundSize = "cover";
  temp.style.backgroundPosition = "center";
  temp.style.overflow = "hidden";

  document.body.appendChild(temp);

  // ✅ html2canvas 실행 (해상도 고정 + 고품질)
  const canvas = await html2canvas(temp, {
    useCORS: true,
    width: 1824,
    height: 1237,
    scale: 2, // 해상도 두 배로 렌더링해서 선명하게
  });

  const image = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = image;
  link.download = "magic-conch-result.png";
  link.click();

  document.body.removeChild(temp);
};

  // 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY);
      console.log("Kakao SDK initialized");
      
    }
  }, []);



  const handlePull = async () => {
    if (!question.trim()) return;
    setIsPulled(true);
    setThinking(true);
    setAnswer("");
    setShowButtons(false);

    // 1초 뒤 줄이 다시 원위치로 복귀
    setTimeout(() => setIsPulled(false), 1000);


    // 스폰지밥 효과 (3초간만 적용)
    if (question.includes("스폰지밥")) {
      setBgImage(background_sponge);
      setTimeout(() => setBgImage(background), 3000); // 3초 뒤 원래 배경 복귀
    }

    // 환경에 따라 백엔드 주소 자동 선택
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:4000";

    // AI 응답 요청
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
        backgroundColor: "#10003c", //여백 채움용
        backgroundPosition: "center center",
        transition: "background-image 0.8s ease-in-out",
      }}
    >
      <BubbleBackground />
      <div className="conch-wrapper">
        <img src={conchFull} className="conch-full" />

        {/* 줄 애니메이션 (땡기면 위치 바뀜) */}
          <motion.img
          src={lineSvg}
          className="line"
          drag="y"                            // 세로로 드래그 가능
          dragConstraints={{ top: 0, bottom: 120 }} // 드래그 가능한 거리
          dragElastic={0.6}                   // 당겼을 때 탄성감
          whileTap={{ scale: 1.90 }}          // 손으로 잡은 듯한 반응
          onDragEnd={handlePull}              // 드래그 끝나면 AI 호출
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
            onClick={handleSave}
          />
          <img
            src={shareButton}
            className="action-button"
            onClick={() => setShareOpen(true)}
          />
        </div>
      )}

      {/* 공유 모달 추가 */}
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

      {/* ✅ 캡처용 카드 */}
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
