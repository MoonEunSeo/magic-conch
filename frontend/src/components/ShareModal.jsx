// components/ShareModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ShareModal.css";
import kakaoIcon from "../assets/icons/kakao.svg";
import discordIcon from "../assets/icons/discord.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import smsIcon from "../assets/icons/sms.svg";

export default function ShareModal({ isOpen, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
        <motion.div
          className={`modal-backdrop ${isOpen ? "fade-in" : ""}`}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
          <motion.div
            className="share-modal"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <h3>🐚 어디로 공유할까요?</h3>
            <div className="share-buttons">
              <button onClick={() => onSelect("kakao")}>
                <img src={kakaoIcon} alt="KakaoTalk" />
                <span>카카오톡</span>
              </button>
              <button onClick={() => onSelect("discord")}>
                <img src={discordIcon} alt="Discord" />
                <span>디스코드</span>
              </button>
              <button onClick={() => onSelect("insta")}>
                <img src={instagramIcon} alt="Instagram" />
                <span>인스타그램</span>
              </button>
              <button onClick={() => onSelect("sms")}>
                <img src={smsIcon} alt="SMS" />
                <span>문자</span>
              </button>
            </div>
            <button className="close-btn" onClick={onClose}>
              닫기
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
