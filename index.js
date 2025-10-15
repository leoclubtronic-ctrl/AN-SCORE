import fetch from "node-fetch";

const API_KEY = process.env.API_KEY;

// Função que busca jogos ao vivo
async function getLiveMatches() {
  const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
    headers: { "x-apisports-key": API_KEY }
  });
  const data = await response.json();
  return data.response;
}

// Função para extrair valor de estatística
function getStat(stats, name) {
  const found = stats.find(s => s.type === name);
  return found ? Number(found.value || 0) : 0;
}

// Função principal de análise
function analyzeMatch(match) {
  const homeStats = match.statistics?.[0]?.statistics || [];
  const awayStats = match.statistics?.[1]?.statistics || [];

  const homeAttacks = getStat(homeStats, "Attacks");
  const awayAttacks = getStat(awayStats, "Attacks");
  const homeDangerous = getStat(homeStats, "Dangerous Attacks");
  const awayDangerous = getStat(awayStats, "Dangerous Attacks");
  const homeShots = getStat(homeStats, "Shots on Goal");
  const awayShots = getStat(awayStats, "Shots on Goal");

  // Total de ataques perigosos no jogo
  const totalDanger = homeDangerous + awayDangerous;
  if (totalDanger === 0) return;

  // Percentual de pressão ofensiva
  const homePressure = Math.round((homeDangerous / totalDanger) * 100);
  const awayPressure = Math.round((awayDangerous / totalDanger) * 100);

  // Alerta se a pressão for muito alta
  const PRESSURE_LIMIT = 65; // percentual mínimo para alerta

  if (homePressure >= PRESSURE_LIMIT) {
    console.log(`🔥 ${match.teams.home.name} em ALTA PRESSÃO! ${homePressure}% dos ataques perigosos. (${homeDangerous}x${awayDangerous})`);
  }

  if (awayPressure >= PRESSURE_LIMIT) {
    console.log(`🔥 ${match.teams.away.name} em ALTA PRESSÃO! ${awayPressure}% dos ataques perigosos. (${awayDangerous}x${homeDangerous})`);
  }
}

// Função que monitora os jogos em tempo real
async function monitorMatches() {
  console.log("📊 Atualizando estatísticas ao vivo...");
  const matches = await getLiveMatches();

  if (!matches.length) {
    console.log("Nenhum jogo ao vivo no momento.\n");
    return;
  }

  for (const match of matches) {
    analyzeMatch(match);
  }

  console.log("--------------------------------------------------\n");
}

// Atualiza a cada 90 segundos
setInterval(monitorMatches, 90 * 1000);
monitorMatches();
