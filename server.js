const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = "users.json";

let users = {};

function fixUser(u){
    return {
        pass: u.pass,
        gold: u.gold ?? 50,
        hp: u.hp ?? 100,
        maxHP: u.maxHP ?? 100,
        level: u.level ?? 1,
        xp: u.xp ?? 0,
        classe: u.classe ?? "",
        inventario: u.inventario ?? []
    };
}

function load(){
    if(fs.existsSync(DB_FILE)){
        try{
            let raw = JSON.parse(fs.readFileSync(DB_FILE));
            for(let k in raw){
                raw[k] = fixUser(raw[k]);
            }
            users = raw;
        }catch(e){
            users = {};
        }
    }
}

function save(){
    fs.writeFileSync(DB_FILE, JSON.stringify(users,null,2));
}

load();

/* REGISTER */
app.post("/register",(req,res)=>{
    const {user,pass} = req.body;

    if(!user || !pass){
        return res.json({ok:false,msg:"Dados inválidos"});
    }

    if(users[user]){
        return res.json({ok:false,msg:"Usuário já existe"});
    }

    users[user] = fixUser({
        pass,
        gold:50,
        hp:100,
        maxHP:100,
        level:1,
        xp:0,
        classe:"",
        inventario:[]
    });

    save();
    return res.json({ok:true});
});

/* LOGIN */
app.post("/login",(req,res)=>{
    const {user,pass} = req.body;
    const u = users[user];

    if(!u || u.pass !== pass){
        return res.status(401).json({ok:false,msg:"Login inválido"});
    }

    const {pass:_, ...data} = fixUser(u);

    return res.json({ok:true,data});
});

/* SAVE */
app.post("/save",(req,res)=>{
    const {user,data} = req.body;

    if(!users[user]){
        return res.json({ok:false,msg:"Usuário não existe"});
    }

    users[user] = {
        ...users[user],
        ...fixUser(data)
    };

    save();
    return res.json({ok:true});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("🔥 RPG ONLINE RODANDO NA PORTA " + PORT);
});
