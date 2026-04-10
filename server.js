const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

let users = {};

app.post("/register", (req, res) => {
    const { user, pass } = req.body;

    if (users[user]) {
        return res.json({ ok: false, msg: "Usuário já existe!" });
    }

    users[user] = { pass };
    res.json({ ok: true });
});

app.post("/login", (req, res) => {
    const { user, pass } = req.body;

    if (!users[user] || users[user].pass !== pass) {
        return res.json({ ok: false });
    }

    res.json({ ok: true });
});

app.listen(3000, () => {
    console.log("Servidor rodando");
});