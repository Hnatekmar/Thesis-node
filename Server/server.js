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

    const simulation = new Simulation(60);
    function evalGenome (data) {
        genome = NEAT.Network.fromJSON(data.genome);
        console.log(data.startingPiece)
        return simulation.evalGenome(1.0 / 30.0, data.startingPiece);
    }
    queue.process(function (job, jobDone) {
        let score = evalGenome(job.data);
        jobDone(null, {
            index: job.data.index,
            score: score
        });
    });
} else {
    const os = require('os');
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
}
