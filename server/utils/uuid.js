export function getOrCreateUserUUID() {
    try {
      let uuid = localStorage.getItem("magic_conch_uuid");
      if (!uuid) {
        if (window.crypto?.randomUUID) {
          uuid = crypto.randomUUID();
        } else {
          // fallback (Safari, Private Mode 등)
          uuid =
            "mc_" +
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        }
        localStorage.setItem("magic_conch_uuid", uuid);
      }
      return uuid;
    } catch (e) {
      console.warn("⚠️ UUID 생성 실패 (fallback 사용):", e);
      return "fallback_" + Date.now();
    }
  }