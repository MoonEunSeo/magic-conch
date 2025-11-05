declare module "./share" {
    export function shareToKakao(payload: any): void;
    export function shareToDiscord(payload: any): void;
    export function shareToInstagram(payload: any): void;
    export function shareToSMS(payload: any): void;
  }
  