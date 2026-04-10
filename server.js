const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = "users.json";

let users = {};
if (fs.existsSync(DB_FILE)) {
    users = JSON.parse(fs.readFileSync(DB_FILE));
}

function save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

// REGISTRO
app.post("/register", (req, res) => {
    const { user, pass } = req.body;

    if (users[user]) {
        return res.json({ ok: false, msg: "Usuário já existe!" });
    }

    users[user] = {
        pass,
        gold: 50,
        classe: "",
        hp: 100,
        inventario: []
    };

    save();
    res.json({ ok: true });
});

// LOGIN
app.post("/login", (req, res) => {
    const { user, pass } = req.body;

    if (!users[user] || users[user].pass !== pass) {
        return res.json({ ok: false, msg: "Login inválido" });
    }

    res.json({ ok: true, data: users[user] });
});

// SALVAR
app.post("/save", (req, res) => {
    const { user, data } = req.body;

    if (!users[user]) {
        return res.json({ ok: false });
    }

    users[user] = {
        ...users[user],
        ...data
    };

    save();

    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});
