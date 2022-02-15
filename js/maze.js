function get_neighbors(maze, x, y) {
  let neighbor_indices = [];
  if (!maze[y][x].left && x > 0) {
    neighbor_indices.push([x-1,y]);
  }
  if (!maze[y][x].right && x < maze[0].length-1) {
    neighbor_indices.push([x+1,y]);
  }
  if (!maze[y][x].top && y > 0) {
    neighbor_indices.push([x,y-1]);
  }
  if (!maze[y][x].bottom && y < maze.length-1) {
    neighbor_indices.push([x,y+1]);
  }
  return neighbor_indices;
}

function new_cell() {
  return {
    left: false,
    right: false, 
    top: false, 
    bottom: false
  }
}

function generate_maze(n) {
  let grid = new Array(n).fill().map((x) => (new Array(n).fill().map(new_cell)));

  let point_sets = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      point_sets.push(new JSONSet([j,i]))
    }
  }

  let edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== n-1) {
        edges.push([[i,j],[i+1,j]])
      }
      if (j !== n-1) {
        edges.push([[i,j],[i,j+1]])
      }
    }
  }
  shuffle_array(edges);

  let maze_edges = edges.map((x) => x);

  while (edges.length) {
    let edge = edges.pop();

    let set_inds = edge.map((i) => point_sets.findIndex((x) => x.apply_set_function('has', i)));
    if (set_inds[0] == -1 || set_inds[1] == -1) {
      throw new Error("Could not find correct index");
    }
    if (set_inds[0] == set_inds[1]) {
      continue;
    }

    // Perform the union of the sets
    for (let i of point_sets[set_inds[1]].items) {
      point_sets[set_inds[0]].items.add(i);
    }

    point_sets.splice(set_inds[1], 1);
    maze_edges = maze_edges.filter((x) => x !== edge);
  }
  maze_edges.forEach((edge) => {
    let direction = sub(edge[0], edge[1]);
    if (direction[0] == -1) {
      grid[edge[0][1]][edge[0][0]].right = grid[edge[1][1]][edge[1][0]].left = true;
    }
    else if (direction[1] == -1) {
      grid[edge[0][1]][edge[0][0]].bottom = grid[edge[1][1]][edge[1][0]].top = true;
    }
  })
  return grid;
}

function solve_maze(maze, x, y, end_x, end_y) {
  let path = new JSONHash();
  let visited = new JSONSet();
  let queue = [[x,y]];
  while (queue.length) {
    let cell = queue.shift();
    visited.apply_set_function('add', cell);
    if (cell[0] == end_x && cell[1] == end_y) {
      let sol_path = [[end_x, end_y]];
      while (sol_path[0][0] != x || sol_path[0][1] != y) {
        sol_path.unshift(path.get_value(sol_path[0]));
      }
      return sol_path;
    }
    for (let i of get_neighbors(maze, cell[0], cell[1])) {
      if (!visited.apply_set_function('has', i)) {
        queue.push(i);
        path.set_value(i, cell);
      }
    }
  }
}
