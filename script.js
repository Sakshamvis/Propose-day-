const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = 'START'; // START, PLAYING, WON, PROPOSAL, END
let score = 0;
const WIN_SCORE = 15; // Hearts needed to fill the meter
let player;
let hearts = [];
let particles = []; // For effects
let animationId;
let loveMeter = document.getElementById('love-fill');

// DOM Elements
const startScreen = document.getElementById('start-screen');
const proposalScreen = document.getElementById('proposal-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const startBtn = document.getElementById('start-btn');
const yesBtn = document.getElementById('click', () => {if (navigator.vibrate) navigator.vibrate([200,100,200]);
const noBtn = document.getElementById('no-btn');
const message = `
Shreya, I choose u in every universe ❤️♾️

Ik I sometimes irritate u a lot, bt I really can’t help it yrr 😭
I try to act nonchalant, bt nhi hota tere samne.
Gnmsti mai kabhi kabhi kuch bhi nikal jata hai mere muh se and later I regret it like an idiot 🤦🏻‍♂️

Also let’s forget about the past and start a new journey from point zero. Fresh start. Just u n me ✨🤍

Ik u never expect anything from me, unlike dumb me who expects the whole world from u 🥺

Whenever I’m on vc with u, my brain literally stops working… I just freeze 😭

People say love is just a game… and u can’t win it 🎮
Bt if there’s even one way, I’ll find it someday ❤️
And then this fool will rush in, put ur head on my shoulder, whisper in ur ear…
baby… tell me u love me too 🫶🏻

I’ll never ever give up on u. Ever. 🤞❤️

will u be mine, today, tomorrow, and every lifetime after? 💍✨

cross my heart, it’s always u ❤️
`;
const photos = ["photo1.jpg","photo2.jpg","photo3.jpg"];
let idx = 0;

function startSlideshow() {
    const img = document.getElementById("slide-img");
    img.src = photos[0];

    setInterval(() => {
        idx = (idx + 1) % photos.length;
        img.src = photos[idx];
    }, 2500);
}

// Resize Handling
function typeWriter(text, el, speed = 30) {
    let i = 0;

    function type() {
        if (i < text.length) {
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}
                                                       
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (player) {
         player.y = canvas.height - 100;
    }
}
window.addEventListener('resize', resize);

// Player Object
class Player {
    constructor() {
        this.w = 100; // width
        this.h = 80;  // height
        this.x = canvas.width / 2 - this.w / 2;
        this.y = canvas.height - 100;
        this.speed = 10;
        this.dx = 0;
    }

    draw() {
        // Draw a cute basket or cup (using simple shapes for now, can be improved or replaced with image)
        ctx.fillStyle = '#ff4d6d';
        
        // Simple semi-circle basket
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y, this.w/2, 0, Math.PI, false);
        ctx.fill();
        
        // Handle
        ctx.beginPath();
        ctx.strokeStyle = '#c9184a';
        ctx.lineWidth = 5;
        ctx.arc(this.x + this.w/2, this.y - 10, this.w/2, Math.PI, 0, false);
        ctx.stroke();
    }

    update() {
        this.x += this.dx;
        
        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;
    }
}

// Heart Object
class Heart {
    constructor() {
        this.size = Math.random() * 20 + 20; // 20-40px
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size;
        this.speed = Math.random() * 3 + 2; // 2-5 speed
        this.color = `hsl(${Math.random() * 20 + 340}, 100%, 60%)`; // Pinkish/Red variations
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        let topCurveHeight = this.size * 0.3;
        ctx.moveTo(this.x, this.y + topCurveHeight);
        // top left curve
        ctx.bezierCurveTo(
            this.x, this.y, 
            this.x - this.size / 2, this.y, 
            this.x - this.size / 2, this.y + topCurveHeight
        );
        // bottom left curve
        ctx.bezierCurveTo(
            this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x, this.y + (this.size + topCurveHeight) / 2, 
            this.x, this.y + this.size
        );
        // bottom right curve
        ctx.bezierCurveTo(
            this.x, this.y + (this.size + topCurveHeight) / 2, 
            this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x + this.size / 2, this.y + topCurveHeight
        );
        // top right curve
        ctx.bezierCurveTo(
            this.x + this.size / 2, this.y, 
            this.x, this.y, 
            this.x, this.y + topCurveHeight
        );
        ctx.fill();
    }

    update() {
        this.y += this.speed;
    }
}

// Particle Effect
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = 100;
        this.color = `rgba(255, 255, 255, 0.8)`;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 2;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 100;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Input Handling
function handleInput(e) {
    if (!player) return;
    
    // Mouse / Touch
    if (e.type === 'mousemove' || e.type === 'touchmove') {
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        player.x = clientX - player.w / 2;
    }
}

window.addEventListener('mousemove', handleInput);
window.addEventListener('touchmove', handleInput, { passive: false });

// Game Functions
function spawnHeart() {
    if (Math.random() < 0.02) {
        hearts.push(new Heart());
    }
}
function spawnFloatingHeart() {
    const h = document.createElement("div");
    h.className = "floating-heart";
    h.innerText = "❤️";

    h.style.left = Math.random() * 100 + "vw";
    h.style.animationDuration = (6 + Math.random() * 5) + "s";

    document.body.appendChild(h);

    setTimeout(() => h.remove(), 10000);
}

setInterval(spawnFloatingHeart, 400);

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    if (gameState === 'PLAYING') {
        player.update();
        player.draw();

        spawnHeart();

        hearts.forEach((heart, index) => {
            heart.update();
            heart.draw();

            // Collision Detection
            // Simple box-ish collision for now
            if (
                heart.y + heart.size > player.y &&
                heart.x > player.x &&
                heart.x < player.x + player.w
            ) {
                // Catch!
                hearts.splice(index, 1);
                score++;
                createParticles(heart.x, heart.y);
                updateScore();
                
                if (score >= WIN_SCORE) {
                    triggerProposal();
                }
            } else if (heart.y > canvas.height) {
                hearts.splice(index, 1); // Missed
            }
        });

        particles.forEach((p, idx) => {
            p.update();
            p.draw();
            if (p.life <= 0) particles.splice(idx, 1);
        });
    }

    animationId = requestAnimationFrame(updateGame);
}

function createParticles(x, y) {
    for(let i=0; i<5; i++) {
        particles.push(new Particle(x, y));
    }
}

function updateScore() {
    const percentage = (score / WIN_SCORE) * 100;
    loveMeter.style.width = `${percentage}%`;
}

function triggerProposal() {
    gameState = 'PROPOSAL';
    // Small delay to let the particle effect finish or just smooth transition
    setTimeout(() => {
        proposalScreen.classList.remove('hidden');
        proposalScreen.classList.add('active');
        // Stop the loop or keep it running for background? 
        // Let's keep loop for maybe background falling hearts but pause spawning
    }, 500);
}

function startGame() {
    const music = document.getElementById('bg-music');

    music.volume = 0; // start silent
    music.play();

    // smooth fade-in (romantic effect)
    let v = 0;
    const fade = setInterval(() => {
        v += 0.02;
        music.volume = v;
        if (v >= 0.5) clearInterval(fade);
    }, 120);

    resize();
    player = new Player();
    hearts = [];
    score = 0;
    updateScore();
    gameState = 'PLAYING';
    
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    
    updateGame();
}

// Event Listeners
startBtn.addEventListener('click', startGame);

yesBtn.addEventListener('click', () => {
    proposalScreen.classList.remove('active');
    proposalScreen.classList.add('hidden');
    celebrationScreen.classList.remove('hidden');
    celebrationScreen.classList.add('active');
    triggerConfetti(); // Optional: Implement confetti
});

// "No" button runs away
noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', moveNoButton);

function moveNoButton() {
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
}

function triggerConfetti() {
    for (let i = 0; i < 120; i++) {
        const c = document.createElement("div");

        c.style.position = "fixed";
        c.style.left = Math.random() * 100 + "vw";
        c.style.top = "-10px";
        c.style.width = "8px";
        c.style.height = "8px";
        c.style.background = `hsl(${Math.random()*360},100%,60%)`;
        c.style.pointerEvents = "none";
        c.style.transition = "transform 2s linear, opacity 2s";

        document.body.appendChild(c);

        setTimeout(() => {
            c.style.transform = "translateY(100vh) rotate(720deg)";
            c.style.opacity = 0;
        }, 10);

        setTimeout(() => c.remove(), 2000);
    }
}


// Initialize
resize();






