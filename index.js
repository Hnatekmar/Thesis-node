const NEAT = require('neataptic');
const _ = require('lodash');
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const caminte = require('caminte'),
        Schema = caminte.Schema,
        config = {
            driver: 'sqlite3',
            database: 'database.sqlite3'
        };

    const schema = new Schema(config.driver, config);

    const Genome = require('./Genome')(schema);
    Genome.destroyAll();

    const NUMBER_OF_THREADS = os.cpus().length;

    let neat = new NEAT.Neat(
        37,
        6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
        null,
        {
            popsize: NUMBER_OF_THREADS * 128,
            mutation: NEAT.methods.mutation.ALL,
            mutationRate: 0.25
        }
    );

    let bestScore = Number.MIN_VALUE;
    function evolve () {
        neat.sort();
        console.log('Generation ' + neat.generation);

        // From https://wagenaartje.github.io/neataptic/docs/neat/
        let newPopulation = [];

        // Elitism
        for (let i = 0; i < neat.elitism; i++) {
            newPopulation.push(neat.population[i])
        }

        // Breed the next individuals
        for (let i = 0; i < neat.popsize - neat.elitism; i++) {
            newPopulation.push(neat.getOffspring())
        }

        // Replace the old population with the new population
        neat.population = newPopulation;
        neat.mutate();

        neat.generation++
    }

    let children = [];
    let count = 0;
    for (let i = 0; i < NUMBER_OF_THREADS; i++) {
        children.push(cluster.fork())
    }
    for (let i = 0; i < NUMBER_OF_THREADS; i++) {
        children[i].on('message', (msg) => {
            count += 1;
            let json = neat.population[msg['index']].toJSON();
            neat.population[msg['index']].score = msg['score']
            let genome = new Genome({
                fitness: msg['score'],
                genome: json,
                generation: neat.generation
            });
            genome.save()
        })
    }
    _.chunk(neat.population, neat.population.length / children.length).forEach((chunk, index) => {
        let jsonChunk = chunk.map((genome) => genome.toJSON());
        children[index].send({
            'json': jsonChunk,
            'index': Math.floor(index * (neat.population.length / children.length))
        })
    });
    setInterval(function () {
        if (count === neat.population.length) {
            evolve();
            count = 0;
            _.chunk(neat.population, neat.population.length / children.length).forEach((chunk, index) => {
                let jsonChunk = chunk.map((genome) => genome.toJSON());
                children[index].send({
                    'json': jsonChunk,
                    'index': Math.floor(index * (neat.population.length / children.length))
                })
            })
        }
    }, 50)
} else {
    let { JSDOM } = require('jsdom');
    let jsdom = new JSDOM('<!doctype html><html><body></body></html>');
    let { window } = jsdom;
    global.window = window
    global.document = window.document
    global.navigator = {
        userAgent: 'node.js',
    };

    const Simulation = require('simulation').default
    let simulation = new Simulation(60)
    process.on('message', (info) => {
        for (let i = 0; i < info['json'].length; i++) {
            let genom = NEAT.Network.fromJSON(info['json'][i]);
            let score = simulation.evalGenome(1 / 30.0, genom);
            process.send({
                'score': score,
                'index': info['index'] + i
            })
        }
    })
}
