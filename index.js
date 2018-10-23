const NEAT = require('neataptic');
const _ = require('lodash');
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
	const Sequelize = require('sequelize')
	const options = {
			dialect: 'postgres',
			host: '192.168.1.52'
		};
	const sequelize = new Sequelize(
		'postgres', 
		'postgres', 
		'example', options);


	const Genome = require('./Genome')(sequelize, Sequelize);
	Genome.sync({force: true});
    const GenerationInfo = require('./GenerationInfo')(sequelize, Sequelize);
    GenerationInfo.sync({force: true});
    GenerationInfo.belongsTo(Genome, {foreignKey: 'fk_genome_id'});

	const NUMBER_OF_THREADS = os.cpus().length;

	let neat = new NEAT.Neat(
		37,
		6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
		null,
		{
			popsize: NUMBER_OF_THREADS * 128,
			mutation: NEAT.methods.mutation.ALL,
			mutationRate: 0.15
		}
	);
	let bestScore = Number.MIN_VALUE;
	function evolve () {
		neat.sort();
		console.log('Generation ' + neat.generation);
		GenerationInfo.create({
			fk_genome_id: neat.population[0].real_id,
			type: 'MAX',
			json: neat.population[0].toJSON()
        })
        GenerationInfo.create({
            fk_genome_id: neat.population[neat.population.length - 1].real_id,
            type: 'MIN',
            json: neat.population[neat.population.length - 1].toJSON()
        })
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
			neat.population[msg['index']].score = msg['score']
			neat.population[msg['index']].real_id = msg['index'] + neat.generation * neat.population.length
			Genome.create({
				fitness: msg['score'],
				generation: neat.generation
			});
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
	}, 100)
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
				score: score,
				index: info['index'] + i
			})
		}
	})
}
