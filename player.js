class Player {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;

    this.velocityY = 0;
    this.gravity = 0.7;
    this.jumpForce = -12;

    this.grounded = false;
  }

  update(platforms) {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // Floor collision
    if (this.y + this.size > 350) {
      this.y = 350 - this.size;
      this.velocityY = 0;
      this.grounded = true;
    } else {
      // Check platform collision
      this.grounded = false;
      for (let platform of platforms) {
        if (
          this.x + this.size > platform.x &&
          this.x < platform.x + platform.width &&
          this.y + this.size >= platform.y &&
          this.y + this.size <= platform.y + platform.height &&
          this.velocityY >= 0 // Falling down
        ) {
          this.y = platform.y - this.size;
          this.velocityY = 0;
          this.grounded = true;
          break;
        }
      }
    }
  }

  jump() {
    // Infinite jumps: no grounded or jumpCount check
    this.velocityY = this.jumpForce;
    this.grounded = false;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
