require("dotenv").config();

const fs = require("fs");
const express = require("express");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 📂 cria banco automático
if (!fs.existsSync("dados.json")) {
  fs.writeFileSync(
    "dados.json",
    JSON.stringify({ users: {}, canaisBanco: {} }, null, 2)
  );
}

const prefix = "!";

// 🌐 Render
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("CoinVault online 🚀");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log("Servidor web rodando!");
});

// 🤖 Bot pronto
client.once("ready", () => {
  console.log(`Bot logado como ${client.user.tag}`);
});

// 📩 Comandos
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  // 🔒 garante que tem servidor (evita erro em DM)
  if (!message.guild) return;

  // 📂 lê dados
  const dados = JSON.parse(fs.readFileSync("dados.json"));

  // 🏦 canal permitido por servidor
  const canalPermitido = dados.canaisBanco?.[message.guild.id];

  // 🚫 bloqueia se não estiver no canal certo
  if (canalPermitido && message.channel.id !== canalPermitido) {
    return; // ou use reply se quiser avisar
  }

  const args = message.content.slice(prefix.length).split(" ");
  const cmd = args.shift().toLowerCase();

  try {
    const comando = require(`./comandos/${cmd}.js`);
    comando.run(message, args);
  } catch (error) {
    message.reply("Comando não encontrado.");
  }
});

client.login(process.env.TOKEN);