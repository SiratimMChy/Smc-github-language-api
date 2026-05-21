# Smc-github-language-api

Smc-language-api is a lightweight Node.js service that generates dynamic GitHub language statistics as an SVG visualization.

---

## Features

- Single public endpoint: `/languages`
- Aggregates repository language usage for a GitHub user
- Returns an SVG chart suitable for README embeds
- Built with Node.js, Express, Axios, and the GitHub API

---

## Prerequisites

- Node.js v14 or newer
- npm
- GitHub Personal Access Token

---

## Installation

```bash
npm install
```

### Environment

Create a `.env` file:

```env
GITHUB_TOKEN=your_github_token
USERNAME=your_github_username
PORT=3000
```

### Run

```bash
npm start
```

---

## Endpoint

### `GET /languages`

Returns a GitHub stats card as SVG.

Example:
```bash
curl http://localhost:3000/languages
```

---

## Usage in GitHub README

```markdown
![GitHub Language Stats](https://your-deployment-url/languages)
```

---

## Notes

* Ensure GITHUB_TOKEN and USERNAME are configured correctly.
* Do not commit the .env file to source control.
* The /languages route is the public-facing SVG endpoint.
