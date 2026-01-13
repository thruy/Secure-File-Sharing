import { useState } from "react";
import { b64 } from "./crypto";

function RegisterBox({ SERVER, showLogin }) {
    const [user, setUser] = useState("");
    const [pass1, setPass1] = useState("");
    const [pass2, setPass2] = useState("");

    const register = async () => {
        if (pass1 !== pass2) {
            alert("Password không khớp");
            return;
        }

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

        const priv = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
        localStorage.setItem("privateKey", b64(new Uint8Array(priv)));

        const pub = await crypto.subtle.exportKey("spki", kp.publicKey);

        const res = await fetch(`${SERVER}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.trim(),
                password: pass1.trim(),
                publicKey: b64(new Uint8Array(pub)),
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
