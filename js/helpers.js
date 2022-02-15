function random_in_range(a,z) {
  return Math.floor(Math.random() * (z - a) + a);
}

function shuffle_array(a) {
  for (let i = 0; i < a.length; i++) {
    let j = random_in_range(0, i+1);
    temp = a[i]; a[i] = a[j]; a[j] = temp;
  }
}

function sub(p1, p2) {
  return [p1[0] - p2[0], p1[1] - p2[1]];
}

function any(l) {
  return l.filter((x) => x).length > 0;
}