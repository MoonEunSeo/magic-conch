// utils/uuid.js
export function getOrCreateUserUUID() {
    let uuid = localStorage.getItem("magic_conch_uuid");
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem("magic_conch_uuid", uuid);
    }
    return uuid;
  }
  