const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require('bcryptjs');
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const DB_PATH = "./db.json";

/* ===== DB UTILS ===== */
function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], files: [] }, null, 2));
    }
    const raw = fs.readFileSync(DB_PATH, "utf8").trim();
    if (!raw) {
        const init = { users: [], files: [] };
        fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2));
        return init;
    }
    return JSON.parse(raw);
}

function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

/* ===== REGISTER ===== */
app.post("/register", async (req, res) => {
    const { username, password, publicKey, encryptedPrivateKey, iv, salt } = req.body;

    if (!username || !password || !publicKey || !encryptedPrivateKey)
        return res.status(400).send("Invalid data");

    const db = loadDB();
    if (db.users.find(u => u.username === username))
        return res.status(400).send("User exists");

    const passwordHash = await bcrypt.hash(password, 10);

    db.users.push({
        username,
        passwordHash,
        publicKey,
        encryptedPrivateKey,
        iv,
        salt,
    });

    saveDB(db);
    res.send("OK");
});

/* ===== LOGIN ===== */
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();

    const user = db.users.find(u => u.username === username);
    if (!user) return res.sendStatus(401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.sendStatus(401);

    res.json({
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        iv: user.iv,
        salt: user.salt,
    });
});


/* ===== GET PUBLIC KEY ===== */
app.get("/public-key/:username", (req, res) => {
    const db = loadDB();
    const user = db.users.find(u => u.username === req.params.username);
    if (!user) return res.sendStatus(404);
    res.send(user.publicKey);
});

/* ===== UPLOAD ===== */
app.post("/upload", upload.single("file"), (req, res) => {
    const { receiver, filename, iv, key } = req.body;
    const db = loadDB();

    db.files.push({ id: Date.now().toString(), receiver, filename, path: req.file.path, iv, encKey: key });
    saveDB(db);
    res.send("OK");
});

/* ===== LIST FILES (CHỈ TRẢ FILE CỦA NGƯỜI NHẬN) ===== */
app.get("/files", (req, res) => {
    const user = req.query.user;
    const db = loadDB();

    const files = db.files
        .filter(f => f.receiver === user)
        .map(f => ({ id: f.id, name: f.filename }));

    res.json(files);
});

/* ===== DOWNLOAD ===== */
// app.get("/download/:id", (req, res) => {
//   const db = loadDB();
//   const file = db.files.find(f => f.id === req.params.id);
//   if (!file) return res.sendStatus(404);

//   const encrypted = fs.readFileSync(file.path);
//   res.json({ file: Array.from(encrypted), iv: file.iv, encKey: file.encKey, filename: file.filename });
// });

app.get("/download/:id", (req, res) => {
    const db = loadDB();
    const file = db.files.find(f => f.id === req.params.id);
    if (!file) return res.sendStatus(404);

    const encrypted = fs.readFileSync(file.path);
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(encrypted);
});

app.get("/file-meta/:id", (req, res) => {
    const db = loadDB();
    const file = db.files.find(f => f.id === req.params.id);
    if (!file) return res.sendStatus(404);

    res.json({
        iv: file.iv, encKey: file.encKey, filename: file.filename
    });
});

app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
