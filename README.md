# 🧠 2048 Game

## 🚀 Live Demo

👉 Visit: [http://18.234.165.99/](http://18.234.165.99/)  
---

## 📁 Project Structure

2048_game/

├── public/ # Frontend (HTML, CSS, JS)

│ ├── index.html

│ ├── script.js

│ └── style.css

├── server.js # Express.js backend API

├── scores.json # Score database

├── Dockerfile # For building Docker container

├── .dockerignore

├── .gitignore

└── .github/workflows/docker-deploy.yml # GitHub Actions CI/CD

## 🎯 Features

- 🎮 Playable 2048 game (vanilla JS + HTML/CSS)
- 📊 Backend API to:
  - Save scores
  - Get top scores
  - View statistics
- 🧰 Express.js + Node.js backend
- 🐳 Docker containerization
- ☁️ Hosted on AWS EC2
- 🔁 CI/CD with GitHub Actions


## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **DevOps**: Docker, GitHub Actions
- **Hosting**: AWS EC2 (Amazon Linux)

---

## 🔌 API Endpoints

| Method | Endpoint              | Description               |
|--------|------------------------|---------------------------|
| GET    | `/api/health`          | Health check              |
| GET    | `/api/scores`          | Get all scores            |
| GET    | `/api/scores/top/:n`   | Top N scores              |
| POST   | `/api/scores`          | Submit a new score        |
| GET    | `/api/stats`           | Game statistics           |
| DELETE | `/api/scores/:id`      | Delete score by ID        |
| DELETE | `/api/scores`          | Clear all scores          |

---

**GitHub Actions**
 
Located at: .github/workflows/docker-deploy.yml

Basic pipeline:

Trigger on push to main

Build Docker image

---

**🌐Deployment Steps:**

1.Create EC2 Instance (Amazon Linux)

2.Install Docker:

sudo yum update -y

sudo yum install docker -y

sudo service docker start

3.Build & run:

docker build -t secure-2048 .

docker run -d -p 80:3000 secure-2048
