require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.USERNAME;

const headers = {
  Authorization: `token ${TOKEN}`,
  "User-Agent": "smc-language-api"
};



async function getLanguages() {
  const res = await axios.get(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100`,
    { headers }
  );

  const map = {};

  res.data.forEach(repo => {
    if (!repo.language) return;
    map[repo.language] = (map[repo.language] || 0) + 1;
  });

  return map;
}



function getChartData(map) {
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

  const data = [];
  for (const [lang, count] of sorted) {
    data.push({
      lang,
      percent: count / total
    });
  }

  return data;
}

// 🔹 3. Create Bar Chart
function createBarChart(data) {
  const colors = {
    JavaScript: "#F1E05A",
    HTML: "#E34C26",
    Java: "#B07219",
    TypeScript: "#3178C6",
    CSS: "#563D7C"
  };

  let paths = "";
  let y = 80;

  // Take top 5 languages
  data.slice(0, 5).forEach((d, i) => {
    const color = colors[d.lang] || "#888";
    const percentText = (d.percent * 100).toFixed(1) + "%";
    const maxBarWidth = 250;
    const barWidth = maxBarWidth * d.percent;
    const delay = (i * 0.1).toFixed(2);

    // Language Name
    paths += `<text x="35" y="${y + 4}" fill="#E5E7EB" class="lang-text" style="animation-delay: ${delay}s">${d.lang}</text>\n`;
    
    // Background Track
    paths += `<rect x="135" y="${y - 4}" width="${maxBarWidth}" height="8" fill="#1F2937" rx="4" class="track" style="animation-delay: ${delay}s"/>\n`;
    
    // Foreground Bar
    paths += `<rect x="135" y="${y - 4}" width="${barWidth}" height="8" fill="${color}" rx="4" filter="url(#glow)" class="bar-width" style="animation-delay: ${delay}s"/>\n`;
    
    // Percentage
    paths += `<text x="${135 + maxBarWidth + 15}" y="${y + 4}" fill="#9CA3AF" class="percent-text" style="animation-delay: ${delay}s">${percentText}</text>\n`;

    y += 24;
  });

  return paths;
}


// 🎯 MAIN ROUTE
app.get("/languages", async (req, res) => {
  try {
    const map = await getLanguages();
    const chartData = getChartData(map);
    const chart = createBarChart(chartData);

    const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 495 195' width='495px' height='195px' direction='ltr'>
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0A0F1C" />
          <stop offset="100%" stop-color="#12182B" />
        </linearGradient>

        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00FFA3" />
          <stop offset="100%" stop-color="#00B8FF" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="blobBlur">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <clipPath id='outer_rectangle'>
            <rect width='495' height='195' rx='16'/>
        </clipPath>
      </defs>

      <style>
        .title { font: 700 20px "Inter", "Segoe UI", sans-serif; fill: url(#textGradient); letter-spacing: -0.5px; }
        .subtitle { font: 500 12px "Inter", "Segoe UI", sans-serif; fill: #9CA3AF; }
        .lang-text { font: 600 13px "Inter", "Segoe UI", sans-serif; opacity: 0; animation: fadein 0.5s ease-out forwards; }
        .percent-text { font: 600 12px "Inter", "Segoe UI", sans-serif; opacity: 0; animation: fadein 0.5s ease-out forwards; }
        .track { opacity: 0; animation: fadein 0.5s ease-out forwards; }
        
        @keyframes fadein {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes growX {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        
        .bar-width {
          transform-origin: 135px 0;
          animation: growX 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transform: scaleX(0);
          opacity: 0;
        }

        .chart-container {
          animation: fadein 1s ease-out forwards;
        }
      </style>

      <g clip-path='url(#outer_rectangle)'>
        <rect width="495" height="195" fill="url(#bgGradient)" rx="16" stroke="#2D3748" stroke-width="1.5"/>

        <circle cx="420" cy="40" r="80" fill="#00FFA3" opacity="0.1" filter="url(#blobBlur)" />
        <circle cx="70" cy="170" r="100" fill="#00B8FF" opacity="0.1" filter="url(#blobBlur)" />

        <text x="35" y="42" class="title">Top Languages</text>
        <text x="35" y="60" class="subtitle">Most used languages across repositories</text>

        <g class="chart-container">
          ${chart}
        </g>
      </g>
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error");
  }
});


// health check
app.get("/", (req, res) => {
  res.send("Language API Running 🚀");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});