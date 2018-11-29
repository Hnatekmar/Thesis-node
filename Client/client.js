const NEAT = require('neataptic');
const fs = require('fs');
const Queue = require('bull');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
    host: '192.168.1.26',
    dialect: 'postgres'
});

const Generation = sequelize.define('Generation', {
    min: Sequelize.FLOAT,
    max: Sequelize.FLOAT,
    best: Sequelize.JSON
});

Generation.sync({force: true});


let neat = new NEAT.Neat(
    6,
    8,
    null,
    {
        popsize: process.env.POPSIZE || 16,
        mutation: NEAT.methods.mutation.ALL,
        mutationRate: process.env.MUTATION_RATE || 0.25,
        elitism: process.env.ELITISM,
        equal: process.env.EQUAL === 'Yes',
        selection: NEAT.methods.selection[process.env.SELECTION || 'TOURNAMENT'],
        clear: true
    }
);

let bestScore = -Infinity;

async function evolve () {
    neat.sort();
    // From https://wagenaartje.github.io/neataptic/docs/neat/
    let newPopulation = [];

    if(neat.getFittest().score > bestScore) {
        bestScore = neat.getFittest().score
        console.log(bestScore);
    }

    Generation.create({
        min: neat.population[neat.population.length - 1].score,
        max: neat.getFittest().score,
        best: neat.getFittest().toJSON()
    });

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
            "genome": json,
            "startingPiece": process.env.STARTING_PIECE
        });
    });
}

queue.on('failed', function(job, err){
    // Job failed with reason err!
    console.error("Job failed: id: " + job.jobId + " with error: " + err);
    queue.retryJob(job);
});

queue.on('global:completed', function(job, result) {
    completed_count += 1;
    result = JSON.parse(result);
    neat.population[result.index].score = result.score;
    if(completed_count === neat.population.length && neat.generation < process.env.NUMBER_OF_GENERATIONS) {
        console.log('Done ' + (Date.now() - now) / 1000);
        completed_count = 0;
        queue.clean(100, 'completed');
        evolve().then(next);
    }
});
next();
