const cluster = require('cluster');

const Queue = require('bull');
const queue = new Queue('io', 'redis://' + process.env.HOST + ':6379');

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
    function evalGenome (genome) {
        genome = NEAT.Network.fromJSON(genome);
        return simulation.evalGenome(1.0 / 30.0, genome);
    }
    queue.process(function (job, jobDone) {
        let scores = job.data.genomes.map((value, index) => {
            job.progress(Math.round(job.data.genomes.length / index));
            return evalGenome(value)
        });
        jobDone(scores);
    });
} else {
    const os = require('os');
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
}
