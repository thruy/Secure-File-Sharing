import { useEffect, useState } from "react";
import { b64, u8 } from "./crypto";

function FileApp({ SERVER, currentUser, logout }) {
    const [files, setFiles] = useState([]);
    const [receiver, setReceiver] = useState("");
    const [file, setFile] = useState(null);

    const loadFiles = async () => {
        const res = await fetch(`${SERVER}/files?user=${currentUser}`);
        setFiles(await res.json());
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const uploadFile = async () => {
        if (!file) return alert("Chưa chọn file");

        const aes = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            aes,
            await file.arrayBuffer()
        );

        const pkRes = await fetch(`${SERVER}/public-key/${receiver}`);
        if (!pkRes.ok) return alert("Người nhận không tồn tại");

        const pubKey = await crypto.subtle.importKey(
            "spki",
            u8(await pkRes.text()),
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["encrypt"]
        );

        const encKey = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            pubKey,
            await crypto.subtle.exportKey("raw", aes)
        );

        const fd = new FormData();
        fd.append("file", new Blob([encrypted]));
        fd.append("filename", file.name);
        fd.append("iv", b64(iv));
        fd.append("key", b64(new Uint8Array(encKey)));
        fd.append("receiver", receiver);

        await fetch(`${SERVER}/upload`, { method: "POST", body: fd });
        alert("Upload thành công");
        loadFiles();
    };

    const downloadFile = async (id) => {
        const fileRes = await fetch(`${SERVER}/download/${id}`);
        const encrypted = await fileRes.arrayBuffer();

        const metaRes = await fetch(`${SERVER}/file-meta/${id}`);
        const meta = await metaRes.json();

        const priv = await crypto.subtle.importKey(
            "pkcs8",
            u8(localStorage.getItem("privateKey")),
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["decrypt"]
        );

        const aesRaw = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            priv,
            u8(meta.encKey)
        );

        const aes = await crypto.subtle.importKey(
            "raw",
            aesRaw,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        const plain = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: u8(meta.iv) },
            aes,
            encrypted
        );

        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([plain]));
        a.download = meta.filename;
        a.click();
    };

    return (
        <div>
            <h3>Hello {currentUser}</h3>
            <button onClick={logout}>Logout</button>

            <input placeholder="Receiver" onChange={e => setReceiver(e.target.value)} />
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button onClick={uploadFile}>Upload</button>

            {files.map(f => (
                <div key={f.id}>
                    {f.name}
                    <button onClick={() => downloadFile(f.id)}>Download</button>
                </div>
            ))}
        </div>
    );
}

export default FileApp;