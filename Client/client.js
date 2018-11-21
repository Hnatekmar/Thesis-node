const NEAT = require('neataptic');
const Request = require('request-promise');
const _ = require('lodash');
const pAll = require('p-all');
const fs = require('fs');
const Queue = require('bull');

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

let bestScore = -Infinity;

async function evolve () {
    neat.sort();
    // From https://wagenaartje.github.io/neataptic/docs/neat/
    let newPopulation = [];

    if(neat.population[0].score > bestScore) {
        fs.writeFileSync('/data/best.json', JSON.stringify(neat.population[0].toJSON()));
        bestScore = neat.population[0].score
        console.log(bestScore);
    }
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

const queue = new Queue('io', 'redis://' + process.env.SERVER + ':' + process.env.PORT);
queue.clean(100, 'completed');
const CHUNK_SIZE = process.env.CHUNK_SIZE || 1;
console.log('Using chunk size ' + CHUNK_SIZE);

let completed_count = 0;
let now = 0;
async function next() {
    now = Date.now();
    console.log('Generation ' + neat.generation);
    neat.population.forEach(function (genome, index) {
        const json = genome.toJSON();
        queue.add({
            "index": index,
            "genome": json
        });
    });
}

queue.on('global:failed', function(job, err){
    // Job failed with reason err!
    console.error("Job failed: id: " + job.jobId + " with error:" + err);
    queue.retryJob(job);
});

queue.on('global:completed', function(job, result) {
    completed_count += 1;
    result = JSON.parse(result);
    neat.population[result.index].score = result.score;
    if(completed_count === neat.population.length) {
        console.log('Done ' + (Date.now() - now) / 1000);
        completed_count = 0;
        queue.clean(100, 'completed');
        evolve().then(next);
    }
});
next();
