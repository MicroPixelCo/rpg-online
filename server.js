const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = "users.json";

/* =========================
   CARREGAR BANCO
========================= */
let users = {};

function load() {
    if (fs.existsSync(DB_FILE)) {
        try {
            users = JSON.parse(fs.readFileSync(DB_FILE));
        } catch (e) {
            users = {};
        }
    }
}

function save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

load();

/* =========================
   REGISTRO
========================= */
app.post("/register", (req, res) => {
    const { user, pass } = req.body;

    if (!user || !pass) {
        return res.json({ ok: false, msg: "Dados inválidos" });
    }

    if (users[user]) {
        return res.json({ ok: false, msg: "Usuário já existe!" });
    }

    users[user] = {
        pass,

        // 💰 economia
        gold: 50,

        // ❤️ vida
        hp: 100,
        maxHP: 100,

        // 🧠 RPG progressão
        level: 1,
        xp: 0,

        // 🧍 status
        classe: "",

        // 🎒 inventário
        inventario: []
    };

    save();
    res.json({ ok: true });
});

/* =========================
   LOGIN
========================= */
app.post("/login", (req, res) => {
    const { user, pass } = req.body;

    const u = users[user];

    if (!u || u.pass !== pass) {
        return res.json({ ok: false, msg: "Login inválido" });
    }

    res.json({
        ok: true,
        data: {
            gold: u.gold,
            hp: u.hp,
            maxHP: u.maxHP,
            level: u.level,
            xp: u.xp,
            classe: u.classe,
            inventario: u.inventario
        }
    });
});

/* =========================
   SALVAR
========================= */
app.post("/save", (req, res) => {
    const { user, data } = req.body;

    if (!users[user]) {
        return res.json({ ok: false, msg: "Usuário não existe" });
    }

    // merge seguro (evita crash)
    users[user] = {
        ...users[user],
        ...data
    };

    save();

    res.json({ ok: true });
});

/* =========================
   (BASE FUTURA PvP)
   depois podemos adicionar:
   /battle
   /matchmaking
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 RPG SERVER RODANDO NA PORTA " + PORT);
});
