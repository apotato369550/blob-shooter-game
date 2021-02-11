const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bigScoreElement = document.getElementById("big-score");
const startGameButton = document.getElementById("start-game-button");
const modalElement = document.getElementById("modalElement");

// Change canvas size
canvas.width = innerWidth;
canvas.height = innerHeight;

// player class
class Player {
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }
}

// projectile class
class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    update(){
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

// enemy class
class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    update(){
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Particle {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw(){
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
let projectiles = [];
let enemies = [];
let particles= [];

function initialize(){
    player = new Player(canvas.width / 2, canvas.height / 2, 15, "white");
    projectiles = [];
    enemies = [];
    particles= [];
    score = 0;
    scoreElement.innerHTML = score;
    bigScoreElement.innerHTML = score;
}

// change enemy and projectile speed
var speedMultiplier = 2;

// spawn enemies
function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (35 - 8) + 8;

        let x;
        let y;

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = "hsl(" + Math.random() * 360 +", 50%, 50%)";
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle) * speedMultiplier,
            y: Math.sin(angle) * speedMultiplier
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
}

// animation loop
let animationId;
let score = 0;
const friction = 0.98;
function animate(){
    animationId = requestAnimationFrame(animate);
    context.fillStyle = "rgba(0, 0, 0, 0.1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    // loop through particles
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1);
        } else {
            particle.update();
        }
        particle.update();
    });

    // loop through projectiles
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update();

        // if projectile is beyond the bounds of the screen, delete it
        if(projectile.x - projectile.radius < 0 || 
        projectile.x > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0)
        }
    })

    // enemy collision with player or projectile
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y); 
        if(distance - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            bigScoreElement.innerHTML = score;
            modalElement.style.display = "flex";
        }

        console.log()
        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y); 

            // when projectile touches enemy
            // note: In order for gsap to work, I need to disable the CORS extension on my browser
            if(distance - enemy.radius - projectile.radius < 1){

                for(let i = 0; i < enemy.radius * 2 + 8; i++){
                    particles.push(new Particle(enemy.x, enemy.y, Math.random() * 3, enemy.color, {
                        x: (Math.random() - 0.5) * 9,
                        y: (Math.random() - 0.5) * 9
                    }));
                }
                if(enemy.radius - 10 > 10){
                    score += 100;
                    scoreElement.innerHTML = score;

                    gsap.to(enemy, {
                       radius: enemy.radius - 10 
                    });
                    setTimeout(() =>  {
                        projectiles.splice(projectileIndex, 1)
                    }, 0);
                } else {
                    score += 250;
                    scoreElement.innerHTML = score;
                    setTimeout(() =>  {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        });
    })
}

// event listener that listens to clicks
window.addEventListener("click", (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * speedMultiplier,
        y: Math.sin(angle) * speedMultiplier
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity));
});

startGameButton.addEventListener("click", () => {
    initialize();
    animate();
    spawnEnemies();
    modalElement.style.display = "none";
});

