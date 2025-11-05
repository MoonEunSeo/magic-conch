// utils/share.js

/** 디스코드 공유 */
export function shareToDiscord({ question, answer }) {
  const text = `🐚 마법의 소라고동이 이렇게 말했어요!\n> ${question}\n💬 ${answer}\nhttps://magic-conch.vercel.app`;
  navigator.clipboard.writeText(text)
    .then(() => alert("복사 완료! Discord에서 붙여넣기 해보세요 💬"))
    .catch(() => alert("클립보드 복사 실패 😢"));
}

/** 카카오톡 공유 */
export function shareToKakao({ question, answer }) {
  if (!window.Kakao?.isInitialized()) {
    window.Kakao.init(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY);
  }

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: "🐚 마법의 소라고동의 대답",
      description: `“${question}” → 💬 ${answer}`,
      imageUrl: "https://magic-conch.vercel.app/conch-thumbnail.png",
      link: {
        mobileWebUrl: "https://magic-conch.vercel.app",
        webUrl: "https://magic-conch.vercel.app",
      },
    },
    buttons: [
      {
        title: "🐚 나도 물어보기",
        link: {
          mobileWebUrl: "https://magic-conch.vercel.app",
          webUrl: "https://magic-conch.vercel.app",
        },
      },
    ],
  });
}

/** 🩷 인스타그램 공유 (스토리 전용) */
export async function shareToInstagram({ question, answer }) {
  try {
    const response = await fetch("/download_graph.png"); // 고정된 배경 PNG 불러오기
    const blob = await response.blob();
    const file = new File([blob], "magic-conch.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "마법의 소라고동",
        text: `🐚 “${question}” → ${answer}`,
      });
    } else {
      alert("현재 브라우저는 인스타그램 스토리 공유를 지원하지 않아요 😢");
    }
  } catch (err) {
    console.error("인스타그램 공유 오류:", err);
    alert("이미지를 불러올 수 없습니다 😢");
  }
}

/** 💬 문자메시지 (SMS) */
export function shareToSMS({ question, answer }) {
  const message = `🐚 마법의 소라고동\n"${question}" → ${answer}\nhttps://magic-conch.vercel.app`;
  window.location.href = `sms:?body=${encodeURIComponent(message)}`;
}
