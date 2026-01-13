export const b64 = (u8) =>
    btoa(String.fromCharCode(...u8));

export const u8 = (b64str) =>
    new Uint8Array(atob(b64str).split("").map(c => c.charCodeAt(0)));

export async function deriveKey(password, salt) {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}