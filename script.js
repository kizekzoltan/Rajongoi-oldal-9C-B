const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.height = 600;
canvas.style.width = "600px";
canvas.style.height = "600px";
canvas.style.border = "1px solid #000";

const cell_size = 30;
const world_width = Math.floor(canvas.width / cell_size);
const world_height = Math.floor(canvas.height / cell_size);
const move_interval = 300;
const food_spawn_interval = 3000;

let input;
let snake;
let foods;
let foodSpawnElapsed;
let gameOver;
let score;

function reset() {
  input = {};
  snake = {
    moveElapsed: 0,
    length: 4,
    parts: [
      {
        x: 0,
        y: 0,
      },
    ],
    dir: null,
    newDir: {
      x: 1,
      y: 0,
    },
  };
  foods = [
    {
      x: 10,
      y: 0,
    },
  ];
  foodSpawnElapsed = 0;
  gameOver = false;
  score = 0;
}

function update(delta) {
  if (gameOver) {
    if (input[" "]) {
      reset();
    }

    return;
  }

  if (input.ArrowDown && snake.dir.y !== -1) {
    snake.newDir = { x: 0, y: 1 };
  } else if (input.ArrowRight && snake.dir.x !== -1) {
    snake.newDir = { x: 1, y: 0 };
  } else if (input.ArrowUp && snake.dir.y !== 1) {
    snake.newDir = { x: 0, y: -1 };
  } else if (input.ArrowLeft && snake.dir.x !== 1) {
    snake.newDir = { x: -1, y: 0 };
  }

  snake.moveElapsed += delta;
  if (snake.moveElapsed > move_interval) {
    snake.dir = snake.newDir;
    snake.moveElapsed -= move_interval;
    const newsnakepart = {
      x: snake.parts[0].x + snake.dir.x,
      y: snake.parts[0].y + snake.dir.y,
    };
    snake.parts.unshift(newsnakepart);

    if (snake.parts.length > snake.length) {
      snake.parts.pop();
    }

    const head = snake.parts[0];
    const foodEatenIndex = foods.findIndex(
      (f) => f.x === head.x && f.y === head.y
    );
    if (foodEatenIndex >= 0) {
      snake.length++;
      score++;
      foods.splice(foodEatenIndex, 1);
    }

    const worldEdgeIntersect =
      head.x < 0 ||
      head.x >= world_width ||
      head.y < 0 ||
      head.y >= world_height;
    if (worldEdgeIntersect) {
      gameOver = true;
      return;
    }
    const snakePartIntersect = snake.parts.some(
      (part, index) => index !== 0 && head.x === part.x && head.y === part.y
    );
    if (snakePartIntersect) {
      gameOver = true;
      return;
    }
  }

  foodSpawnElapsed += delta;
  if (foodSpawnElapsed > food_spawn_interval) {
    foodSpawnElapsed -= food_spawn_interval;
    foods.push({
      x: Math.floor(Math.random() * world_width),
      y: Math.floor(Math.random() * world_height),
    });
  }
}

function render() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  snake.parts.forEach(({ x, y }, index) => {
    if (index === 0) {
      ctx.fillStyle = "green";
    } else {
      ctx.fillStyle = "#00FF06";
    }
    ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
  });
  ctx.fillStyle = "red";
  foods.forEach(({ x, y }) => {
    ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
  });

  ctx.fillStyle = "green";
  ctx.font = "30px Arial";
  ctx.fillText("Score:" + score, canvas.width / 2, cell_size / 2);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = "blue";
    ctx.font = "30px Arial";
    ctx.fillText("Press SPACE to restart!", canvas.width / 2, canvas.height / 2 + 50);
  }
}

let lastLoopTime = Date.now();

function gameLoop() {
  const now = Date.now();
  const delta = now - lastLoopTime;
  lastLoopTime = now;
  update(delta);
  render();
  window.requestAnimationFrame(gameLoop);
}
reset();
gameLoop();

window.addEventListener("keydown", (event) => {
  input[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  input[event.key] = false;
});
