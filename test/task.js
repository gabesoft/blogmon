var Task = require('../lib/task.js');

describe('task.delay()', function() {
    it('should run a task delayed', function(done) {
        var task = new Task();
        task.delay(1, done);
    });

    it('should run a task at interval', function(done) {
        var task  = new Task(),
            count = 0;
        task.repeat(1, function() {
            count = count + 1;
            if (count > 2) {
              task.cancel();
              done();
            }
        });
    });
});
