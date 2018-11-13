const cluster = require('cluster');

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
        return simulation.evalGenome(1.0 / 60.0, genome);
    }
    process.on('message', (data) => {
	data.genomes = data.genomes.map(evalGenome);
	process.send(data);
    });
} else {
    const express = require('express');
    const cpuCount = require('os').cpus().length;
    const bodyParser = require('body-parser');
    const compression = require('compression');
    const _ = require('lodash');

    let threads = [];
    for (let i = 0; i < cpuCount; i++) {
        threads.push(cluster.fork());
    }
    console.log(threads);

    const app = express();
    const port = 3000;
    app.listen(port);
    app.use(bodyParser.json({limit: '200mb'}));
    app.use(compression());
    let results = {};
    app.post('/evaluate', function (req, res) {
	let id = Date.now();
	results[id] = { scores: [], response: res };
	_.chunk(req.body, Math.floor(req.body.length / threads.length)).forEach((chunk, index) => {
		results[id].scores.push(null);
		threads[index].send({
					genomes: chunk,
					id: id,
					index: index
                                });
	});
    });
    cluster.on('message', (worker, response, handle) => {
	    results[response.id].scores[response.index] = response.genomes;
	    if (results[response.id].scores.every((x) => x !== null)) {
		    results[response.id].response.json(results[response.id].scores.reduce((acc, x) => acc.concat(x), []));
		    delete results[response.id];
	    }
    });
}
