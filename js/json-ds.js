// If I were to rewrite this, I would use IEFE's - Dean was right about OO in JS
class JSONSet {
  items = new Set();
  constructor(initial){
    if (initial) {
      this.apply_set_function('add', initial);
    }
  }
  apply_set_function(f_name, x) {
    return this.items[f_name](JSON.stringify(x));
  }
}

class JSONHash {
  items = {};
  constructor(initial_key, initial_value){
    if (initial_key && initial_value) {
      this.items[JSON.stringify(initial)] = initial_value;
    }
  }
  set_value(key, value) {
    this.items[JSON.stringify(key)] = value;
  }
  get_value(key) {
    return this.items[JSON.stringify(key)];
  }
  delete_value(key) {
    delete this.items[JSON.stringify(key)];
  }
}