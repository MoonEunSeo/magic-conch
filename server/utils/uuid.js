// utils/uuid.js
export function getOrCreateUserUUID() {
    let uuid = localStorage.getItem("magic_conch_uuid");
    if (!uuid) {
      if (window.crypto?.randomUUID) {
        uuid = crypto.randomUUID();
      } else {
        // Safari fallback
        uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
      }
      localStorage.setItem("magic_conch_uuid", uuid);
    }
    return uuid;
  }