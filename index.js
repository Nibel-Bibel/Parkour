const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = new Player(100, 300, 40, "cyan");

let obstacles = [];
let platforms = [];
let orbs = [];

let frame = 0;
let score = 0;
let speed = 5;
let gameOver = false;

let health = 150;
const maxHealth = 150;
let jumpChain = 0;

function spawnWorld() {
  const blockW = 20, blockH = 20;

  // Fewer floor obstacles, more spread out
  const floorCount = 3 + Math.floor(Math.random() * 3); // 3–5
  for (let i = 0; i < floorCount; i++) {
    obstacles.push({
      x: canvas.width + i * (blockW + 40),
      y: 330 + (i % 2 === 0 ? -Math.random() * 30 : 0),
      width: blockW,
      height: blockH,
      color: "red",
      damage: 10,
      speed
    });
  }

  // Fewer roof obstacles, more spread out
  const roofCount = 2 + Math.floor(Math.random() * 3); // 2–4
  for (let i = 0; i < roofCount; i++) {
    obstacles.push({
      x: canvas.width + i * (blockW + 50),
      y: 50 + (i % 2 === 0 ? Math.random() * 20 : 0),
      width: blockW,
      height: blockH,
      color: "red",
      damage: 10,
      speed
    });
  }

  // Fewer platforms, wider spacing
  const platformCount = 2 + Math.floor(Math.random() * 2); // 2–3
  for (let i = 0; i < platformCount; i++) {
    const gap = 350 + Math.random() * 100;
    const y = 120 + Math.random() * 160;

    platforms.push({
      x: canvas.width + i * gap,
      y,
      width: 80,
      height: 15,
      color: "yellow",
      speed
    });

    // Optional mid-air red obstacle
    if (Math.random() < 0.4) {
      obstacles.push({
        x: canvas.width + i * gap + 60,
        y: y - 50 - Math.random() * 40,
        width: blockW,
        height: blockH,
        color: "red",
        damage: 10,
        speed
      });
    }

    // Optional healing orb
    if (Math.random() < 0.3) {
      orbs.push({
        x: canvas.width + i * gap + 40,
        y: y - 25,
        radius: 10,
        heal: 7,
        color: "limegreen",
        speed
      });
    }
  }
}

function update() {
  if (gameOver) return;

  const prevGrounded = player.grounded;
  player.update(platforms);

  // Reset jump chain if player lands
  if (player.grounded && !prevGrounded) {
    jumpChain = 0;
  }

  // Move world objects leftward
  for (const arr of [obstacles, platforms, orbs]) {
    arr.forEach(obj => obj.x -= speed);
  }

  // Remove off-screen objects
  obstacles = obstacles.filter(obj => obj.x + obj.width > 0);
  platforms = platforms.filter(obj => obj.x + obj.width > 0);
  orbs = orbs.filter(obj => obj.x + obj.radius > 0);

  // Collide with red obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (checkRectCollision(player, obstacles[i])) {
      health -= obstacles[i].damage;
      obstacles.splice(i, 1);
    }
  }

  // Collide with healing orbs
  for (let i = orbs.length - 1; i >= 0; i--) {
    if (checkCircleCollision(orbs[i], player)) {
      health = Math.min(maxHealth, health + orbs[i].heal);
      orbs.splice(i, 1);
    }
  }

  // Health check
  if (health <= 0) {
    health = 0;
    gameOver = true;
    alert("Game Over! Score: " + Math.floor(score));
    window.location.reload();
  }

  // Spawn new world sections over time
  const spawnInterval = Math.max(30, 80 - Math.floor(score / 10));
  if (frame % spawnInterval === 0) {
    spawnWorld();
  }

  // Gradually increase speed
  speed = 5 + score / 100;

  frame++;
  score += 0.5;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBorders();
  player.draw(ctx);

  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);
  });

  platforms.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  orbs.forEach(o => {
    ctx.beginPath();
    ctx.fillStyle = o.color;
    ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  drawUI();
}

function drawUI() {
  // Score + message
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + Math.floor(score), 10, 30);
  ctx.fillText("Sacrifices must be made", 10, 60);

  // Health bar
  const barW = 200, barH = 20, x = canvas.width - barW - 20, y = 20;
  ctx.fillStyle = "black";
  ctx.fillRect(x - 2, y - 2, barW + 4, barH + 4);
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, barW, barH);
  ctx.fillStyle = "limegreen";
  ctx.fillRect(x, y, (health / maxHealth) * barW, barH);
  ctx.strokeStyle = "white";
  ctx.strokeRect(x, y, barW, barH);
}

function drawBorders() {
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, 50);      // top border
  ctx.fillRect(0, 350, canvas.width, 50);    // bottom border
}

function checkRectCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.size > b.x &&
         a.y < b.y + b.height &&
         a.y + a.size > b.y;
}

function checkCircleCollision(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.size));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.size));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    player.jump();
    jumpChain++;

    if (jumpChain % 3 === 0) {
      const damage = 10 + Math.floor(score / 50);
      health -= damage;
    }
  }
});

gameLoop();
