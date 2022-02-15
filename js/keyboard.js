// Shameless stolen code from "Process the Input" presentation
let input = (function() {
  function Keyboard() {
    let that = {
      keys : {}
    };
    function keyPress(e) {
      that.keys[e.key] = e.timeStamp;
    }
    function keyRelease(e) {
      delete that.keys[e.key];
    }
    window.addEventListener('keydown', keyPress);
    window.addEventListener('keyup', keyRelease);
    
    return that;
  }
  
  return {
    Keyboard : Keyboard
  };
}());