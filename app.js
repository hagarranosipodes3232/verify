require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const web = express();

const server = http.createServer(web);
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("🟢 Dashboard conectado por Socket.IO:", socket.id);
});
web.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB conectado"))
.catch(err => console.log(err));

const verifiedUserSchema = new mongoose.Schema({
  discord: String,
  discordId: String,
  avatar: String,
  ip: String,
  pais: String,
  region: String,
  ciudad: String,
  lat: Number,
  lon: Number,
  isp: String,
  vpn: String,
  dispositivo: String,
  sistema: String,
  navegador: String,
  sospechosa: String,
  nitro: String
});

const VerifiedUser = mongoose.model("VerifiedUser", verifiedUserSchema);

web.post("/api/verify", async (req, res) => {
  try {
    const nuevoUsuario = new VerifiedUser(req.body);

await nuevoUsuario.save();

io.emit("new-user", nuevoUsuario);

res.json({
  ok: true,
      mensaje: "Usuario guardado correctamente",
      usuario: nuevoUsuario
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

web.get("/debug-users", async (req, res) => {
  try {
    const users = await VerifiedUser.find().sort({ _id: -1 }).limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PAGINA PRINCIPAL

web.get("/", (req, res) => {

  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<script src="https://unpkg.com/globe.gl"></script>
  <meta charset="UTF-8">
  <title>MVS Verify</title>

  <style>
    body {
      margin: 0;
      background: #101114;
      color: white;
      font-family: Arial, sans-serif;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

       width: 500px;
      background: #24262b;
      border-radius: 18px;
      text-align: center;
      padding: 35px;
      box-shadow: 0 0 45px rgba(0,0,0,.55);
      border-top: 4px solid #66865c;
    }

    h1 span {
      color: #6f9365;
    }

    .btn {
      display: block;
      margin-top: 28px;
      padding: 16px;
      border-radius: 10px;
      background: #6f9365;
      color: white;
      text-decoration: none;
      font-weight: bold;
    }
.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: #1b1e24;
  padding: 20px;
  border-radius: 15px;
}
.modal {
  display: none;
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
}

.modal-content {
  background: #111827;
  padding: 20px;
  width: 400px;
  margin: 10% auto;
  border-radius: 12px;
  color: white;
}

.modal textarea {
  width: 100%;
  height: 120px;
  margin-top: 10px;
  background: #0f172a;
  color: white;
  border: 1px solid #7c3aed;
  border-radius: 8px;
  padding: 10px;
}
.status{
  margin-top:10px;
  font-size:14px;
  line-height:1.7;
  color:#d1d5db;
}
.live-banner{
  width:100%;
  padding:35px;
  margin-top:20px;
  margin-bottom:20px;
  border-radius:20px;
  background:linear-gradient(135deg, rgba(123,92,255,.15), rgba(0,0,0,.2));
  border:1px solid rgba(123,92,255,.35);
  text-align:center;
  animation:pulseGlow 3s infinite;
}

.live-banner h1{
  font-size:42px;
  color:white;
  margin:0;
  letter-spacing:3px;
}

.live-banner p{
  color:#a78bfa;
  margin-top:10px;
}

@keyframes pulseGlow{
  0%{
    box-shadow:0 0 15px rgba(123,92,255,.15);
  }

  50%{
    box-shadow:0 0 35px rgba(123,92,255,.35);
  }

  100%{
    box-shadow:0 0 15px rgba(123,92,255,.15);
  }
}
.top-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:20px;
  width:100%;
}
.system-clock{
  margin-left:auto;
  text-align:right;
  background:#151821;
  padding:12px 16px;
  border-radius:12px;
  border:1px solid rgba(34,197,94,.35);
  box-shadow:0 0 18px rgba(34,197,94,.18);
  font-size:14px;
}

.bot-active{
  margin-top:6px;
  color:#22c55e;
  font-weight:bold;
  letter-spacing:1px;
}

.pulse-dot{
  animation: blinkSlow 1.8s infinite;
}

@keyframes blinkSlow{
  0%{ opacity:1; }
  50%{ opacity:.25; }
  100%{ opacity:1; }
}
.top-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:20px;
  width:100%;
}

.system-clock{
  margin-left:auto;
  text-align:right;
  background:#151821;
  padding:12px 16px;
  border-radius:12px;
  border:1px solid rgba(34,197,94,.35);
  box-shadow:0 0 18px rgba(34,197,94,.18);
  font-size:14px;
}

.bot-active{
  margin-top:6px;
  color:#22c55e;
  font-weight:bold;
  letter-spacing:1px;
}

.pulse-dot{
  animation: blinkSlow 1.8s infinite;
}

@keyframes blinkSlow{
  0%{ opacity:1; }
  50%{ opacity:.25; }
  100%{ opacity:1; }
}
.server-status-box{
  background:#111827;
  border:1px solid rgba(34,197,94,.35);
  box-shadow:0 0 25px rgba(34,197,94,.18);
  border-radius:16px;
  padding:18px 22px;
  margin-bottom:20px;
}

.server-status-box h3{
  margin-top:0;
  color:#22c55e;
}

.server-status-box p{
  margin:7px 0;
  color:#e5e7eb;
}
.globo-box{
  width:100%;
  height:550px;
  background:#050b12;
  border:1px solid rgba(0,255,170,.25);
  border-radius:20px;
  overflow:hidden;
  margin-bottom:25px;
  position:relative;

  box-shadow:
  0 0 35px rgba(0,255,170,.15);
}

#globo3d{
  width:100%;
  height:100%;
}

.titulo-panel{
  position:absolute;
  top:18px;
  left:20px;
  z-index:999;
  color:#00ffaa;
  font-size:22px;
  font-weight:bold;
  letter-spacing:2px;

  text-shadow:
  0 0 10px #00ffaa;
}
.modal {
  display: none;
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
}

.modal-content {
  background: #111827;
  padding: 20px;
  width: 400px;
  margin: 10% auto;
  border-radius: 12px;
  color: white;
}

.modal textarea {
  width: 100%;
  height: 120px;
  margin-top: 10px;
  background: #0f172a;
  color: white;
  border: 1px solid #7c3aed;
  border-radius: 8px;
  padding: 10px;
}
.glow{
  animation: glowPulse 3s infinite;
}

@keyframes glowPulse{

  0%{
    box-shadow:0 0 10px rgba(123,92,255,.15);
  }

  50%{
    box-shadow:0 0 25px rgba(123,92,255,.35);
  }

  100%{
    box-shadow:0 0 10px rgba(123,92,255,.15);
  }

}
  </style>
<link rel="stylesheet"
href="https://unpkg.com/leaflet/dist/leaflet.css"/>

<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<link rel="stylesheet"
href="https://unpkg.com/leaflet/dist/leaflet.css"/>

<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
</head>

<body>

<div class="card">

<h1>Vincula tu cuenta de <span>Roblox</span></h1>

<p>
Estás a punto de vincular tu cuenta Roblox.
</p>

<a class="btn" href="/roblox">
Sigue con Roblox
</a>

</div>
</body>
</html>
  `);

});
// PANEL WEB
web.get("/panel", async (req, res) => {
try {

  const usersArray = await VerifiedUser.find();
const verifiedUsers = {};

usersArray.forEach(user => {
  verifiedUsers[user.discordId] = user;
});

  const total = Object.keys(verifiedUsers).length;

const usersStats = Object.values(verifiedUsers);

const moviles = usersStats.filter(u =>
  u.dispositivo && u.dispositivo.includes("Móvil")
).length;

const pcs = usersStats.filter(u =>
  u.dispositivo && u.dispositivo.includes("PC")
).length;

const vpns = usersStats.filter(u =>
  u.vpn && u.vpn.includes("Detectado")
).length;

const nitros = usersStats.filter(u =>
  u.nitro && u.nitro.includes("Sí")
).length;

  let usersHtml = "";

  for (const id in verifiedUsers) {

    const user = verifiedUsers[id];

    const searchData = `
      ${user.discord}
      ${user.discordId}
      ${user.pais}
      ${user.region}
      ${user.ciudad}
      ${user.isp}
      ${user.ip}
    `.toLowerCase();

    usersHtml += `

    <div
class="card"
id="user-card-${user.discordId}"
data-search="${searchData}">
       <div class="user-header">

<img
class="avatar"
src="${user.avatar}"
onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'"
>

<div>

<h3>${user.discord}</h3>

<p class="mini-id">
${user.discordId}
</p>

</div>

</div>

<p class="status" id="status-${user.discordId}">
⚫ Estado: cargando...
</p>

        <p>🆔 ${user.discordId}</p>
        <p>🌎 ${user.pais}</p>
        <p>📍 ${user.region}</p>
        <p>🏙️ ${user.ciudad}</p>
        <p>📡 ${user.isp}</p>
        <p>🛡️ ${user.vpn}</p>
        <p>📱 ${user.dispositivo || "No detectado"}</p>
        <p>🌐 ${user.navegador || "No detectado"}</p>
        <p>💻 ${user.sistema || "Sistema no detectado"}</p>
        <p>🌐 ${user.ip}</p>
<div class="mini-map" id="map-${user.discordId}"></div>
<button class="btn-action"
onclick="openDM('${user.discordId}')">
📩 Enviar DM
</button>

<a class="btn-danger"
href="/admin/kick/${user.discordId}?key=${process.env.ADMIN_KEY}">
🚪 Expulsar
</a>

<a class="btn-danger"
href="/admin/delete/${user.discordId}?key=${process.env.ADMIN_KEY}">
🗑️ Eliminar del panel
</a>
      </div>


    `;

  }

  res.send(`

<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="UTF-8">

<title>Panel MVS</title>
<script src="https://unpkg.com/globe.gl"></script>
<link rel="stylesheet"
href="https://unpkg.com/leaflet/dist/leaflet.css"/>

<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<style>

body {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(34,197,94,.12), transparent 30%),
    radial-gradient(circle at bottom right, rgba(123,92,255,.14), transparent 35%),
    #05070a;
  color: white;
  font-family: Arial;
  padding: 30px;
  overflow-x: hidden;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(34,197,94,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34,197,94,.05) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: -2;
}

body::after {
  content: "";
  position: fixed;
  left: 0;
  top: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(34,197,94,.10),
    transparent
  );
  animation: hackerScan 6s linear infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes hackerScan {
  0% { top: -100%; }
  100% { top: 100%; }
}
.title {
  font-size: 42px;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-shadow:
    0 0 10px rgba(34,197,94,.55),
    0 0 25px rgba(123,92,255,.35);
  animation: titleGlitch 3s infinite;
}

@keyframes titleGlitch {
  0%, 100% { transform: translateX(0); }
  92% { transform: translateX(0); }
  94% { transform: translateX(-2px); }
  96% { transform: translateX(2px); }
  98% { transform: translateX(0); }
}
.stats {
  background: #1b1e24;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 25px;
}

.search-box input {
  width: 100%;
  padding: 15px;
  border: none;
  outline: none;
  border-radius: 12px;
  background: #1b1e24;
  color: white;
  font-size: 16px;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(123,92,255,.25);
  background: #1b1e24;
  border-left: 5px solid #7b5cff;
  padding: 20px;
  border-radius: 15px;

  transition: 0.25s;
  cursor: pointer;
}

.card:hover{
   transform: translateY(-5px);
  box-shadow: 0 0 25px rgba(123,92,255,.35);
}
.card::before{
  content:"";
  position:absolute;
  top:0;
  left:-100%;
  width:80%;
  height:100%;
  background:linear-gradient(
    90deg,
    transparent,
    rgba(34,197,94,.12),
    transparent
  );
  animation: cardScan 5s infinite;
  pointer-events:none;
}

@keyframes cardScan{
  0%{ left:-100%; }
  60%{ left:120%; }
  100%{ left:120%; }
}
.online-user{
  border-left: 5px solid #22c55e !important;
  box-shadow: 0 0 25px rgba(34,197,94,.35);
}
h3 {
  margin-top: 0;
}
.user-header{
  display:flex;
  align-items:center;
  gap:14px;
  margin-bottom:15px;
}

.avatar{
  width:60px;
  height:60px;
  border-radius:50%;
  border:2px solid #7b5cff;
  object-fit:cover;
}

.mini-id{
  font-size:12px;
  color:#9ca3af;
  margin-top:-8px;
}
.btn-action, .btn-danger {
  display: inline-block;
  margin-top: 10px;
  margin-right: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
}

.btn-action {
  background: #5865f2;
}

.btn-danger {
  background: #dc2626;
}
.mini-map {
  height: 160px;
  width: 100%;
  border-radius: 12px;
  margin-top: 12px;
  margin-bottom: 10px;
  overflow: hidden;
}
.modal {
  display: none;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.75);
}

.modal-content {
  background: #111827;
  padding: 20px;
  width: 420px;
  margin: 10% auto;
  border-radius: 14px;
  color: white;
}

.modal textarea {
  width: 100%;
  height: 120px;
  background: #0f172a;
  color: white;
  border: 1px solid #7b5cff;
  border-radius: 8px;
  padding: 10px;
}
.top-panels{
  display:grid;
  grid-template-columns: 320px 1fr 1fr;
  gap:20px;
  margin-bottom:25px;
}

.activity-box,
.logs-box{
  background:#1b1e24;
  border-radius:15px;
  padding:20px;
  border:1px solid rgba(123,92,255,.18);
}

.activity-box h3,
.logs-box h3{
  margin-top:0;
  color:#a78bfa;
}

#liveLogs{
  max-height:220px;
  overflow:auto;
  font-size:14px;
  color:#d1d5db;
}

#liveLogs p{
  margin:8px 0;
}
</style>

</head>

<body>

<div class="top-header">

  <div class="title">
    📡 LIVE SECURITY PANEL
  </div>

  <div class="system-clock">
    <div id="clock">--/--/---- - --:--:--</div>
    <div class="bot-active">
      <span class="pulse-dot">🟢</span> BOT ACTIVE
    </div>
  </div>

</div>

<div class="live-banner">
  <h1>LIVE SECURITY PANEL</h1>
  <p>REALTIME USER TRACKING SYSTEM</p>
</div>
<div class="server-status-box">
  <h3>📡 Estado del servidor</h3>

  <p>🟢 Web: ONLINE</p>
  <p>🟢 Bot: ACTIVE</p>
  <p>🟢 MongoDB: CONNECTED</p>
  <p>⚡ Socket.IO: REALTIME</p>
</div>
<div class="top-panels">

  <div class="stats glow">
    👥 Total: ${total}<br>
    📱 Móvil: ${moviles}<br>
    💻 PC: ${pcs}<br>
    ⚠️ VPN: ${vpns}<br>
    💎 Nitro: ${nitros}

    <br><br>

    <a class="btn-action"
    href="/export/csv?key=${process.env.ADMIN_KEY}">
    📥 Descargar CSV
    </a>
  </div>

  <div class="activity-box">
    <h3>📈 Actividad</h3>
    <p>⚡ Última actividad:</p>
    <p id="lastActivity">Esperando actividad...</p>
    <hr>
    <p>📅 Hoy: <span id="todayCount">0</span></p>
    <p>📅 Semana: <span id="weekCount">0</span></p>
    <p>📅 Total: <span id="totalCount">0</span></p>
  </div>

  <div class="logs-box">
    <h3>🟢 Live Logs</h3>
    <div id="liveLogs">
      <p>🟢 Esperando nuevos verificados...</p>
<p style="color:#9ca3af;">Cuando alguien complete la verificación, aparecerá acá.</p>
    </div>
  </div>

</div>
<div class="globo-box">

  <div class="titulo-panel">
    🌍 CONEXIONES USUARIOS
  </div>

  <div id="globo3d"></div>

</div>
<div class="search-box">
  <input
    type="text"
    id="search"
    placeholder="🔎 Buscar usuario, ID, país, ciudad, ISP..."
  >
</div>

<div class="container" id="users">

${usersHtml}

</div>
<div id="dmModal" class="modal">

  <div class="modal-content">

    <h2>📩 Enviar mensaje privado</h2>

    <textarea
      id="dmMessage"
      placeholder="Escribí el mensaje..."
    ></textarea>

    <br><br>

    <button onclick="sendDM()">
      Enviar
    </button>

    <button onclick="closeDM()">
      Cancelar
    </button>

  </div>

</div>
<script src="/socket.io/socket.io.js"></script>

<script>
const socket = io();

socket.on("new-user", function (user) {

  console.log("Nuevo usuario conectado:", user);

  var audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.volume = 0.35;
  audio.play().catch(function () {});

  var aviso = document.createElement("div");

  aviso.innerHTML =
    "<b>🟢 NUEVO VERIFICADO</b><br>" +
    "👤 " + (user.discord || "Usuario") + "<br>" +
    "🌎 " + (user.pais || "Desconocido") + " - " + (user.ciudad || "Desconocida");

  aviso.style.position = "fixed";
  aviso.style.top = "25px";
  aviso.style.right = "25px";
  aviso.style.background = "#111827";
  aviso.style.color = "white";
  aviso.style.padding = "16px 20px";
  aviso.style.borderRadius = "14px";
  aviso.style.border = "1px solid #22c55e";
  aviso.style.boxShadow = "0 0 25px rgba(34,197,94,.45)";
  aviso.style.zIndex = "999999";
  aviso.style.fontSize = "14px";

  document.body.appendChild(aviso);

  var logs = document.getElementById("liveLogs");
  var lastActivity = document.getElementById("lastActivity");

  var now = new Date();
  var fechaHora = now.toLocaleDateString("es-AR") + " - " + now.toLocaleTimeString("es-AR");

  lastActivity.innerText = fechaHora;

  var mensaje = document.createElement("p");

  mensaje.innerHTML =
    "🟢 <b>NUEVO VERIFICADO</b><br>" +
    "👤 " + (user.discord || "Usuario") + "<br>" +
    "🌎 " + (user.pais || "Desconocido") + " - " + (user.ciudad || "Desconocida") + "<br>" +
    "🕒 " + fechaHora;

  mensaje.style.marginBottom = "15px";
  mensaje.style.paddingBottom = "10px";
  mensaje.style.borderBottom = "1px solid rgba(255,255,255,.08)";

  if (logs.innerHTML.includes("Esperando nuevos verificados")) {
    logs.innerHTML = "";
  }

  logs.prepend(mensaje);
setTimeout(function () {
  aviso.remove();
}, 4000);



var usersContainer = document.getElementById("users");

var oldCard = document.getElementById("user-card-" + user.discordId);
if (oldCard) oldCard.remove();

var newCard = document.createElement("div");

newCard.className = "card online-user";
newCard.id = "user-card-" + user.discordId;

newCard.setAttribute(
  "data-search",
  (
    (user.discord || "") + " " +
    (user.discordId || "") + " " +
    (user.pais || "") + " " +
    (user.region || "") + " " +
    (user.ciudad || "") + " " +
    (user.isp || "") + " " +
    (user.ip || "")
  ).toLowerCase()
);

newCard.innerHTML =
  '<div class="user-header">' +
    '<img class="avatar" src="' + (user.avatar || "https://cdn.discordapp.com/embed/avatars/0.png") + '">' +
    '<div>' +
      '<h3>' + (user.discord || "Usuario") + '</h3>' +
      '<p class="mini-id">' + (user.discordId || "Sin ID") + '</p>' +
    '</div>' +
  '</div>' +

  '<p class="status">🟢 Online</p>' +

  '<p>🆔 ' + (user.discordId || "") + '</p>' +
  '<p>🌎 ' + (user.pais || "") + '</p>' +
  '<p>📍 ' + (user.region || "") + '</p>' +
  '<p>🏙️ ' + (user.ciudad || "") + '</p>' +
  '<p>📡 ' + (user.isp || "") + '</p>' +
  '<p>🛡️ ' + (user.vpn || "") + '</p>' +
  '<p>📱 ' + (user.dispositivo || "No detectado") + '</p>' +
  '<p>🌐 ' + (user.navegador || "No detectado") + '</p>' +
  '<p>💻 ' + (user.sistema || "Sistema no detectado") + '</p>' +
  '<p>🌐 ' + (user.ip || "") + '</p>' +

  '<div class="mini-map" id="map-' + user.discordId + '"></div>' +

  '<button class="btn-action" onclick="openDM(\\'' + user.discordId + '\\')">📩 Enviar DM</button>' +

  '<a class="btn-danger" href="/admin/kick/' + user.discordId + '?key=${process.env.ADMIN_KEY}">🚪 Expulsar</a>' +

  '<a class="btn-danger" href="/admin/delete/' + user.discordId + '?key=${process.env.ADMIN_KEY}">🗑️ Eliminar del panel</a>';

usersContainer.prepend(newCard);

if (user.lat && user.lon) {

  setTimeout(function () {

    var liveMap = L.map("map-" + user.discordId, {
      attributionControl: false,
      zoomControl: false
    }).setView([user.lat, user.lon], 10);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    ).addTo(liveMap);

    L.marker([user.lat, user.lon]).addTo(liveMap);

    liveMap.invalidateSize();

  }, 300);

}

});

let selectedUser = "";

function openDM(id) {
  selectedUser = id;
  document.getElementById("dmModal").style.display = "block";
}

function closeDM() {
  document.getElementById("dmModal").style.display = "none";
}

async function sendDM() {

  const message =
    document.getElementById("dmMessage").value;

await fetch(
  "/admin/dm/" + selectedUser + "?key=${process.env.ADMIN_KEY}",
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    }
  );

  alert("Mensaje enviado.");

  closeDM();
}
const search = document.getElementById("search");

search.addEventListener("input", () => {

  const value = search.value.toLowerCase();

  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {

    const data = card.getAttribute("data-search");

    if (data.includes(value)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }

  });

});
cargarEstados();

setInterval(cargarEstados, 10000);
async function cargarEstados() {

  const res = await fetch("/api/status");

  const estados = await res.json();

  for (const id in estados) {

    const el =
      document.getElementById("status-" + id);
if (el) {

  el.innerHTML = estados[id];

  const card =
    el.closest(".card");

  if (estados[id].includes("🟢")) {

    card.classList.add("online-user");

  } else {

    card.classList.remove("online-user");

   }

  }
    
 }

}
const mapUsers = ${JSON.stringify(usersStats)};
console.log("Leaflet:", typeof L);
console.log("Usuarios mapa:", mapUsers);
const usuariosGlobo = ${JSON.stringify(usersStats)};

const puntos = usuariosGlobo
.filter(u => u.lat && u.lon)
.map(u => ({

  lat: u.lat,
  lng: u.lon,

  size: 0.35,

  color:
    u.vpn && u.vpn.includes("Detectado")
    ? "#ff0000"
    : "#00ffaa",

label:
'<div style="background:#000000dd;padding:10px;border-radius:12px;color:white;border:1px solid #00ffaa;">' +

'👤 ' + u.discord + '<br>' +

'🌍 ' + u.pais + '<br>' +

'🏙️ ' + u.ciudad + '<br>' +

'📱 ' + u.dispositivo + '<br>' +

'💻 ' + (u.sistema || "No detectado") + '<br>' +

'🌐 ' + u.ip +

'</div>'

 }));

const conexiones = [];

for(let i = 0; i < puntos.length - 1; i++){

  conexiones.push({

    startLat: puntos[i].lat,
    startLng: puntos[i].lng,

    endLat: puntos[i+1].lat,
    endLng: puntos[i+1].lng,

    color:"#00ffaa"

  });

}

const world = Globe()
(document.getElementById("globo3d"))

.globeImageUrl(
'https://unpkg.com/three-globe/example/img/earth-night.jpg'
)

.backgroundColor('#05070a')

.pointsData(puntos)

.pointAltitude(0.02)

.pointColor('color')

.pointRadius('size')

.pointLabel('label')

.arcsData(conexiones)

.arcColor('color')

.arcAltitude(0.22)

.arcStroke(0.7)

.arcDashLength(0.5)

.arcDashGap(0.15)

.arcDashAnimateTime(2500);

world.controls().autoRotate = true;

world.controls().autoRotateSpeed = 0.7;

world.controls().enableZoom = false;

world.controls().enablePan = false;

mapUsers.forEach(user => {

  if (!user.lat || !user.lon) return;

  const map = L.map(
    "map-" + user.discordId,
    {
      attributionControl: false,
      zoomControl: false
    }
  ).setView([user.lat, user.lon], 10);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  ).addTo(map);

  L.marker([user.lat, user.lon]).addTo(map);

});
function updateClock() {
  const now = new Date();

  const fecha = now.toLocaleDateString("es-AR");
  const hora = now.toLocaleTimeString("es-AR");

  document.getElementById("clock").innerText =
    fecha + " - " + hora;
}

updateClock();
setInterval(updateClock, 1000);
const statsUsers = ${JSON.stringify(usersStats)};

function actualizarStats() {

  const hoy = new Date();

  let hoyCount = 0;
  let semanaCount = 0;

  statsUsers.forEach(user => {

    if (!user._id) return;

    const fecha = new Date(user._id.getTimestamp());

    const diff =
      (hoy - fecha) / (1000 * 60 * 60 * 24);

    if (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    ) {
      hoyCount++;
    }

    if (diff <= 7) {
      semanaCount++;
    }

  });

  document.getElementById("todayCount").innerText =
    hoyCount;

  document.getElementById("weekCount").innerText =
    semanaCount;

  document.getElementById("totalCount").innerText =
    statsUsers.length;

}

actualizarStats();
</script>
</body>

</html>

  `);
} catch (error) {
  console.log(error);
  res.send("Error cargando panel: " + error.message);
}

});
web.post("/admin/dm/:id", async (req, res) => {

  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.send("❌ No autorizado");
  }

  try {

    const user =
      await client.users.fetch(req.params.id);

    await user.send(req.body.message);

    res.send("✅ Mensaje enviado.");

  } catch (error) {

    console.log(error);

    res.send("❌ Error enviando mensaje.");
  }
});

web.get("/admin/kick/:id", async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.send("❌ No autorizado");
  }

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(req.params.id);

    await member.kick("Expulsado desde el dashboard");
await VerifiedUser.deleteOne({
  discordId: req.params.id
});

    res.send("✅ Usuario expulsado del servidor.");
  } catch (error) {
    console.log(error);
    res.send("❌ No pude expulsar al usuario.");
  }
});
web.get("/api/status", async (req, res) => {

  const users = await VerifiedUser.find();

  const guild =
    await client.guilds.fetch(GUILD_ID);

  const estados = {};

  for (const user of users) {

    const member =
      await guild.members
      .fetch(user.discordId)
      .catch(() => null);

    if (!member) {

      estados[user.discordId] =
      "❌ Ya no está";

      continue;
    }

    const presence = member.presence;

    if (!presence) {

      estados[user.discordId] =
      "⚫ Offline";

      continue;
    }

    let texto = "";

    if (presence.status === "online")
      texto += "🟢 Online<br>";

    else if (presence.status === "idle")
      texto += "🌙 Ausente<br>";

    else if (presence.status === "dnd")
      texto += "⛔ No molestar<br>";

    else
      texto += "⚫ Offline<br>";

    const actividad = presence.activities[0];

    if (actividad) {

      if (actividad.type === 2) {

      const spotify = presence.activities.find(
  a => a.name === "Spotify"
);

if (spotify) {

  texto +=
  `🎵 ${spotify.details}<br>` +
  `👤 ${spotify.state}<br>`;

}
      } else {

        texto +=
        `🎮 ${actividad.name}<br>`;
      }
    }

    texto +=
    `🕒 Última vez visto:
    ${new Date().toLocaleTimeString()}`;

    estados[user.discordId] = texto;
  }

  res.json(estados);
});
web.get("/export/json", async (req, res) => {

  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.send("❌ No autorizado");
  }

  const users = await VerifiedUser.find();

  res.setHeader(
    "Content-Type",
    "application/json"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=usuarios.json"
  );

  res.send(
    JSON.stringify(users, null, 2)
  );

});

web.get("/export/csv", async (req, res) => {

  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.send("❌ No autorizado");
  }

  const users = await VerifiedUser.find();

  let csv =
"discord,discordId,ip,pais,region,ciudad,isp,vpn,dispositivo,sospechosa,nitro\n";

  users.forEach(user => {

    csv +=
`"${user.discord || ""}","${user.discordId || ""}","${user.ip || ""}","${user.pais || ""}","${user.region || ""}","${user.ciudad || ""}","${user.isp || ""}","${user.vpn || ""}","${user.dispositivo || ""}","${user.sospechosa || ""}","${user.nitro || ""}"\n`;

  });

  res.setHeader(
    "Content-Type",
    "text/csv"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=usuarios.csv"
  );

  res.send(csv);

});
web.get("/admin/delete/:id", async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.send("❌ No autorizado");
  }

  await VerifiedUser.deleteOne({
    discordId: req.params.id
  });

  res.redirect("/panel");
});
// ROBLOX OAUTH

web.get("/roblox", (req, res) => {

  const discordId = req.query.discord_id;

  if (!discordId) {
    return res.send("❌ No se recibió el ID de Discord.");
  }

  const params = new URLSearchParams({
    client_id: process.env.ROBLOX_CLIENT_ID,
    redirect_uri: process.env.ROBLOX_REDIRECT_URI,
    response_type: "code",
    scope: "openid profile",
    state: discordId
  });

  res.redirect(
    "https://apis.roblox.com/oauth/v1/authorize?" +
    params.toString()
  );

});

// CALLBACK

web.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const discordId = req.query.state;

    if (!code) return res.send("❌ No se recibió código de Roblox.");
    if (!discordId) return res.send("❌ No se recibió el ID de Discord.");
const userAgent = req.headers["user-agent"] || "";
let navegador = "🌐 Desconocido";

if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
  navegador = "🌐 Opera GX";
}
else if (userAgent.includes("Edg")) {
  navegador = "🌐 Edge";
}
else if (userAgent.includes("Chrome")) {
  navegador = "🌐 Chrome";
}
else if (userAgent.includes("Firefox")) {
  navegador = "🌐 Firefox";
}
else if (userAgent.includes("Safari")) {
  navegador = "🌐 Safari";
}

let sistema = "💻 Windows / PC";

if (userAgent.includes("Android")) {
  sistema = "📱 Android";
} else if (userAgent.includes("iPhone")) {
  sistema = "📱 iPhone";
} else if (userAgent.includes("iPad")) {
  sistema = "📱 iPad";
} else if (userAgent.includes("Macintosh")) {
  sistema = "💻 Mac";
} else if (userAgent.includes("Windows")) {
  sistema = "💻 Windows";
}
    const ipRaw =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "Desconocida";

    const ipMasked = ipRaw.replace(/(\d+\.\d+)\.\d+\.\d+/, "$1.***.***");

    const geoResponse = await fetch(`http://ip-api.com/json/${ipRaw}?fields=status,country,regionName,city,lat,lon,isp,proxy,hosting,mobile,query`);
    const geo = await geoResponse.json();

    const tokenResponse = await fetch("https://apis.roblox.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.ROBLOX_CLIENT_ID,
        client_secret: process.env.ROBLOX_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.ROBLOX_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.log(tokenData);
      return res.send("❌ Error al obtener token de Roblox.");
    }

    const userResponse = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const robloxUser = await userResponse.json();

    const robloxId = robloxUser.sub;
    const username = robloxUser.preferred_username || robloxUser.name || "Desconocido";
    const displayName = robloxUser.nickname || "No disponible";

    const details = await fetch(`https://users.roblox.com/v1/users/${robloxId}`).then(r => r.json());

    const createdDate = new Date(details.created);
    const daysOld = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
    const yearsOld = Math.floor(daysOld / 365);

    const estadoCuenta = daysOld < 30
      ? "⚠️ Posible alt / cuenta nueva"
      : "✅ Cuenta segura";

    const avatarData = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`
    ).then(r => r.json());

    const avatarUrl = avatarData.data?.[0]?.imageUrl || null;

    const friends = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/friends/count`)
      .then(r => r.json()).catch(() => ({ count: "No disponible" }));

    const followers = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/followers/count`)
      .then(r => r.json()).catch(() => ({ count: "No disponible" }));

    const following = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/followings/count`)
      .then(r => r.json()).catch(() => ({ count: "No disponible" }));

    const groupsData = await fetch(`https://groups.roblox.com/v1/users/${robloxId}/groups/roles`)
      .then(r => r.json()).catch(() => ({ data: [] }));

    const groupsCount = groupsData.data?.length || 0;

    const badgesData = await fetch(`https://badges.roblox.com/v1/users/${robloxId}/badges?limit=100&sortOrder=Desc`)
      .then(r => r.json()).catch(() => ({ data: [] }));

    const badgesCount = badgesData.data?.length || 0;
    const badgesText = badgesData.nextPageCursor ? `${badgesCount}+` : `${badgesCount}`;

    const premiumData = await fetch(`https://premiumfeatures.roblox.com/v1/users/${robloxId}/validate-membership`)
      .then(r => r.json()).catch(() => false);

    const premiumText = premiumData === true ? "✅ Sí" : "❌ No / no visible";

    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(discordId);

    await member.roles.add(VERIFY_ROLE_ID);

    const logChannel = await client.channels.fetch(VERIFY_LOGS_ID);

    const embed = new EmbedBuilder()
      .setTitle("✅ Usuario Verificado | Roblox Premium Check")
      .setColor("#6f9365")
      .setThumbnail(avatarUrl)
      .setDescription(
        "━━━━━━━━━━━━━━━━━━\n\n" +

        `👤 **Discord:** ${member.user}\n` +
        `🆔 **Discord ID:** \`${discordId}\`\n\n` +

        `🎮 **Username Roblox:** \`${username}\`\n` +
        `🪪 **Display Name:** \`${details.displayName || displayName}\`\n` +
        `🆔 **Roblox ID:** \`${robloxId}\`\n` +
        `🔗 **Perfil:** https://www.roblox.com/users/${robloxId}/profile\n\n` +

        `📅 **Cuenta creada:**\n<t:${Math.floor(createdDate.getTime() / 1000)}:F>\n\n` +
        `⏳ **Antigüedad:** ${daysOld} días ${yearsOld > 0 ? `(${yearsOld} año/s)` : ""}\n` +
        `🛡️ **Estado:** ${estadoCuenta}\n` +
        `💎 **Premium:** ${premiumText}\n\n` +

        `👥 **Amigos visibles:** \`${friends.count}\`\n` +
        `👤 **Seguidores:** \`${followers.count}\`\n` +
        `➡️ **Siguiendo:** \`${following.count}\`\n` +
        `👨‍👩‍👧 **Grupos visibles:** \`${groupsCount}\`\n` +
        `🏆 **Badges públicos:** \`${badgesText}\`\n` +
        `🔨 **Bans detectados:** \`No disponible oficialmente\`\n\n` +

        `🌎 **País:** \`${geo.country || "Desconocido"}\`\n` +
        `🏙️ **Ciudad aprox.:** \`${geo.city || "Desconocida"}\`\n` +
        `📍 **Región:** \`${geo.regionName || "Desconocida"}\`\n` +
        `📡 **ISP:** \`${geo.isp || "Desconocido"}\`\n` +
        `🛡️ **VPN/Proxy:** \`${geo.proxy ? "⚠️ Posible VPN/Proxy" : "✅ No detectado"}\`\n` +
        `📱 **Conexión móvil:** \`${geo.mobile ? "Sí" : "No / no detectado"}\`\n` +
        `🌐 **IP:** \`${ipMasked}\`\n\n` +

        "━━━━━━━━━━━━━━━━━━"
      )
      .setFooter({ text: "Sistema premium de verificación Roblox" })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
const savedUser = await VerifiedUser.findOneAndUpdate(
  { discordId: String(discordId) },
  {
    discord: member.user.tag,
    avatar: member.user.displayAvatarURL({
  extension: "png",
  size: 256
}),
    discordId: String(discordId),
    ip: ipMasked,
    pais: geo.country || "Desconocido",
    region: geo.regionName || "Desconocida",
    ciudad: geo.city || "Desconocida",
    lat: geo.lat || 0,
    lon: geo.lon || 0,
    isp: geo.isp || "Desconocido",   
       vpn: geo.proxy ? "⚠️ Detectado" : "✅ No detectado",
    dispositivo: geo.mobile ? "📱 Móvil" : "💻 PC",
    sistema: sistema,
    navegador: navegador,
    sospechosa: estadoCuenta,
    nitro: member.premiumSince ? "✅ Sí" : "❌ No"
  },
  { upsert: true, new: true }
);

const totalGuardados = await VerifiedUser.countDocuments();

console.log("✅ Usuario guardado en MongoDB:", savedUser.discord);
console.log("📊 Total guardados:", totalGuardados);
console.log("📡 Enviando evento new-user al dashboard...");
io.emit("new-user", savedUser);

    res.send("✅ Verificación completada. Ya recibiste tu rol en Discord.");

  } catch (error) {
    console.log(error);
    res.send("❌ Ocurrió un error al completar la verificación.");
  }
});

// WEB ONLINE
server.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web online 🚀");
});

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const discordTranscripts = require("discord-html-transcripts");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
   GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildPresences,
  ]
});

// IDS

const APP_ID = "1502542491742900285";
const GUILD_ID = "1502542235491635282";

const VERIFY_ROLE_ID = "1502547113739944078";
const VERIFY_LOGS_ID = "1502547730600427570";

const STAFF_ROLE_ID = "1502573600840880179";
const TICKET_CATEGORY_ID = "1502573361472077855";
const TICKET_LOGS_ID = "1502573180278149140";
const TICKET_TYPES = {
  ticket_compras: {
    tipo: "Compras",
    emoji: "💰",
    prioridad: "Alta",
    color: "#2ecc71",
    pregunta: "Explicá qué querés comprar, método de pago, comprobante si tenés y cualquier detalle importante."
  },
  ticket_soporte: {
    tipo: "Soporte",
    emoji: "🛠️",
    prioridad: "Media",
    color: "#2ecc71",
    pregunta: "Contanos qué problema tenés, desde cuándo pasa y mandá capturas si hace falta."
  },
  ticket_dudas: {
    tipo: "Dudas",
    emoji: "❓",
    prioridad: "Baja",
    color: "#2ecc71",
    pregunta: "Escribí claramente cuál es tu duda para que el staff pueda ayudarte rápido."
  },
  ticket_apelaciones: {
    tipo: "Apelaciones",
    emoji: "🔨",
    prioridad: "Alta",
    color: "#3498db",
    pregunta: "Explicá qué sanción querés apelar, quién te sancionó, cuándo pasó y por qué creés que debe revisarse."
  }
};

function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);

  if (d > 0) return `${d} día/s`;
  if (h > 0) return `${h} hora/s`;
  if (min > 0) return `${min} minuto/s`;
  return "menos de 1 minuto";
}

function parseTopic(topic = "") {
  const data = {};
  topic.split(";").forEach(part => {
    const [key, value] = part.split("=");
    if (key && value) data[key] = value;
  });
  return data;
}
// COMANDOS

const commands = [
new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Banear a un usuario")
  .addUserOption(option =>
    option.setName("usuario").setDescription("Usuario a banear").setRequired(true)
  )
  .addStringOption(option =>
    option.setName("razon").setDescription("Razón del ban").setRequired(false)
  ),

new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Expulsar a un usuario")
  .addUserOption(option =>
    option.setName("usuario").setDescription("Usuario a expulsar").setRequired(true)
  )
  .addStringOption(option =>
    option.setName("razon").setDescription("Razón del kick").setRequired(false)
  ),

new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Borrar mensajes del canal")
  .addIntegerOption(option =>
    option.setName("cantidad").setDescription("Cantidad de mensajes").setRequired(true)
  ),
new SlashCommandBuilder()
  .setName("dashboard")
  .setDescription("Ver dashboard del sistema"),
new SlashCommandBuilder()
  .setName("scan")
  .setDescription("Escanear riesgo de un usuario")
  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuario a escanear")
      .setRequired(true)
  ),
new SlashCommandBuilder()
  .setName("roblox")
  .setDescription("Buscar información de una cuenta Roblox")
  .addStringOption(option =>
    option
      .setName("username")
      .setDescription("Nombre de usuario Roblox")
      .setRequired(true)
  ),
new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Ver información de un usuario")
  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuario")
      .setRequired(true)
  ),
new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Ver estadísticas completas del servidor"),
 new SlashCommandBuilder()
  .setName("data")
  .setDescription("Ver datos de un usuario")
  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuario")
      .setRequired(true)
  ),

  new SlashCommandBuilder()
    .setName("verifypanel")
    .setDescription("Panel de verificación"),

  new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Panel de tickets")

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {

  try {

    console.log("⏳ Cargando comandos...");

    await rest.put(
      Routes.applicationGuildCommands(APP_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Comandos cargados.");

  } catch (err) {

    console.log(err);

  }

})();

// BOT ONLINE

client.once("clientReady", () => {

  console.log(`🟢 ${client.user.tag}`);

});

// INTERACCIONES

client.on("interactionCreate", async interaction => {

  // =====================================================
  // SLASH COMMANDS
  // =====================================================

  if (interaction.isChatInputCommand()) {
if (interaction.commandName === "ban") {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    return interaction.reply({ content: "❌ No tenés permiso para banear.", ephemeral: true });
  }

  const usuario = interaction.options.getUser("usuario");
  const razon = interaction.options.getString("razon") || "Sin razón";
  const miembro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

  if (!miembro) {
    return interaction.reply({ content: "❌ No encontré ese usuario en el servidor.", ephemeral: true });
  }

  await miembro.ban({ reason: razon });

const canalLogs = interaction.guild.channels.cache.get("1502583332699897856");

if (canalLogs) {

const embed = new EmbedBuilder()

.setTitle("🔨 Usuario Baneado")

.setColor("DarkRed")

.setThumbnail(usuario.displayAvatarURL({ dynamic: true }))

.setDescription(

`👤 **Usuario:** ${usuario}\n` +
`🆔 **ID:** \`${usuario.id}\`\n` +
`📝 **Razón:** ${razon}\n` +
`👮 **Moderador:** ${interaction.user}`

)

.setTimestamp();

await canalLogs.send({
  embeds: [embed]
});

}
 return interaction.reply({
  content: `🔨 ${usuario.tag} fue baneado.\nRazón: ${razon}`
});

}
if (interaction.commandName === "kick") {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
    return interaction.reply({ content: "❌ No tenés permiso para expulsar.", ephemeral: true });
  }

  const usuario = interaction.options.getUser("usuario");
  const razon = interaction.options.getString("razon") || "Sin razón";
  const miembro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

  if (!miembro) {
    return interaction.reply({ content: "❌ No encontré ese usuario en el servidor.", ephemeral: true });
  }

  await miembro.kick(razon);

const canalLogs = interaction.guild.channels.cache.get("1502583332699897856");

if (canalLogs) {
  await canalLogs.send({
    content:
`👢 **Usuario expulsado**
👤 Usuario: ${usuario.tag}
🆔 ID: ${usuario.id}
📝 Razón: ${razon}
👮 Moderador: ${interaction.user.tag}`
  });
}

 return interaction.reply({
  content: `👢 ${usuario.tag} fue expulsado.\nRazón: ${razon}`
});

}
if (interaction.commandName === "clear") {
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    return interaction.reply({ content: "❌ No tenés permiso para borrar mensajes.", ephemeral: true });
  }

  const cantidad = interaction.options.getInteger("cantidad");

  if (cantidad < 1 || cantidad > 100) {
    return interaction.reply({ content: "❌ Poné un número entre 1 y 100.", ephemeral: true });
  }

  const mensajes = await interaction.channel.bulkDelete(cantidad, true);

  return interaction.reply({
    content: `🧹 Se borraron ${mensajes.size} mensajes.`,
    ephemeral: true
  });
}
if (interaction.commandName === "dashboard") {

const embed = new EmbedBuilder()

  .setTitle("📡 Dashboard Oficial")

  .setDescription(

    "Bienvenido al dashboard oficial del sistema.\n\n" +

    "Desde aquí podrás visualizar:\n\n" +

    "✅ Usuarios verificados\n" +
    "🌎 País y región\n" +
    "📡 ISP y conexión\n" +
    "🛡️ VPN/Proxy detectado\n" +
    "📊 Estadísticas del sistema\n\n" +

    "⚡ Sistema web premium en tiempo real."

  )

  .setColor("#5b09e4")

  .setFooter({
    text: "MVS Dashboard System"
  })

  .setTimestamp();

const botones = new ActionRowBuilder()

  .addComponents(

    new ButtonBuilder()
      .setLabel("Ir a Dashboard")
      .setStyle(ButtonStyle.Link)
      .setURL("https://verify-z2au.onrender.com/panel")

  );

return interaction.reply({
  embeds: [embed],
  components: [botones]
});

}
if (interaction.commandName === "scan") {

  const usuario = interaction.options.getUser("usuario");
  const miembro = interaction.guild.members.cache.get(usuario.id);

 const data = await VerifiedUser.findOne({
  discordId: usuario.id
});

  const diasDiscord = Math.floor(
    (Date.now() - usuario.createdTimestamp) / (1000 * 60 * 60 * 24)
  );

  let puntosRiesgo = 0;
  let motivos = [];

  if (diasDiscord < 7) {
    puntosRiesgo += 2;
    motivos.push("⚠️ Cuenta de Discord muy nueva");
  }

  if (diasDiscord < 30) {
    puntosRiesgo += 1;
    motivos.push("⚠️ Cuenta de Discord reciente");
  }

  if (!data) {
    puntosRiesgo += 3;
    motivos.push("❌ Usuario no verificado");
  }

  if (data?.vpn?.includes("Detectado")) {
    puntosRiesgo += 3;
    motivos.push("🛡️ VPN/Proxy detectado");
  }

  if (data?.sospechosa?.includes("Posible")) {
    puntosRiesgo += 2;
    motivos.push("⚠️ Cuenta marcada como sospechosa");
  }

  if (usuario.bot) {
    puntosRiesgo += 1;
    motivos.push("🤖 Es un bot");
  }

  let riesgo = "🟢 Riesgo bajo";
  let color = "Green";

  if (puntosRiesgo >= 3) {
    riesgo = "🟠 Riesgo medio";
    color = "Orange";
  }

  if (puntosRiesgo >= 6) {
    riesgo = "🔴 Riesgo alto";
    color = "Red";
  }

  const embed = new EmbedBuilder()
    .setTitle("🛡️ Escaneo de Usuario")
    .setColor(color)
    .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
    .setDescription(
      `👤 Usuario: ${usuario}\n` +
      `🆔 Discord ID: \`${usuario.id}\`\n\n` +

      `📅 Cuenta creada:\n<t:${Math.floor(usuario.createdTimestamp / 1000)}:F>\n` +
      `📥 Entró al servidor:\n<t:${Math.floor(miembro.joinedTimestamp / 1000)}:F>\n\n` +

      `📡 Verificado: ${data ? "✅ Sí" : "❌ No"}\n` +
      `🌎 País: ${data?.pais || "No disponible"}\n` +
      `📍 Región: ${data?.region || "No disponible"}\n` +
      `🏙️ Ciudad: ${data?.ciudad || "No disponible"}\n` +
      `📡 ISP: ${data?.isp || "No disponible"}\n` +
      `💻 Dispositivo: ${data?.dispositivo || "No disponible"}\n` +
      `🔒 VPN/Proxy: ${data?.vpn || "No disponible"}\n\n` +

      `🚨 Resultado: **${riesgo}**\n\n` +
      `📌 Motivos:\n${motivos.length ? motivos.join("\n") : "✅ Sin alertas importantes"}`
    )
    .setFooter({ text: "Sistema de escaneo premium" })
    .setTimestamp();

  return interaction.reply({
    embeds: [embed]
  });

}
if (interaction.commandName === "roblox") {

  await interaction.deferReply();

  const username = interaction.options.getString("username");

  const searchResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usernames: [username],
      excludeBannedUsers: false
    })
  });

  const searchData = await searchResponse.json();

  if (!searchData.data || searchData.data.length === 0) {
    return interaction.editReply("❌ No encontré ese usuario de Roblox.");
  }

  const robloxUser = searchData.data[0];
  const robloxId = robloxUser.id;

  const details = await fetch(`https://users.roblox.com/v1/users/${robloxId}`)
    .then(r => r.json());

  const friends = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/friends/count`)
    .then(r => r.json()).catch(() => ({ count: "No disponible" }));

  const followers = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/followers/count`)
    .then(r => r.json()).catch(() => ({ count: "No disponible" }));

  const following = await fetch(`https://friends.roblox.com/v1/users/${robloxId}/followings/count`)
    .then(r => r.json()).catch(() => ({ count: "No disponible" }));

  const groups = await fetch(`https://groups.roblox.com/v1/users/${robloxId}/groups/roles`)
    .then(r => r.json()).catch(() => ({ data: [] }));

  const badges = await fetch(`https://badges.roblox.com/v1/users/${robloxId}/badges?limit=100&sortOrder=Desc`)
    .then(r => r.json()).catch(() => ({ data: [] }));

  const premium = await fetch(`https://premiumfeatures.roblox.com/v1/users/${robloxId}/validate-membership`)
    .then(r => r.json()).catch(() => false);

  const avatar = await fetch(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`
  ).then(r => r.json()).catch(() => ({ data: [] }));

  const avatarUrl = avatar.data?.[0]?.imageUrl || null;

  const createdDate = new Date(details.created);
  const daysOld = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
  const yearsOld = Math.floor(daysOld / 365);

  const estadoCuenta = daysOld < 30
    ? "⚠️ Cuenta nueva / posible alt"
    : "✅ Cuenta normal";

  const embed = new EmbedBuilder()
    .setTitle(`🎮 Información Roblox | ${username}`)
    .setColor("#ff0000")
    .setThumbnail(avatarUrl)
    .setDescription(
      `👤 **Username:** \`${details.name}\`\n` +
      `🪪 **Display Name:** \`${details.displayName || "No disponible"}\`\n` +
      `🆔 **Roblox ID:** \`${robloxId}\`\n` +
      `🔗 **Perfil:** https://www.roblox.com/users/${robloxId}/profile\n\n` +

      `📅 **Cuenta creada:**\n<t:${Math.floor(createdDate.getTime() / 1000)}:F>\n\n` +
      `⏳ **Antigüedad:** ${daysOld} días ${yearsOld > 0 ? `(${yearsOld} año/s)` : ""}\n` +
      `🛡️ **Estado:** ${estadoCuenta}\n` +
      `💎 **Premium:** ${premium === true ? "✅ Sí" : "❌ No / no visible"}\n\n` +

      `👥 **Amigos:** \`${friends.count}\`\n` +
      `👤 **Seguidores:** \`${followers.count}\`\n` +
      `➡️ **Siguiendo:** \`${following.count}\`\n` +
      `👨‍👩‍👧 **Grupos visibles:** \`${groups.data?.length || 0}\`\n` +
      `🏆 **Badges públicos:** \`${badges.data?.length || 0}${badges.nextPageCursor ? "+" : ""}\`\n\n` +

      `📝 **Descripción:**\n${details.description || "Sin descripción"}`
    )
    .setFooter({ text: "Roblox Lookup System" })
    .setTimestamp();

  return interaction.editReply({
    embeds: [embed]
  });

}
if (interaction.commandName === "userinfo") {

  const usuario = interaction.options.getUser("usuario");

  const miembro = interaction.guild.members.cache.get(usuario.id);

  const roles = miembro.roles.cache
    .filter(r => r.id !== interaction.guild.id)
    .map(r => r.toString())
    .join(", ") || "Sin roles";

  const nitro = usuario.banner
    ? "✅ Sí"
    : "❌ No";

  const estado = miembro.presence
    ? miembro.presence.status
    : "offline";

  const embed = new EmbedBuilder()

    .setTitle("👤 Información del Usuario")

    .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))

    .setImage(usuario.displayAvatarURL({
      dynamic: true,
      size: 1024
    }))

    .setColor("#ff0000")

    .setDescription(

      `👤 Usuario: ${usuario}\n` +
      `🆔 Discord ID: \`${usuario.id}\`\n\n` +

      `🤖 Bot: ${usuario.bot ? "✅ Sí" : "❌ No"}\n` +
      `💎 Nitro: ${nitro}\n` +
      `🟢 Estado: ${estado}\n\n` +

      `📅 Cuenta creada:\n<t:${Math.floor(usuario.createdTimestamp / 1000)}:F>\n\n` +

      `📥 Entró al servidor:\n<t:${Math.floor(miembro.joinedTimestamp / 1000)}:F>\n\n` +

      `🎭 Roles:\n${roles}`

    )

    .setFooter({
      text: interaction.guild.name
    })

    .setTimestamp();

  return interaction.reply({
    embeds: [embed]
  });

}
if (interaction.commandName === "stats") {

  const guild = interaction.guild;

  const totalMembers = guild.memberCount;

  const bots = guild.members.cache.filter(m => m.user.bot).size;

  const humans = totalMembers - bots;

  const online = guild.members.cache.filter(
    m => m.presence && m.presence.status !== "offline"
  ).size;

  const boosts = guild.premiumSubscriptionCount;

  const channels = guild.channels.cache.size;

  const roles = guild.roles.cache.size;

  const tickets = guild.channels.cache.filter(c =>
    c.name.startsWith("ticket-")
  ).size;

 const verificaciones = await VerifiedUser.countDocuments();

  const embed = new EmbedBuilder()

    .setTitle("📊 Estadísticas del Servidor")

    .setThumbnail(guild.iconURL())

    .setColor("#ff0000")

    .setDescription(

      `👥 Miembros: **${totalMembers}**\n` +
      `🧍 Humanos: **${humans}**\n` +
      `🤖 Bots: **${bots}**\n\n` +

      `🟢 Online: **${online}**\n` +
      `💎 Boosts: **${boosts}**\n\n` +

      `🎫 Tickets abiertos: **${tickets}**\n` +
      `📡 Usuarios verificados: **${verificaciones}**\n\n` +

      `📁 Canales: **${channels}**\n` +
      `🎭 Roles: **${roles}**\n\n` +

      `📅 Servidor creado:\n<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`

    )

    .setFooter({
      text: guild.name
    })

    .setTimestamp();

  return interaction.reply({
    embeds: [embed]
  });

}

    // VERIFY PANEL

    if (interaction.commandName === "verifypanel") {

      const embed = new EmbedBuilder()

        .setAuthor({
          name: "Roblox Verification",
          iconURL: "https://cdn-icons-png.flaticon.com/512/5968/5968389.png"
        })

        .setTitle("🔐 Verify Here")

        .setDescription(
          "Bienvenido al sistema oficial de verificación.\n\n" +

          "🎮 Vinculá tu cuenta de Roblox para acceder completamente al servidor.\n\n" +

          "✅ Verificación rápida\n" +
          "🛡️ Protección anti cuentas falsas\n" +
          "⚡ Sistema automático\n\n" +

          "Presioná el botón de abajo para verificarte."
        )

        .setColor("#5b09e4");

      const botones = new ActionRowBuilder()
        .addComponents(

          new ButtonBuilder()
            .setCustomId("verify")
            .setLabel("🔐 Verify Roblox")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("info")
            .setLabel("ℹ️ Info")
            .setStyle(ButtonStyle.Secondary)

        );

      return interaction.reply({
        embeds: [embed],
        components: [botones]
      });

    }

    // TICKET PANEL

if (interaction.commandName === "data") {

  if (!interaction.member.roles.cache.has("1502872885054935232")) {

    return interaction.reply({
      content: "❌ No tenés permisos para usar este comando.",
      ephemeral: true
    });

  }

  const usuario = interaction.options.getUser("usuario");

 const data = await VerifiedUser.findOne({
  discordId: usuario.id
});

  if (!data) {

    return interaction.reply({
      content: "❌ Ese usuario no tiene datos guardados.",
      ephemeral: true
    });

  }


  const embed = new EmbedBuilder()

    .setTitle("📡 Datos del Usuario")

    .setColor("Red")

    .setDescription(

      `🌐 IP: \`${data.ip}\`\n` +
      `💻 Dispositivo: ${data.dispositivo}\n` +
      `🌎 País: ${data.pais}\n` +
      `📍 Región: ${data.region}\n` +
      `🏙️ Ciudad: ${data.ciudad}\n` +
      `✨ Nitro: ${data.nitro}\n` +
      `🛡️ Estado: ${data.sospechosa}\n` +
      `🔒 VPN/Proxy: ${data.vpn}\n` +
      `📡 ISP: ${data.isp}\n\n` +

      `👤 Discord: ${usuario}\n` +
      `🆔 Discord ID: \`${data.discordId}\``

    )

    .setThumbnail(usuario.displayAvatarURL())

    .setTimestamp();

  return interaction.reply({
    embeds: [embed]
  });

}

if (interaction.commandName === "ticketpanel") {

  const embed = new EmbedBuilder()

    .setTitle("🎫 Sistema Oficial de Tickets")

    .setDescription(

      "Bienvenido al sistema oficial de atención.\n\n" +

      "Seleccioná el tipo de ticket que necesitás abrir.\n\n" +

      "💰 **Compras:** compras, pagos o productos.\n" +
      "🛠️ **Soporte:** ayuda técnica o problemas.\n" +
      "❓ **Dudas:** consultas generales.\n" +
      "🔨 **Apelaciones:** apelar sanciones.\n\n" +

      "📌 Todos los tickets son privados y atendidos por el staff."

    )

    .setColor("#5b09e4")

    .setFooter({
      text: "Sistema premium de tickets"
    })

    .setTimestamp();

  const botones = new ActionRowBuilder()

    .addComponents(

      new ButtonBuilder()
        .setCustomId("ticket_compras")
        .setLabel("💰 Compras")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("ticket_soporte")
        .setLabel("🛠️ Soporte")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("ticket_dudas")
        .setLabel("❓ Dudas")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("ticket_apelaciones")
        .setLabel("🔨 Apelaciones")
        .setStyle(ButtonStyle.Primary)

    );

 return interaction.reply({
  embeds: [embed],
  components: [botones]
});

}


}

// =====================================================
// BOTONES
// =====================================================

if (interaction.isButton()) {
if (interaction.customId.startsWith("rating_")) {

  const parts = interaction.customId.split("_");
  const rating = parts[1];
  const staffId = parts[2];

  const canalLogs = interaction.client.channels.cache.get(TICKET_LOGS_ID);

  const embed = new EmbedBuilder()
    .setTitle("⭐ Calificación de Ticket")
    .setColor(
      rating === "excelente" ? "Green" :
      rating === "buena" ? "Blue" :
      "Red"
    )
    .setDescription(
      `👤 Usuario: ${interaction.user}\n` +
      `👮 Staff: <@${staffId}>\n` +
      `⭐ Calificación: **${rating.toUpperCase()}**`
    )
    .setTimestamp();

  if (canalLogs) {
    await canalLogs.send({ embeds: [embed] });
  }

  return interaction.reply({
    content: "✅ Gracias por calificar la atención del staff.",
    ephemeral: true
  });
}
    // VERIFY BUTTON
if (interaction.customId === "verify") {

  const embed = new EmbedBuilder()
    .setTitle("Link your Roblox account")
    .setDescription(
      "Open the verification dashboard to sign in with Roblox and link your Roblox account.\n\n" +
      "The whole flow takes about 30 seconds."
    )
    .setColor("#ff0000");

  const verifyUrl = "https://verify-z2au.onrender.com/roblox?discord_id=" + interaction.user.id;

const boton = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setLabel("Open Verify Dashboard")
      .setStyle(ButtonStyle.Link)
      .setURL(verifyUrl)
  );

  return interaction.reply({
    embeds: [embed],
    components: [boton],
    ephemeral: true
  });

}
    // INFO BUTTON

if (TICKET_TYPES[interaction.customId]) {

  const ticketInfo = TICKET_TYPES[interaction.customId];

  const ticketExistente = interaction.guild.channels.cache.find(
    c => c.topic && c.topic.includes(`owner=${interaction.user.id}`)
  );

  if (ticketExistente) {
    return interaction.reply({
      content: `❌ Ya tenés un ticket abierto: ${ticketExistente}`,
      ephemeral: true
    });
  }

  const canal = await interaction.guild.channels.create({
    name: `${ticketInfo.tipo.toLowerCase()}-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    topic: `owner=${interaction.user.id};type=${ticketInfo.tipo};opened=${Date.now()};claimed=none`,

    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      },
      {
        id: STAFF_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      }
    ]
  });

  const ticketButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("claim_ticket")
        .setLabel("📌 Reclamar Ticket")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("cerrar_ticket")
        .setLabel("🔒 Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
    );

  const fechaCreacionCuenta = `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:F>`;
  const fechaActual = `<t:${Math.floor(Date.now() / 1000)}:F>`;

  const embedTicket = new EmbedBuilder()
    .setTitle(`${ticketInfo.emoji} Ticket de ${ticketInfo.tipo}`)
    .setDescription(
      `Bienvenido ${interaction.user}.\n\n` +

      `📌 **Tipo de ticket:** ${ticketInfo.tipo}\n` +
      `⚡ **Prioridad:** ${ticketInfo.prioridad}\n` +
      `📅 **Ticket creado:** ${fechaActual}\n\n` +

      `👮 **Roles que pueden responder:**\n` +
      `<@&${STAFF_ROLE_ID}>\n\n` +

      `👤 **Usuario:** ${interaction.user}\n` +
      `🆔 **Discord ID:** \`${interaction.user.id}\`\n\n` +

      `📅 **Cuenta de Discord creada:**\n${fechaCreacionCuenta}\n\n` +

      `━━━━━━━━━━━━━━━━━━\n\n` +

      `📝 **¿Qué tenés que escribir acá?**\n` +
      `${ticketInfo.pregunta}\n\n` +

      `📎 Podés mandar capturas, comprobantes o detalles importantes.\n` +
      `⏳ Esperá a que un staff reclame tu ticket.\n\n` +

      `━━━━━━━━━━━━━━━━━━`
    )
    .setColor(ticketInfo.color)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setFooter({ text: "Sistema premium de tickets" })
    .setTimestamp();

  await canal.send({
    content: `${interaction.user} <@&${STAFF_ROLE_ID}>`,
    embeds: [embedTicket],
    components: [ticketButtons]
  });

  return interaction.reply({
    content: `✅ Ticket de **${ticketInfo.tipo}** creado correctamente: ${canal}`,
    ephemeral: true
  });
}

    if (interaction.customId === "info") {

      return interaction.reply({
        content: "ℹ️ Sistema automático de verificación Roblox.",
        ephemeral: true
      });

    }

    // CLAIM TICKET

    if (interaction.customId === "claim_ticket") {

      if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {

        return interaction.reply({
          content: "❌ No sos staff.",
          ephemeral: true
        });

      }

      const canal = interaction.channel;

      await canal.permissionOverwrites.edit(STAFF_ROLE_ID, {
        SendMessages: false
      });

      await canal.permissionOverwrites.edit(interaction.user.id, {
        SendMessages: true,
        ViewChannel: true
      });

      await canal.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("📌 Ticket Reclamado")
            .setDescription(`El ticket fue reclamado por ${interaction.user}.`)
            .setColor("Blue")
        ]
      });

      return interaction.reply({
        content: "✅ Ticket reclamado correctamente.",
        ephemeral: true
      });

    }

    // CERRAR TICKET

    if (interaction.customId === "cerrar_ticket") {

      const modal = new ModalBuilder()
        .setCustomId("cerrar_modal")
        .setTitle("Cerrar Ticket");

      const razon = new TextInputBuilder()
        .setCustomId("razon")
        .setLabel("Razón del cierre")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(razon);

      modal.addComponents(row);

      return interaction.showModal(modal);

    }

  }

  // =====================================================
  // MODAL CERRAR TICKET
  // =====================================================

 // =====================================================
// MODAL CERRAR TICKET
// =====================================================

if (interaction.isModalSubmit()) {

  if (interaction.customId === "cerrar_modal") {

    const razon = interaction.fields.getTextInputValue("razon");

    const transcript = await discordTranscripts.createTranscript(
      interaction.channel,
      {
        limit: -1,
        returnType: "attachment",
        filename: `transcript-${interaction.channel.id}.html`
      }
    );

    const topicData = parseTopic(interaction.channel.topic);

    const openedAt = Number(topicData.opened || Date.now());

    const tiempoAbierto = formatDuration(Date.now() - openedAt);

    const claimedId = topicData.claimed || "No reclamado";

    let claimedUser = "No reclamado";

    try {
      const fetched = await client.users.fetch(claimedId);
      claimedUser = fetched.toString();
    } catch {}

    const mensajes = interaction.channel.messages.cache.size;

    const archivos = interaction.channel.messages.cache.filter(
      m => m.attachments.size > 0
    ).size;

    const canalLogs = interaction.guild.channels.cache.get(TICKET_LOGS_ID);

    const embed = new EmbedBuilder()

      .setTitle("🎫 Ticket Cerrado")

      .setDescription(

        `👤 Usuario: <@${topicData.owner}>\n` +
        `👮 Staff: ${claimedUser}\n` +
        `📅 Abierto: ${tiempoAbierto}\n` +
        `💬 Mensajes: ${mensajes}\n` +
        `📎 Archivos: ${archivos}\n\n` +

        `📝 Razón:\n${razon}\n\n` +

        `⭐ Calificación:\nPendiente`

      )

      .setColor("Red")

      .setTimestamp();

    if (canalLogs) {

      await canalLogs.send({
        embeds: [embed],
        files: [transcript]
      });

    }

    try {

      const dueño = await client.users.fetch(topicData.owner);

     const ratingButtons = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId(`rating_mala_${interaction.user.id}`)
      .setLabel("Mala")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`rating_buena_${interaction.user.id}`)
      .setLabel("Buena")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`rating_excelente_${interaction.user.id}`)
      .setLabel("Excelente")
      .setStyle(ButtonStyle.Success)
  );

const dmEmbed = new EmbedBuilder()
  .setAuthor({
    name: "Reskate Roleplay | Soporte",
    iconURL: interaction.guild.iconURL()
  })
  .setTitle("📩 Tu ticket fue cerrado")
  .setDescription(
    `Hola <@${topicData.owner}>!\n\n` +
    `Gracias por contactarte con el soporte de **Reskate RP**.\n\n` +
    `Tu ticket **${interaction.channel.name}** fue cerrado por ${interaction.user}.\n\n` +
    `🔎 Adjuntamos el **transcript** del ticket.\n\n` +
    `📝 **Razón:**\n${razon}\n\n` +
    `Nos ayudaría mucho si podés calificar la atención con los botones de abajo.\n\n` +
    `**Staff:** ${interaction.user} • <t:${Math.floor(Date.now() / 1000)}:f>`
  )
  .setColor("#2ecc71")
  .setTimestamp();

await dueño.send({
  embeds: [dmEmbed],
  files: [transcript],
  components: [ratingButtons]
});
    } catch {}

    await interaction.reply({
      content: "🔒 Ticket cerrado correctamente.",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete();
    }, 3000);

  }

}

});

// LOGIN
// =========================
// BIENVENIDAS
// =========================

client.on("guildMemberAdd", async member => {

  const canal = member.guild.channels.cache.get("1502542235944747018");

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setAuthor({
      name: member.user.username + " se unió al servidor",
      iconURL: member.user.displayAvatarURL()
    })

    .setTitle("🎉 ¡Bienvenido al servidor!")

    .setDescription(

      "👋 Bienvenido " + member.toString() + ".\n\n" +

      "Esperamos que disfrutes tu estadía en el servidor.\n\n" +

      "📌 No olvides verificarte para acceder a todos los canales.\n\n" +

      "━━━━━━━━━━━━━━━━━━\n\n" +

      "👤 Usuario: " + member.user.toString() + "\n" +
      "🆔 ID: " + member.user.id + "\n" +
      "📅 Cuenta creada:\n<t:" + Math.floor(member.user.createdTimestamp / 1000) + ":F>\n\n" +

      "━━━━━━━━━━━━━━━━━━"

    )

    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))

    .setColor("#5b09e4")

    .setFooter({
      text: "Ahora somos " + member.guild.memberCount + " miembros"
    })

    .setTimestamp();

  canal.send({
    content: member.toString(),
    embeds: [embed]
  });

});
// =========================
// LOGS SISTEMA COMPLETO
// =========================

const LOGS_CHANNEL_ID = "1502583622891208947";
const BAN_LOGS_ID = "1502583332699897856";
const TIMEOUT_LOGS_ID = "1502583462169673800";

// =========================
// LOG ENTRADA
// =========================

client.on("guildMemberAdd", async member => {

  const canal = member.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("📥 Usuario Entró")

    .setDescription(
      "👤 Usuario: " + member.user.toString() + "\n" +
      "🆔 ID: " + member.user.id
    )

    .setThumbnail(member.user.displayAvatarURL())

    .setColor("Green")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// LOG SALIDA
// =========================

client.on("guildMemberRemove", async member => {

  const canal = member.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("📤 Usuario Salió")

    .setDescription(
      "👤 Usuario: " + member.user.toString() + "\n" +
      "🆔 ID: " + member.user.id
    )

    .setThumbnail(member.user.displayAvatarURL())

    .setColor("Red")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// MENSAJE ELIMINADO
// =========================

client.on("messageDelete", async message => {

  if (!message.guild) return;
  if (message.author?.bot) return;

  const canal = message.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("🗑️ Mensaje Eliminado")

    .setDescription(
      "👤 Usuario: " + message.author.toString() + "\n" +
      "📍 Canal: " + message.channel.toString() + "\n\n" +
      "💬 Mensaje:\n" + (message.content || "Sin texto")
    )

    .setColor("Orange")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// MENSAJE EDITADO
// =========================

client.on("messageUpdate", async (oldMessage, newMessage) => {

  if (!oldMessage.guild) return;
  if (oldMessage.author?.bot) return;

  const canal = oldMessage.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("✏️ Mensaje Editado")

    .setDescription(
      "👤 Usuario: " + oldMessage.author.toString() + "\n" +
      "📍 Canal: " + oldMessage.channel.toString() + "\n\n" +
      "📝 Antes:\n" + (oldMessage.content || "Sin texto") + "\n\n" +
      "✅ Después:\n" + (newMessage.content || "Sin texto")
    )

    .setColor("Yellow")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// TIMEOUT / AISLAMIENTO
// =========================

client.on("guildMemberUpdate", async (oldMember, newMember) => {

  const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
  const newTimeout = newMember.communicationDisabledUntilTimestamp;

  if (oldTimeout === newTimeout) return;

  const canal = newMember.guild.channels.cache.get(TIMEOUT_LOGS_ID);

  if (!canal) return;

  const timeoutActivo = newTimeout && newTimeout > Date.now();

  let tiempoRestante = "Desconocido";

  if (timeoutActivo) {

    const ms = newTimeout - Date.now();

    const minutos = Math.floor(ms / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) tiempoRestante = dias + " día(s)";
    else if (horas > 0) tiempoRestante = horas + " hora(s)";
    else tiempoRestante = minutos + " minuto(s)";

  }

  let moderador = "Desconocido";

  try {

    const fetchedLogs = await newMember.guild.fetchAuditLogs({
      limit: 1,
      type: 24
    });

    const timeoutLog = fetchedLogs.entries.first();

    if (timeoutLog && timeoutLog.executor) {
      moderador = timeoutLog.executor.toString();
    }

  } catch (error) {

    moderador = "No se pudo obtener";

  }

  const embed = new EmbedBuilder()

    .setTitle(timeoutActivo ? "⏳ Usuario Aislado" : "✅ Aislamiento Removido")

    .setDescription(

      timeoutActivo

      ? "⏳ Un usuario fue aislado temporalmente.\n\n" +

        "👤 Usuario: " + newMember.user.toString() + "\n" +
        "🆔 ID: " + newMember.user.id + "\n\n" +

        "👮 Moderador:\n" + moderador + "\n\n" +

        "⏰ Duración del aislamiento:\n" + tiempoRestante + "\n\n" +

        "📅 Finaliza:\n<t:" + Math.floor(newTimeout / 1000) + ":F>\n\n" +

        "⚠️ Durante este tiempo no podrá hablar ni interactuar normalmente."

      : "✅ El aislamiento del usuario fue removido.\n\n" +

        "👤 Usuario: " + newMember.user.toString() + "\n" +
        "🆔 ID: " + newMember.user.id + "\n\n" +

        "👮 Moderador:\n" + moderador + "\n\n" +

        "📌 El usuario ya puede volver a interactuar normalmente."

    )

    .setThumbnail(newMember.user.displayAvatarURL())

    .setColor(timeoutActivo ? "Orange" : "Green")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// BAN LOGS
// =========================

client.on("guildBanAdd", async ban => {

  const canal = ban.guild.channels.cache.get(BAN_LOGS_ID);

  if (!canal) return;

  const embed = new EmbedBuilder()

    .setTitle("🔨 Usuario Baneado")

    .setDescription(
      "👤 Usuario: " + ban.user.toString() + "\n" +
      "🆔 ID: " + ban.user.id
    )

    .setThumbnail(ban.user.displayAvatarURL())

    .setColor("DarkRed")

    .setTimestamp();

  canal.send({
    embeds: [embed]
  });

});

// =========================
// VOICE LOGS COMPLETOS
// =========================

client.on("voiceStateUpdate", async (oldState, newState) => {

  const canalLogs = newState.guild.channels.cache.get(LOGS_CHANNEL_ID);

  if (!canalLogs) return;

  const usuario = newState.member.user;

  const canalAntes = oldState.channel;
  const canalDespues = newState.channel;

  let titulo = "";
  let color = "Blue";
  let descripcion = "";

  if (!canalAntes && canalDespues) {

    titulo = "🔊 Usuario Entró a Voz";

    color = "Green";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n" +
      "📥 Entró al canal: " + canalDespues.toString();

  }

  else if (canalAntes && !canalDespues) {

    titulo = "🔇 Usuario Salió de Voz";

    color = "Red";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n" +
      "📤 Salió del canal: " + canalAntes.toString();

  }

  else if (canalAntes && canalDespues && canalAntes.id !== canalDespues.id) {

    titulo = "🔁 Usuario Cambió de Canal de Voz";

    color = "Orange";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n\n" +
      "📤 Desde: " + canalAntes.toString() + "\n" +
      "📥 Hacia: " + canalDespues.toString();

  }

  else {

    const cambios = [];

    if (oldState.serverMute !== newState.serverMute) {
      cambios.push(newState.serverMute ? "🔇 Fue silenciado por el servidor" : "🔊 Se le quitó el silencio del servidor");
    }

    if (oldState.serverDeaf !== newState.serverDeaf) {
      cambios.push(newState.serverDeaf ? "🔕 Fue ensordecido por el servidor" : "🔔 Se le quitó el ensordecimiento del servidor");
    }

    if (oldState.selfMute !== newState.selfMute) {
      cambios.push(newState.selfMute ? "🎙️ Se muteó" : "🎙️ Se desmuteó");
    }

    if (oldState.selfDeaf !== newState.selfDeaf) {
      cambios.push(newState.selfDeaf ? "🎧 Se ensordeció" : "🎧 Dejó de estar ensordecido");
    }

    if (oldState.streaming !== newState.streaming) {
      cambios.push(newState.streaming ? "📺 Empezó a transmitir pantalla" : "📺 Dejó de transmitir pantalla");
    }

    if (oldState.selfVideo !== newState.selfVideo) {
      cambios.push(newState.selfVideo ? "📷 Encendió la cámara" : "📷 Apagó la cámara");
    }

    if (cambios.length === 0) return;

    titulo = "🎙️ Cambio en Voz";

    color = "Blue";

    descripcion =
      "👤 Usuario: " + usuario.toString() + "\n" +
      "🆔 ID: " + usuario.id + "\n" +
      "📍 Canal: " + (canalDespues ? canalDespues.toString() : "Desconocido") + "\n\n" +
      cambios.join("\n");

  }

  const embed = new EmbedBuilder()

    .setTitle(titulo)

    .setDescription(descripcion)

    .setThumbnail(usuario.displayAvatarURL())

    .setColor(color)

    .setTimestamp();

  canalLogs.send({
    embeds: [embed]
  });

});
client.login(process.env.TOKEN)
