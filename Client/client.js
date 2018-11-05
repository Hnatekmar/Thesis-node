const NEAT = require('neataptic');
const Request = require('request-promise');
const Sequelize = require('sequelize');

const options = {
    dialect: 'postgres',
    host: 'localhost'
};

// const sequelize = new Sequelize(
//     'postgres',
//     'postgres',
//     '', options);
//
// const GenerationInfo = require('./GenerationInfo')(sequelize, Sequelize);
// GenerationInfo.sync({force: true});
//
// const Genome = require('./Genome')(sequelize, Sequelize);
// GenerationInfo.belongsTo(Genome, {foreignKey: 'fk_genome_id'});
// Genome.sync({force: true});

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

function evolve () {
    neat.sort();
    // GenerationInfo.create({
    //     fk_genome_id: neat.population[0].real_id,
    //     type: 'MAX',
    //     json: neat.population[0].toJSON()
    // })
    // GenerationInfo.create({
    //     fk_genome_id: neat.population[neat.population.length - 1].real_id,
    //     type: 'MIN',
    //     json: neat.population[neat.population.length - 1].toJSON()
    // })
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
async function assignFitness(genome) {
    return Request.post({
        url: url + '/evaluate',
        json: genome.toJSON()
    }, (error, response, body) => {
        if (error) {
            console.error(error);
            return 0;
        }
        genome.score = body.score;
    });
}

function next() {
    console.log('Generation ' + neat.generation);
    let populations = neat.population.map(assignFitness);
    Promise.all(populations).then(() => {
        evolve();
        next();
    });
}

next();
