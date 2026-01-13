import { useState } from "react";
import { b64, deriveKey } from "./crypto";

function RegisterBox({ SERVER, showLogin }) {
    const [user, setUser] = useState("");
    const [pass1, setPass1] = useState("");
    const [pass2, setPass2] = useState("");

    const register = async () => {
        if (pass1 !== pass2) {
            alert("Password không khớp");
            return;
        }

        // 1. Sinh RSA keypair
        const kp = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );

        // 2. Export keys
        const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
        const publicKeyRaw = await crypto.subtle.exportKey("spki", kp.publicKey);

        // 3. Derive key từ password
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const aesKey = await deriveKey(pass1, salt);

        // 4. Encrypt private key
        const encryptedPrivateKey = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            aesKey,
            privateKeyRaw
        );

        // 5. Gửi lên server
        const res = await fetch(`${SERVER}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.trim(),
                password: pass1.trim(),
                publicKey: b64(new Uint8Array(publicKeyRaw)),
                encryptedPrivateKey: b64(new Uint8Array(encryptedPrivateKey)),
                iv: b64(iv),
                salt: b64(salt),
            }),
        });

        if (!res.ok) {
            alert("Username đã tồn tại");
            return;
        }

        alert("Đăng ký thành công");
        showLogin();
    };

    return (
        <div className="card">
            <h2>Đăng ký</h2>

            <input placeholder="Username" onChange={e => setUser(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPass1(e.target.value)} />
            <input type="password" placeholder="Confirm password" onChange={e => setPass2(e.target.value)} />

            <button className="primary" onClick={register}>Đăng ký</button>
            <button className="secondary" onClick={showLogin}>Quay lại</button>
        </div>
    );
}

export default RegisterBox;