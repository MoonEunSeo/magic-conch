export function getOrCreateUserUUID() {
  try {
    // 서버사이드일 경우 즉시 리턴
    if (typeof window === "undefined" || !window.localStorage) {
      console.warn("⚠️ 클라이언트 환경이 아님 — UUID 생성 생략");
      return null;
    }

    // 기존 값 가져오기
    let uuid = localStorage.getItem("magic_conch_uuid");

    // 없으면 새로 생성
    if (!uuid) {
      if (window.crypto?.randomUUID) {
        uuid = crypto.randomUUID();
      } else {
        uuid = "mc_" + Math.random().toString(36).substring(2, 15);
      }
      localStorage.setItem("magic_conch_uuid", uuid);
      console.log("🆕 새 UUID 생성:", uuid);
    } else {
      console.log("♻️ 기존 UUID 불러옴:", uuid);
    }

    return uuid;
  } catch (err) {
    console.error("❌ UUID 생성 실패:", err);
    return null;
  }
}
