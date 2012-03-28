var Task = require('../lib/task.js');

describe('SLOW - task', function() {
    it('should run a task delayed', function(done) {
        var task = new Task(done);
        task.delay(1);
    });

    it('should run a task at interval', function(done) {
        var count = 0;
        var task = new Task(function(x, y, z) {
            count = count + 1;
            console.log(x, y, z);
            if (count > 2) {
                task.cancel();
                done();
            }
        }, null, 2, 3, ['a','b','c']);
        task.repeat(1);
    });
});
