const cluster = require('cluster');
if (!cluster.isMaster) {
	const express = require('express');
	let { JSDOM } = require('jsdom');
	const bodyParser = require('body-parser');
	const NEAT = require('neataptic');
	let jsdom = new JSDOM('<!doctype html><html><body></body></html>');
	let { window } = jsdom;
    global.window = window
    global.document = window.document
    global.navigator = {
        userAgent: 'node.js',
    };
    const app = express();
    const port = 3000;
    app.listen(port);
    app.use(bodyParser.json({limit:'100mb'}));

    const Simulation = require('simulation').default;

    function evalGenome (genome) {
        genome = NEAT.Network.fromJSON(genome);
        const simulation = new Simulation(60);
        return simulation.evalGenome(1.0 / 60.0, genome);
    }

    app.post('/evaluate', function (req, res) {
        res.json(req.body.map(evalGenome));
    })
} else {
    const cpuCount = require('os').cpus().length;
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
}
