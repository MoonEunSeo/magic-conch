// utils/share.js
import html2canvas from "html2canvas";

// 📸 캡처 (이미지를 생성해서 각 플랫폼에 쓸 수 있게)
export async function captureResultCard() {
  const card = document.getElementById("result-card");
  if (!card) return null;

  const canvas = await html2canvas(card, {
    useCORS: true,
    scale: 2,
  });
  return canvas.toDataURL("image/png");
}

/** 🟣 디스코드 공유 */
export function shareToDiscord({ question, answer }) {
  const text = `🐚 마법의 소라고동이 이렇게 말했어요!\n> ${question}\n💬 ${answer}\nhttps://magic-conch.vercel.app`;
  const encoded = encodeURIComponent(text);
  window.open(`https://discord.com/channels/@me?message=${encoded}`, "_blank");
}

/** 🟡 카카오톡 공유 */
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
  const image = await captureResultCard();
  if (!image) return alert("이미지를 불러올 수 없습니다.");

  const blob = await (await fetch(image)).blob();
  const filesArray = [
    new File([blob], "magic-conch.png", { type: "image/png" }),
  ];

  if (navigator.canShare && navigator.canShare({ files: filesArray })) {
    await navigator.share({
      files: filesArray,
      title: "마법의 소라고동",
      text: `🐚 “${question}” → ${answer}`,
    });
  } else {
    alert("이 브라우저에서는 인스타그램 공유를 지원하지 않아요 😢");
  }
}

/** 💬 문자메시지 (SMS) */
export function shareToSMS({ question, answer }) {
  const message = `🐚 마법의 소라고동\n"${question}" → ${answer}\nhttps://magic-conch.vercel.app`;
  window.location.href = `sms:?body=${encodeURIComponent(message)}`;
}
