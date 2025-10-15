// 🟢 IMPORTA OS PACOTES NECESSÁRIOS
import fetch from "node-fetch";

// 🟡 SUA CHAVE DA API (vamos guardar segura no Render depois)
const API_KEY = process.env.API_KEY;

// 🟢 FUNÇÃO QUE PEGA OS DADOS DOS JOGOS AO VIVO
async function getLiveMatches() {
  const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await response.json();
  return data.response;
}

// 🟡 FUNÇÃO QUE VERIFICA ATAQUES E CHUTES
function analyzeTeamStats(match) {
  const home = match.statistics?.[0]?.statistics || [];
  const away = match.statistics?.[1]?.statistics || [];

  const getStat = (stats, name) => {
    const found = stats.find(s => s.type === name);
    return found ? Number(found.value || 0) : 0;
  };

  const homeShots = getStat(home, "Shots on Goal");
  const awayShots = getStat(away, "Shots on Goal");
  const homeAttacks = getStat(home, "Attacks");
  const awayAttacks = getStat(away, "Attacks");

  // 🟩 Define quando mandar alerta
  if (homeShots >= 4 && homeAttacks >= 6) {
    console.log(`⚠️ ${match.teams.home.name} está pressionando muito! ${homeShots} chutes e ${homeAttacks} ataques.`);
  }

  if (awayShots >= 4 && awayAttacks >= 6) {
    console.log(`⚠️ ${match.teams.away.name} está pressionando muito! ${awayShots} chutes e ${awayAttacks} ataques.`);
  }
}

// 🕒 FUNÇÃO PRINCIPAL
async function monitorMatches() {
  console.log("📡 Monitorando jogos em tempo real...");
  const matches = await getLiveMatches();

  if (!matches.length) {
    console.log("Nenhum jogo ao vivo agora.");
    return;
  }

  for (const match of matches) {
    analyzeTeamStats(match);
  }
}

// 🔁 REPETE A CADA 2 MINUTOS
setInterval(monitorMatches, 2 * 60 * 1000);

// Roda imediatamente ao iniciar
monitorMatches();
