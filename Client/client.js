const NEAT = require('neataptic');
const Request = require('request-promise');
const _ = require('lodash');
const pAll = require('p-all');

let neat = new NEAT.Neat(
    37,
    6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
    null,
    {
        popsize: process.env.POPSIZE || 16,
        mutation: NEAT.methods.mutation.ALL,
        mutationRate: process.env.MUTATION_RATE || 0.25
    }
);

async function evolve () {
    neat.sort();
    // From https://wagenaartje.github.io/neataptic/docs/neat/
    let newPopulation = [];

    console.log(neat.population[0].score);
    // Elitism
    for (let i = 0; i < neat.elitism; i++) {
        newPopulation.push(neat.population[i]);
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

const url = process.env.SERVER + ":" + process.env.PORT;
console.log(url);
async function assignFitness(genomes, callback) {
    const jsons = genomes.map((genome) => genome.toJSON());
    return Request.post({
        url: url + '/evaluate',
        json: jsons
    }, (error, response, body) => {
        if (error) {
            console.error(error);
            return 0;
        }
        for (let i = 0; i < body.length; i++) {
            genomes[i].score = body[i];
        }
    });
}

const CHUNK_SIZE = process.env.CHUNK_SIZE || 64;
const MAXIMUM_CONCURENT_REQUESTS = parseInt(process.env.MAXIMUM_CONCURENT_REQUESTS) || 18;
console.log('Using chunk size ' + CHUNK_SIZE);

async function next() {
    console.log('Generation ' + neat.generation);
    let now = Date.now(); 
    let chunks = _.chunk(neat.population, CHUNK_SIZE);
    let promises = chunks.map(function (chunk) {
		return () => assignFitness(chunk);
    });
    pAll(promises, {concurrency: MAXIMUM_CONCURENT_REQUESTS}).then(() => {
	console.log('Done ' + (Date.now() - now) / 1000);
	evolve().then(next);
    })
}
next();
