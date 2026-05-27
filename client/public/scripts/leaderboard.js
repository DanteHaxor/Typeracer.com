import baseURL from "./baseURL.js";

let lb = document.getElementById("leaderboard-sec");

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return days + " days ago";
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : months + " months ago";
}

function buildLeaderboardTable(rows, columns) {
  const head = columns.map((c) => `<th>${c}</th>`).join("");
  const body = rows
    .map(
      (row, i) =>
        `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

async function loadLeaderboard() {
  try {
    const res = await fetch(baseURL + "/api/user/leaderboard");
    const users = await res.json();
    if (!res.ok || !Array.isArray(users)) return [];
    return users;
  } catch (err) {
    console.log(err);
    return [];
  }
}

lb.innerHTML += `
<div id="leaderboard">
      <h1>LEADERBOARD</h1>
      <div id="leaderboard-menu">
        <div id="latest-scores">
          <h4><i class="fa-solid fa-tv"></i>&nbsp;&nbsp;Latest High Scores</h4>
        </div>
        <div id="hof-scores">
          <h4><i class="fa-solid fa-thumbs-up"></i>&nbsp;&nbsp;Hall of Fame</h4>
        </div>
      </div>
      <div id="leaderboard-body">
        <div id="latest">
          <p>Loading scores...</p>
        </div>
      </div>
    </div>
`;

async function renderLatest() {
  const users = await loadLeaderboard();
  const latest = document.getElementById("latest");
  if (!users.length) {
    latest.innerHTML =
      "<p>No registered racers yet. Create an account and race to appear here!</p>";
    return;
  }
  const rows = users.map((u, i) => [
    i + 1,
    u.name,
    (u.wpm || 0) + " wpm",
    formatTimeAgo(u.updatedAt),
  ]);
  latest.innerHTML = buildLeaderboardTable(rows, [
    "Sl.no.",
    "Name",
    "Speed",
    "Updated",
  ]);
}

async function renderHof() {
  const users = await loadLeaderboard();
  const latest = document.getElementById("latest");
  if (!users.length) {
    latest.innerHTML = "<p>No hall of fame entries yet.</p>";
    return;
  }
  const rows = users.map((u, i) => [
    i + 1,
    u.name,
    (u.wpm || 0) + " wpm",
    u.races || 0,
  ]);
  latest.innerHTML = buildLeaderboardTable(rows, [
    "Sl.no.",
    "Name",
    "Best Speed",
    "Races",
  ]);
}

renderLatest();

document.getElementById("latest-scores").addEventListener("click", renderLatest);
document.getElementById("hof-scores").addEventListener("click", renderHof);
