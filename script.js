const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const serverSelect = document.getElementById("serverSelect");
const playBtn = document.getElementById("playBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameStarted = false;
let serverMode = "FFA";

serverSelect.addEventListener("change", e => {
    serverMode = e.target.value.toUpperCase();
    if(gameStarted) resetGame();
});

playBtn.addEventListener("click", () => {
    document.querySelector(".container").style.display = "none";
    gameStarted = true;
    startGame();
});

let mouse = { x: canvas.width/2, y: canvas.height/2 };
let cells = [];
let foods = [];
let viruses = [];
let score = 0;

function createFood(){
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 5,
        color: `hsl(${Math.random()*360}, 70%, 50%)`
    }
}

function createVirus(){
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 40,
        color: "#2ecc71"
    }
}

function createPlayer(){
    return {
        x: canvas.width/2,
        y: canvas.height/2,
        r: 30,
        vx: 0,
        vy: 0
    }
}

function resetGame(){
    cells = [createPlayer()];
    foods = [];
    viruses = [];
    score = 0;
    for(let i = 0; i < 200; i++) foods.push(createFood());
    if(serverMode === "FFA"){
        for(let i = 0; i < 10; i++) viruses.push(createVirus());
    }
}

function startGame(){
    resetGame();
    gameLoop();
}

canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener("keydown", e => {
    if(!gameStarted) return;
    if(serverMode !== "FFA"){
        if(e.key === "f" || e.key === "F") feed();
        if(e.key === "g" || e.key === "G") split(4);
        if(e.key === "h" || e.key === "H") split(16);
        if(e.key === "j" || e.key === "J") split(32);
        if(e.key === "k" || e.key === "K") split(64);
    }
});

function feed(){
    cells.forEach(c => {
        if(c.r > 15) c.r -= 2;
        foods.push({x: c.x, y: c.y, r: 4, color: "#fff"});
    });
}

function split(amount){
    let newCells = [];
    cells.forEach(c => {
        if(c.r > 20){
            let newR = c.r / 2;
            c.r = newR;
            for(let i = 0; i < amount / cells.length; i++){
                newCells.push({
                    x: c.x + Math.random() * 20,
                    y: c.y + Math.random() * 20,
                    r: newR,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10
                });
            }
        }
    });
    cells = cells.concat(newCells);
}

function explode(cell){
    let pieces = 8;
    let newCells = [];
    for(let i = 0; i < pieces; i++){
        newCells.push({
            x: cell.x,
            y: cell.y,
            r: cell.r / pieces,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15
        });
    }
    cells = newCells;

    setTimeout(() => {
        let totalMass = cells.reduce((a, b) => a + b.r, 0);
        cells = [{
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: totalMass
        }];
    }, 7000);
}

function update(){
    cells.forEach(c => {
        let dx = mouse.x - c.x;
        let dy = mouse.y - c.y;
        c.x += dx * 0.03;
        c.y += dy * 0.03;

        if(c.vx){ 
            c.x += c.vx; 
            c.y += c.vy; 
            c.vx *= 0.9; 
            c.vy *= 0.9; 
        }

        foods.forEach((f, i) => {
            if(Math.hypot(c.x - f.x, c.y - f.y) < c.r){
                c.r += 0.3;
                score += 1;
                foods[i] = createFood();
            }
        });

        if(serverMode === "FFA"){
            viruses.forEach(v => {
                if(Math.hypot(c.x - v.x, c.y - v.y) < c.r + v.r - 10){
                    explode(c);
                }
            });
        }
    });
}

function drawCircle(x, y, r, color){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    foods.forEach(f => drawCircle(f.x, f.y, f.r, f.color));
    if(serverMode === "FFA"){
        viruses.forEach(v => drawCircle(v.x, v.y, v.r, v.color));
    }
    cells.forEach(c => drawCircle(c.x, c.y, c.r, "#00ffcc"));

    // عرض النقاط
    ctx.fillStyle = "#00ffcc";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText("النقاط: " + score, canvas.width - 20, 30);
}

function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
