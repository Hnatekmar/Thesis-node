const cluster = require('cluster');

const Queue = require('bull');
const queue = new Queue('io', 'redis://' + process.env.HOST + ':' + process.env.PORT);

if (!cluster.isMaster) {
    let { JSDOM } = require('jsdom');
    const NEAT = require('neataptic');
    let jsdom = new JSDOM('<!doctype html><html><body></body></html>');
    let { window } = jsdom;
    global.window = window
    global.document = window.document

    global.navigator = {
        userAgent: 'node.js',
    };

    const Simulation = require('simulation').default;

    const simulation = new Simulation(process.env.TIME || 160);
    function evalGenome (data) {
        genome = NEAT.Network.fromJSON(data.genome);
        simulation.frames = data.TIME
        simulation.evaluate(genome, data.startingPiece, data.options)
        let acc = 0
        let positions = []
        while(simulation.isRunning()) {
            let result = simulation.car.getComponent('physics').body.position.slice(0)
            result = [result[0], result[1]]
            result.push(simulation.car.getComponent('physics').body.angle)
            positions.push({
                spaceInfo: result,
                fitness: simulation.fitness(),
                piece: simulation.currentPart()
            })
            simulation.update(data.dt);
        }
        return {
            score: simulation.fitness(),
            positions: positions
        }
    }
    queue.process(function (job, jobDone) {
        let score = evalGenome(job.data);
        jobDone(null, {
            index: job.data.index,
            result: score,
            configID: job.data.configID
        });
    });
    queue.on('failed', function(job, err){
        // Job failed with reason err!
        console.error("Job failed: id: " + job.jobId + " with error: " + err);
        queue.retryJob(job);
    });
} else {
    const os = require('os');
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
}
