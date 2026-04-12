// server.js - Professional RPG Backend
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(__dirname));

// ===== CONFIGURATION =====
const DB_FILE = path.join(__dirname, "users.json");
const BACKUP_DIR = path.join(__dirname, "backups");
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, "logs.txt");

// ===== DATABASE =====
let users = {};

// ===== LOGGING SYSTEM =====
function log(level, message, data = "") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level}: ${message} ${data}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (err) {
    console.error("Erro ao escrever log:", err);
  }
  
  console.log(logMessage);
}

// ===== DATA VALIDATION =====
function validateUsername(user) {
  if (!user) return { valid: false, msg: "Usuário vazio" };
  if (user.length < 3) return { valid: false, msg: "Mínimo 3 caracteres" };
  if (user.length > 20) return { valid: false, msg: "Máximo 20 caracteres" };
  if (!/^[a-zA-Z0-9_-]+$/.test(user)) return { valid: false, msg: "Apenas letras, números e _ -" };
  return { valid: true };
}

function validatePassword(pass) {
  if (!pass) return { valid: false, msg: "Senha vazia" };
  if (pass.length < 4) return { valid: false, msg: "Mínimo 4 caracteres" };
  if (pass.length > 50) return { valid: false, msg: "Máximo 50 caracteres" };
  return { valid: true };
}

function validateEmail(email) {
  if (!email) return { valid: true }; // Email opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { valid: emailRegex.test(email) };
}

// ===== USER DATA STRUCTURE =====
function createNewUser(pass, email = "") {
  return {
    pass,
    email,
    gold: 1000,
    hp: 100,
    maxHP: 100,
    dmg: 10,
    def: 0,
    level: 1,
    exp: 0,
    classe: "mage",
    inventory: {
      weapons: [],
      armor: [],
      accessories: [],
      potions: [],
      skills: []
    },
    equipped: {
      weapon: null,
      armor: null,
      accessory: null
    },
    stats: {
      wins: 0,
      losses: 0,
      waveRecord: 0,
      totalGoldEarned: 0,
      totalDamageDealt: 0,
      timeSpent: 0
    },
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    achievements: []
  };
}

function fixUser(u = {}) {
  const base = createNewUser(u.pass || "", u.email || "");
  return {
    ...base,
    ...u,
    inventory: u.inventory || base.inventory,
    equipped: u.equipped || base.equipped,
    stats: { ...base.stats, ...u.stats },
    achievements: u.achievements || []
  };
}

// ===== BACKUP SYSTEM =====
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function createBackup() {
  ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
  
  try {
    fs.copyFileSync(DB_FILE, backupFile);
    log("INFO", "Backup criado", backupFile);
    
    // Manter apenas últimos 10 backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith("backup-"))
      .sort()
      .reverse();
    
    if (files.length > 10) {
      files.slice(10).forEach(f => {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
      });
    }
  } catch (err) {
    log("ERROR", "Erro ao criar backup", err.message);
  }
}

// ===== DATABASE OPERATIONS =====
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      
      for (let username in raw) {
        raw[username] = fixUser(raw[username]);
      }
      
      users = raw;
      log("INFO", "Database carregado", `${Object.keys(users).length} usuários`);
    } else {
      users = {};
      log("INFO", "Novo database criado");
    }
  } catch (err) {
    log("ERROR", "Erro ao carregar DB", err.message);
    users = {};
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
    log("INFO", "Database salvo");
  } catch (err) {
    log("ERROR", "Erro ao salvar DB", err.message);
  }
}

function getUserCount() {
  return Object.keys(users).length;
}

function getTotalStats() {
  let total = {
    users: getUserCount(),
    totalGold: 0,
    totalPlayers: 0,
    avgLevel: 0
  };

  for (let u in users) {
    total.totalGold += users[u].gold || 0;
    total.totalPlayers++;
  }

  return total;
}

// ===== AUTHENTICATION =====
app.post("/register", (req, res) => {
  try {
    const { user, pass, email } = req.body;

    // Validações
    const userVal = validateUsername(user);
    if (!userVal.valid) {
      log("WARN", "Registro falhou - username inválido", user);
      return res.status(400).json({ ok: false, msg: userVal.msg });
    }

    const passVal = validatePassword(pass);
    if (!passVal.valid) {
      log("WARN", "Registro falhou - password inválida", user);
      return res.status(400).json({ ok: false, msg: passVal.msg });
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      log("WARN", "Registro falhou - email inválido", user);
      return res.status(400).json({ ok: false, msg: "Email inválido" });
    }

    // Verificar duplicata
    if (users[user]) {
      log("WARN", "Registro falhou - usuário existe", user);
      return res.status(409).json({ ok: false, msg: "Usuário já existe" });
    }

    // Criar novo usuário
    users[user] = createNewUser(pass, email);
    saveDatabase();
    
    log("INFO", "Novo usuário registrado", user);

    return res.status(201).json({
      ok: true,
      msg: "Conta criada com sucesso!"
    });

  } catch (err) {
    log("ERROR", "Erro no /register", err.message);
    return res.status(500).json({ ok: false, msg: "Erro interno do servidor" });
  }
});

app.post("/login", (req, res) => {
  try {
    const { user, pass } = req.body;

    // Validações básicas
    if (!user || !pass) {
      log("WARN", "Login falhou - campos vazios");
      return res.status(400).json({ ok: false, msg: "Preencha todos os campos" });
    }

    // Verificar usuário
    const u = users[user];
    if (!u) {
      log("WARN", "Login falhou - usuário não existe", user);
      return res.status(401).json({ ok: false, msg: "Usuário ou senha inválidos" });
    }

    // Verificar senha
    if (u.pass !== pass) {
      log("WARN", "Login falhou - senha incorreta", user);
      return res.status(401).json({ ok: false, msg: "Usuário ou senha inválidos" });
    }

    // Atualizar último login
    u.lastLogin = new Date().toISOString();
    saveDatabase();

    // Preparar dados seguros (sem password)
    const safeUser = { ...u };
    delete safeUser.pass;

    log("INFO", "Login bem-sucedido", user);

    return res.json({
      ok: true,
      msg: "Login bem-sucedido",
      data: safeUser
    });

  } catch (err) {
    log("ERROR", "Erro no /login", err.message);
    return res.status(500).json({ ok: false, msg: "Erro interno do servidor" });
  }
});

// ===== GAME OPERATIONS =====
app.post("/save", (req, res) => {
  try {
    const { user, data } = req.body;

    // Validações
    if (!user || !data) {
      log("WARN", "Save falhou - dados incompletos", user);
      return res.status(400).json({ ok: false, msg: "Dados incompletos" });
    }

    if (!users[user]) {
      log("WARN", "Save falhou - usuário não existe", user);
      return res.status(404).json({ ok: false, msg: "Usuário não encontrado" });
    }

    // Atualizar dados
    users[user] = fixUser({
      ...users[user],
      ...data
    });

    saveDatabase();
    log("INFO", "Game salvo", user);

    return res.json({ ok: true, msg: "Jogo salvo com sucesso" });

  } catch (err) {
    log("ERROR", "Erro no /save", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao salvar jogo" });
  }
});

app.get("/player/:user", (req, res) => {
  try {
    const { user } = req.params;

    if (!users[user]) {
      return res.status(404).json({ ok: false, msg: "Jogador não encontrado" });
    }

    const safeUser = { ...users[user] };
    delete safeUser.pass;

    log("INFO", "Perfil acessado", user);

    return res.json({ ok: true, data: safeUser });

  } catch (err) {
    log("ERROR", "Erro no /player", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao buscar jogador" });
  }
});

app.get("/leaderboard", (req, res) => {
  try {
    const leaderboard = Object.entries(users)
      .map(([name, data]) => ({
        name,
        level: data.level || 0,
        gold: data.gold || 0,
        wins: data.stats?.wins || 0,
        waveRecord: data.stats?.waveRecord || 0
      }))
      .sort((a, b) => (b.level + b.wins * 10 + b.waveRecord * 5) - (a.level + a.wins * 10 + a.waveRecord * 5))
      .slice(0, 50);

    log("INFO", "Leaderboard acessado");

    return res.json({ ok: true, data: leaderboard });

  } catch (err) {
    log("ERROR", "Erro no /leaderboard", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao buscar leaderboard" });
  }
});

app.post("/add-gold", (req, res) => {
  try {
    const { user, amount } = req.body;

    if (!users[user]) {
      return res.status(404).json({ ok: false, msg: "Usuário não encontrado" });
    }

    if (amount <= 0 || amount > 100000) {
      return res.status(400).json({ ok: false, msg: "Valor inválido" });
    }

    users[user].gold += amount;
    users[user].stats.totalGoldEarned += amount;

    saveDatabase();
    log("INFO", "Ouro adicionado", `${user}: +${amount}`);

    return res.json({ ok: true, gold: users[user].gold });

  } catch (err) {
    log("ERROR", "Erro no /add-gold", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao adicionar ouro" });
  }
});

app.post("/add-item", (req, res) => {
  try {
    const { user, item } = req.body;

    if (!users[user]) {
      return res.status(404).json({ ok: false, msg: "Usuário não encontrado" });
    }

    if (!item || !item.type) {
      return res.status(400).json({ ok: false, msg: "Item inválido" });
    }

    const itemType = item.type + "s"; // weapons, armor, etc
    if (!users[user].inventory[itemType]) {
      users[user].inventory[itemType] = [];
    }

    users[user].inventory[itemType].push(item);
    saveDatabase();

    log("INFO", "Item adicionado", `${user}: ${item.name}`);

    return res.json({ ok: true, inventory: users[user].inventory });

  } catch (err) {
    log("ERROR", "Erro no /add-item", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao adicionar item" });
  }
});

app.post("/update-stats", (req, res) => {
  try {
    const { user, stats } = req.body;

    if (!users[user]) {
      return res.status(404).json({ ok: false, msg: "Usuário não encontrado" });
    }

    users[user].stats = {
      ...users[user].stats,
      ...stats
    };

    saveDatabase();
    log("INFO", "Stats atualizados", user);

    return res.json({ ok: true, stats: users[user].stats });

  } catch (err) {
    log("ERROR", "Erro no /update-stats", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao atualizar stats" });
  }
});

// ===== ADMIN ENDPOINTS =====
app.get("/admin/stats", (req, res) => {
  try {
    const stats = getTotalStats();
    
    log("INFO", "Admin stats acessado");

    return res.json({ ok: true, data: stats });

  } catch (err) {
    log("ERROR", "Erro no /admin/stats", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao buscar estatísticas" });
  }
});

app.post("/admin/backup", (req, res) => {
  try {
    createBackup();
    
    log("INFO", "Backup manual criado");

    return res.json({ ok: true, msg: "Backup criado com sucesso" });

  } catch (err) {
    log("ERROR", "Erro ao criar backup", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao criar backup" });
  }
});

app.get("/admin/users", (req, res) => {
  try {
    const userList = Object.entries(users).map(([name, data]) => ({
      name,
      level: data.level,
      gold: data.gold,
      classe: data.classe,
      createdAt: data.createdAt,
      lastLogin: data.lastLogin
    }));

    log("INFO", "Lista de usuários acessada");

    return res.json({ ok: true, data: userList });

  } catch (err) {
    log("ERROR", "Erro no /admin/users", err.message);
    return res.status(500).json({ ok: false, msg: "Erro ao buscar usuários" });
  }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  log("ERROR", "Erro não capturado", err.message);
  res.status(500).json({ ok: false, msg: "Erro interno do servidor" });
});

app.get("*", (req, res) => {
  res.status(404).json({ ok: false, msg: "Rota não encontrada" });
});

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.json({
    status: "🔥 RPG SERVER ONLINE",
    version: "2.0",
    users: getUserCount(),
    timestamp: new Date().toISOString()
  });
});

// ===== AUTO BACKUP =====
setInterval(() => {
  createBackup();
}, 60 * 60 * 1000); // A cada 1 hora

// ===== START SERVER =====
loadDatabase();

const server = app.listen(PORT, () => {
  log("INFO", "🔥 RPG ONLINE RODANDO", `Porta ${PORT}`);
  log("INFO", "Banco de dados", `${getUserCount()} usuários carregados`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on("SIGINT", () => {
  log("INFO", "Servidor encerrando...");
  saveDatabase();
  createBackup();
  server.close(() => {
    log("INFO", "Servidor encerrado");
    process.exit(0);
  });
});

module.exports = app;
