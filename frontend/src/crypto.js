export const b64 = (u8) =>
    btoa(String.fromCharCode(...u8));

export const u8 = (b64str) =>
    new Uint8Array(atob(b64str).split("").map(c => c.charCodeAt(0)));