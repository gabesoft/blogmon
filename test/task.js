var Task = require('../lib/task.js');

describe('task', function() {
    xit('should run a task delayed', function(done) {
        var task = new Task(done);
        task.delay(1);
    });

    xit('should run a task at interval', function(done) {
        var count = 0;
        var task = new Task(function() {
            count = count + 1;
            if (count > 2) {
                task.cancel();
                done();
            }
        });
        task.repeat(1);
    });
});
