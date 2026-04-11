const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = "users.json";

let users = {};

/* =========================
   FUNÇÃO SEGURA (ANTI BUG)
========================= */
function fixUser(u = {}) {
    return {
        pass: u.pass || "",
        gold: u.gold ?? 50,
        hp: u.hp ?? 100,
        maxHP: u.maxHP ?? 100,
        level: u.level ?? 1,
        xp: u.xp ?? 0,
        classe: u.classe ?? "",
        inventario: u.inventario ?? []
    };
}

/* =========================
   LOAD DB
========================= */
function load() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = JSON.parse(fs.readFileSync(DB_FILE));

            for (let u in raw) {
                raw[u] = fixUser(raw[u]);
            }

            users = raw;
        }
    } catch (err) {
        console.log("Erro ao carregar DB:", err);
        users = {};
    }
}

load();

/* =========================
   SAVE DB
========================= */
function save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

/* =========================
   REGISTER
========================= */
app.post("/register", (req, res) => {
    const { user, pass } = req.body;

    if (!user || !pass) {
        return res.json({ ok: false, msg: "Preencha todos os campos" });
    }

    if (users[user]) {
        return res.json({ ok: false, msg: "Usuário já existe" });
    }

    users[user] = fixUser({
        pass,
        gold: 50,
        hp: 100,
        maxHP: 100,
        level: 1,
        xp: 0,
        classe: "",
        inventario: []
    });

    save();

    return res.json({ ok: true });
});

/* =========================
   LOGIN
========================= */
app.post("/login", (req, res) => {
    const { user, pass } = req.body;

    const u = users[user];

    if (!u || u.pass !== pass) {
        return res.status(401).json({
            ok: false,
            msg: "Login inválido"
        });
    }

    const safeUser = fixUser(u);
    delete safeUser.pass;

    return res.json({
        ok: true,
        data: safeUser
    });
});

/* =========================
   SAVE GAME
========================= */
app.post("/save", (req, res) => {
    const { user, data } = req.body;

    if (!users[user]) {
        return res.json({ ok: false, msg: "Usuário não existe" });
    }

    users[user] = {
        ...users[user],
        ...fixUser(data)
    };

    save();

    return res.json({ ok: true });
});

/* =========================
   HEALTH CHECK (Render)
========================= */
app.get("/", (req, res) => {
    res.send("🔥 RPG SERVER ONLINE");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 RPG ONLINE RODANDO NA PORTA " + PORT);
});
