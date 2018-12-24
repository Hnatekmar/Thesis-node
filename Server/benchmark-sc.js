const MAX_POPSIZE = 1500;
const NUMBER_OF_TRIES = 10;

const cluster = require('cluster');
const NEAT = require('neataptic');
const Queue = require('bull');
const queue = new Queue('io', 'redis://192.168.1.26:32769');

if (cluster.isMaster) {
    let now = Date.now()
    let processes = [];
    for (let i = 0; i < 4; i++) {
        processes.push(cluster.fork());
    }
    function next(subset, callback) {
        let neat = new NEAT.Neat(
            6,
            6,
            null,
            {
                popsize: subset
            }
        );
        now = Date.now();
        neat.population.forEach(function (genome, index) {
            const json = genome.toJSON();
            processes[index % processes.length].send({
                "index": index,
                "genome": json,
                "startingPiece": 'I',
                "dt": 0.016,
                "sampleRate": 120
            });
        });
    }

    let counter = 100

    let completed_count = 0;
    let i = 0;
    let acc = 0;
    function afterEval(result) {
        acc += result;
        i += 1;
        if (i === NUMBER_OF_TRIES) {
            console.log(counter + ',' + acc / NUMBER_OF_TRIES);
            counter += 100;
            acc = 0;
            i = 0;
        }
        next(counter);
    }
    let j = 0;
    cluster.on('message', function (worker, message, handle) {
        j += 1;
        if (j === counter) {
            j = 0;
            afterEval((Date.now() - now) / 1000.0);
        }
    })
    next(counter)
} else {
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
        simulation.evaluate(genome, data.startingPiece)
        let acc = 0
        let positions = []
        while(simulation.isRunning()) {
            acc += data.dt
            if(acc >= data.sampleRate) {
                acc = 0
                positions.push(simulation.car.getComponent('physics').body.position)
            }
            simulation.update(data.dt);
        }
        return {
            score: simulation.fitness(),
            positions: positions
        }
    }
    process.on('message', (data) => {
       process.send(evalGenome(data))
    })
}
