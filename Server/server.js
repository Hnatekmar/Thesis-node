const cluster = require('cluster');

if (!cluster.isMaster) {
    let { JSDOM } = require('jsdom');
    const bodyParser = require('body-parser');
    const NEAT = require('neataptic');
    const compression = require('compression');
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
} else {
    const express = require('express');
    const cpuCount = require('os').cpus().length;

    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    const app = express();
    const port = 3000;
    app.listen(port);
    app.use(bodyParser.json({limit:'100mb'}));
    app.use(compression());
    app.post('/evaluate', function (req, res) {
	let id = Date.now();
	_.chunk(req.body, threads.length).map((chunk, index) => {
		threads[i].send({
					genomes: chunk,
					id: id,
					index: index
                                }, null, callback.bind({threadCount: threads.length}));
	});
	let results = [];
	for (let i = 0; i < threads.length; i++) {
		results[i] = null;
	}
	Process.on('message', (response) => {
		if(response.id === id) {
			results[index] = response;	
		}
		if(results.every((x) => x !== null)) {
			res.json(results.reduce((acc, value) => {
				return acc.concat(value);
			}, []));
			for (let i = 0; i < threads.length; i++) {
				results[i] = null;
			}
		}
	});
    })
}
