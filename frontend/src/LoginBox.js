import { useState } from "react";
import { u8, deriveKey } from "./crypto";

function LoginBox({ SERVER, onLogin, showRegister, setPrivateKey }) {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");

    const login = async () => {
        const res = await fetch(`${SERVER}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user,
                password: pass,
            }),
        });

        if (!res.ok) {
            alert("Sai username hoặc password");
            return;
        }

        const data = await res.json();

        // giải mã private key
        const aesKey = await deriveKey(pass, u8(data.salt));
        const privateKeyRaw = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: u8(data.iv) },
            aesKey,
            u8(data.encryptedPrivateKey)
        );

        const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            privateKeyRaw,
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["decrypt"]
        );

        // lưu privateKey trong memory (NOT localStorage)
        setPrivateKey(privateKey);
        onLogin(user);
    };


    return (
        <div className="card">
            <h2>🔐 Secure File Sharing</h2>
            <input placeholder="Username" onChange={e => setUser(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPass(e.target.value)} />
            <button className="primary" onClick={login}>Đăng nhập</button>

            <p className="small">
                Chưa có tài khoản?{" "}
                <a href="#" onClick={showRegister}>Đăng ký</a>
            </p>
        </div>
    );
}

export default LoginBox;
