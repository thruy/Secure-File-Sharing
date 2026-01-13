import { useState } from "react";

function LoginBox({ SERVER, onLogin, showRegister }) {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");

    const login = async () => {
        const res = await fetch(`${SERVER}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.trim(),
                password: pass.trim(),
            }),
        });

        if (!res.ok) {
            alert("Sai username hoặc password");
            return;
        }

        localStorage.setItem("user", user.trim());
        onLogin(user.trim());
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
