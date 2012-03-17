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

var call = function(fn, scope, args) {
  return function () { fn.apply(scope, args || []); };
};

function Task() {
  if (!(this instanceof Task)) { return new Task(); }
  this.id   = null;
  this.type = DELAY;
}

module.exports = Task;

/* 
 * Schedules a one-time execution of a callback after interval seconds.
 */
Task.prototype.delay = function(interval, fn, scope, args) {
  this.cancel();
  this.type = DELAY;
  this.id   = setTimeout(call(fn, scope, args), interval * 1000);
};

/*
 * Schedules the repeated execution of callback every interval seconds.
 */
Task.prototype.repeat = function(interval, fn, scope, args) {
  this.cancel();
  this.type = REPEAT;
  this.id   = setInterval(call(fn, scope, args), interval * 1000);
};

/*
 * Cancels the last queued task.
 */
Task.prototype.cancel = function() {
  clear(this);
};
