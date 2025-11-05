export function getOrCreateUserUUID() {
  try {
    // 서버사이드일 경우 즉시 리턴 (window undefined)
    if (typeof window === "undefined") {
      console.warn("⚠️ 서버 환경 — UUID 생성 생략");
      return "server_generated";
    }

    // 기존 값 가져오기
    let uuid = localStorage.getItem("magic_conch_uuid");

    // 없으면 새로 생성
    if (!uuid) {
      if (window.crypto?.randomUUID) {
        uuid = crypto.randomUUID();
      } else {
        // Safari 등 구형 브라우저 fallback
        uuid = "mc_" + Math.random().toString(36).substring(2, 15);
      }
      localStorage.setItem("magic_conch_uuid", uuid);
    }

    return uuid;
  } catch (err) {
    console.error("❌ UUID 생성 실패:", err);
    return "fallback_" + Date.now();
  }
}