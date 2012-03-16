module.exports = Task;

var DELAY = 'delay',
    REPEAT = 'repeat';

var clear = function(id, type) {
  if (id !== null) {
    if (type === DELAY) {
      clearTimeout(id);
    } else { 
      clearInterval(id);
    }
  }
};

function Task() {
  if (!(this instanceof Task)) { return new Task(); }
  this.id   = null;
  this.type = DELAY;
};

/* 
 * Schedule execution of a one-time callback after interval seconds.
 */
Task.prototype.delay = function(interval, callback) {
  clear(this.id, this.type);
  this.type = DELAY;
  this.id = setTimeout(callback, interval * 1000);
};

/*
 * Schedule the repeated execution of callback every interval seconds.
 */
Task.prototype.repeat = function(callback) {
  this.type = REPEAT;
  this.id = setInterval(callback, interval * 1000);
};

/*
 * Stop any delayed or repeated execution in progress.
 */
Task.prototype.stop = function() {
  clear(this.id, this.type);
};
