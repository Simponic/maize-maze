let canvas,context;

const HEIGHT = 1000;
const WIDTH = 1000;

// Next assignment: don't use so much effing global data
let n = 10;
let maze;

let total_time;

let player_pos = [];
let goal_pos = [];

let myInput = input.Keyboard();

let show_player_path = false;
let player_path = [];
let show_next_move = false;
let show_shortest_path = false;
let shortest_path = [];

let do_score_update = false;
let scores = [];
let initial_shortest_path_length = 0;
let current_score;

let do_time_update = false;
let dom_time;
let elapsed_time;
let last_time; 

function render_maze(maze, n, dx, dy) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      context.beginPath();
      if (maze[i][j].left) {
        context.moveTo(j * dx, i * dy);
        context.lineTo(j * dx, (i + 1) * dy);
      }
      if (maze[i][j].right) {
        context.moveTo((j + 1) * dx, i * dy);
        context.lineTo((j + 1) * dx, (i + 1) * dy);
      }
      if (maze[i][j].top) {
        context.moveTo(j * dx, i * dy);
        context.lineTo((j + 1) * dx, i * dy);
      }
      if (maze[i][j].bottom) {
        context.moveTo(j * dx, (i + 1) * dy);
        context.lineTo((j + 1) * dx, (i + 1) * dy);
      }
      context.stroke();
    }
  }
}

function render_player(x, y, dx, dy) {
  context.drawImage(PLAYER, x*dx, y*dy, dx, dy);
}

function render_scores(scores) {
  let html = scores.sort((a,b) => a-b).map((x,i) => `${i+1}: ${x}`).join('<br>');
  document.getElementById('scores').innerHTML = html;
}

function render_time(total_time) {
  document.getElementById('elapsed-time').innerHTML = total_time;
}

function render_goal(x, y, dx, dy) {
  context.drawImage(GOAL, x*dx, y*dy, dx, dy);
}

function render_background(n, dx, dy) {
  for (let x = 0; x < WIDTH; x += WIDTH/n) {
    for (let y = 0; y < HEIGHT; y += HEIGHT/n) {
      context.drawImage(BACKGROUND, x, y, dx, dy);
    }
  }
}

function render_circle(x,y,r,color) {
  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, r, 0, 2*Math.PI);
  context.fill();
  context.stroke();
}

function render_path(path, dx, dy, color) {
  path.map((coord) => {
    render_circle(coord[0]*dx + dx/2, coord[1]*dy + dy/2, Math.min(dx/4, dy/4), color);
  });
}

function render(elapsed) {
  const dx = WIDTH / n;
  const dy = HEIGHT / n;

  context.fillStyle = 'rgba(255,255,255,255)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.rect(0, 0, canvas.width, canvas.height);
  context.stroke();

  render_background(n, dx, dy);
  render_maze(maze, n, dx, dy)

  if (show_player_path) {
    render_path(player_path, dx, dy, 'rgba(255, 0, 0, 255)');
  }

  if (show_shortest_path) {
    render_path(shortest_path, dx, dy, 'rgba(255, 255, 0, 255)');
  }

  if (show_next_move && shortest_path.length>1) {
    render_path([shortest_path[1]], dx, dy, 'rgba(255, 255, 0, 255)');
  }

  if (do_score_update) {
    render_scores(scores);
  }
  if (do_time_update) {
    render_time(dom_time);
  }

  render_player(Math.floor(player_pos[0]), Math.floor(player_pos[1]), dx, dy)
  render_goal(goal_pos[0], goal_pos[1], dx, dy);
}

let key_actions_down = {};
let key_actions = {
  "move_up": ['ArrowUp', 'i', 'w'],
  "move_right": ['ArrowRight', 'l', 'd'],
  "move_down": ['ArrowDown', 'k', 's'],
  "move_left": ['ArrowLeft', 'j', 'a'],
  "breadcrumbs": ['b'],
  "shortest_path": ['p'],
  "hint": ['h']
}
function handle_input(input) {
  if (input) {
    if (any(key_actions['move_up'].map((x) => input.keys[x])) && !key_actions_down['move_up'] && player_pos[1] > 0) {
      key_actions_down['move_up'] = true;
      if (!maze[player_pos[1]][player_pos[0]].top) {
        player_pos[1] -= 1;
      }
    }
    if (any(key_actions['move_right'].map((x) => input.keys[x])) && !key_actions_down['move_right'] && player_pos[0] < n-1) {
      key_actions_down['move_right'] = true;
      if (!maze[player_pos[1]][player_pos[0]].right) {
        player_pos[0] += 1;
      }
    }
    if (any(key_actions['move_down'].map((x) => input.keys[x])) && !key_actions_down['move_down'] && player_pos[1] < n-1) {
      key_actions_down['move_down'] = true;
      if (!maze[player_pos[1]][player_pos[0]].bottom) {
        player_pos[1] += 1;
      }
    }
    if (any(key_actions['move_left'].map((x) => input.keys[x])) && !key_actions_down['move_left'] && player_pos[0] > 0) {
      key_actions_down['move_left'] = true;
      if (!maze[player_pos[1]][player_pos[0]].left) {
        player_pos[0] -= 1;
      }
    }
    if (input.keys['b'] && !key_actions_down['breadcrumbs']) {
      key_actions_down['breadcrumbs'] = true
      show_player_path = !show_player_path;
    }
    if (input.keys['p'] && !key_actions_down['shortest_path']) {
      key_actions_down['shortest_path'] = true
      show_shortest_path = !show_shortest_path;
    }
    if (input.keys['h'] && !key_actions_down['hint']) {
      key_actions_down['hint'] = true
      show_next_move = !show_next_move;
    }
    Object.keys(key_actions).map((x) => {
      if (key_actions_down[x] && !any(key_actions[x].map((y) => input.keys[y]))) {
        key_actions_down[x] = false;
      }
    })
  }
}

function update(elapsed) {
  total_time += elapsed;

  if (do_score_update) {
    do_score_update = false;
  }
  if (do_time_update) {
    do_time_update = false;
  }
  
  if (JSON.stringify(player_pos) !== JSON.stringify(player_path[player_path.length-1])) {
    player_path.push([player_pos[0], player_pos[1]]);
    shortest_path = solve_maze(maze, player_pos[0], player_pos[1], goal_pos[0], goal_pos[1]);
  }

  if (total_time / 1000 > dom_time) {
    dom_time = Math.floor(total_time/1000);
  }
  do_time_update = true;

  if (player_pos[0] == goal_pos[0] && player_pos[1] == goal_pos[1]) {
    current_score = player_path.length - initial_shortest_path_length;
    scores.push(current_score);
    initialize();
    do_score_update = true;
  }
}

function initialize(new_n) {
  if (new_n) {
    n = new_n;
  }
  maze = generate_maze(n);
  player_pos = [random_in_range(0, 2), random_in_range(0, 2)];
  goal_pos = [random_in_range(n-2, n), random_in_range(n-2, n)];
  player_path = [];
  shortest_path = solve_maze(maze, player_pos[0], player_pos[1], goal_pos[0], goal_pos[1]);
  initial_shortest_path_length = shortest_path.length;
  total_time = 0;
  current_score = 0;
  dom_time = 0;
  last_time = performance.now();
}

function game_loop(time_stamp) {
  elapsed_time = time_stamp - last_time;
  last_time = time_stamp;
  handle_input(myInput);
  update(elapsed_time);
  render(elapsed_time);

  // Wow! Tail call recursion! /sarcasm
  requestAnimationFrame(game_loop);
}

window.onload = function() {
  initialize();
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  game_loop(performance.now())
}
