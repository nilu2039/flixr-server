<div align="center">
  <br />
      <img width="851" height="489" src="https://github.com/user-attachments/assets/15559764-b278-415c-a8c2-5251ac083549" alt="Project Banner">
    </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white" alt="express" />
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="docker" />
    <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="youtube data api v3" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="postgres" />
    <img src="https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white" alt="redis" />
  </div>

  <h3 align="center">Flixr</h3>

  <div align="center">A tool to automate YouTube video uploads with a seamless approval workflow.</div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🤸 [Quick Start](#quick-start)

## <a name="introduction">🤖 Introduction</a>

Flixr is a tool to automate YouTube video uploads with a seamless approval workflow. Utilized Express for the backend, Next.js for the frontend, and integrated the YouTube Data API v3. Leveraged Docker, PostgreSQL, and Redis for robust data management.

This is the backend for Flixr.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Express
- PostgreSQL
- Passport.js
- Redis
- Docker

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

**Cloning the Repository**

```bash
git https://github.com/nilu2039/flixr-server.git
cd flixr-server
```

**Installation**

Install the project dependencies using pnpm:

```bash
pnpm i
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
NODE_ENV=
PORT=
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
DB_HOST=
ALLOWED_ORIGINS=
MIGRATION_DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
DATABASE_URL=
MIGRATION_DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
AWS_VIDEO_UPLOAD_BUCKET=
AWS_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
FE_GOOGLE_REDIRECT_URL=
```

Replace the placeholder values with your actual credentials.

**Running the Project**

```bash
docker compose up --build
```
