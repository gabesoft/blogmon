var DELAY = 'delay',
    REPEAT = 'repeat';

var clear = function(task) {
  var id = task.id,
      type = task.type;
  if (id !== null) {
    if (type === DELAY) {
      clearTimeout(id);
    } else { 
      clearInterval(id);
    }
  }
};

function Task(fn, scope) {
  if (!(this instanceof Task)) { return new Task(fn, scope); }

  var args  = Array.prototype.slice.call(arguments, 2);
  this.id   = null;
  this.type = DELAY;
  this.fn   = function() { fn.apply(scope, args || []); };
}

module.exports = Task;

/* 
 * Schedules a one-time execution of a callback after interval seconds.
 */
Task.prototype.delay = function(interval) {
  this.cancel();
  this.type = DELAY;
  this.id   = setTimeout(this.fn, interval * 1000);
};

/*
 * Schedules the repeated execution of callback every interval seconds.
 */
Task.prototype.repeat = function(interval) {
  this.cancel();
  this.type = REPEAT;
  this.id   = setInterval(this.fn, interval * 1000);
};

/*
 * Cancels the last queued task.
 */
Task.prototype.cancel = function() {
  clear(this);
};
