const NEAT = require('neataptic');
const fs = require('fs');
const Queue = require('bull');
const Sequelize = require('sequelize');
const ip = require('ip');

console.log(ip.address())

const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
    host: 'postgresql',
    dialect: 'postgres',
    operatorsAliases: false
});

const Generation = sequelize.define('Generation', {
    minimum: Sequelize.FLOAT,
    maximum: Sequelize.FLOAT,
    best: Sequelize.JSON
});

const Configuration = sequelize.define('Configuration',  {
    config: Sequelize.JSON
});

let configs = JSON.parse(fs.readFileSync('/src/batch.json'));

Generation.belongsTo(Configuration, {
  foreignKey: {
    allowNull: true
  }
})

sequelize.sync({force: true}).then(() => {

  let promises = []
  for(let i = 0; i < configs.length; i++) {
    let promise = Configuration.create({
      config: configs[i]
    }).then(function (response) {
      configs[i].config = response;
      configs[i].neat = new NEAT.Neat(
        configs[i].INPUTS,
        configs[i].OUTPUTS,
        null,
        {
          popsize: configs[i].POPSIZE || 16,
          mutation: NEAT.methods.mutation.ALL,
          mutationRate: configs[i].MUTATION_RATE || 0.25,
          elitism: configs[i].ELITISM,
          equal: configs[i].EQUAL === 'Yes',
          selection: NEAT.methods.selection[configs[i].SELECTION || 'TOURNAMENT'],
          clear: true
        }
      );
    })
    promises.push(promise)
  }

  Promise.all(promises).then(next)

  async function evolve () {
    configs.forEach(({neat, config}) => {
      neat.sort();
      // From https://wagenaartje.github.io/neataptic/docs/neat/
      let newPopulation = [];

      let json = neat.getFittest().toJSON()
      json.positions = neat.getFittest().positions
      json.piece = neat.getFittest().piece
      Generation.create({
        minimum: neat.population[neat.population.length - 1].score,
        maximum: neat.getFittest().score,
        best: json
      }).then((response) => {
        response.setConfiguration(config)
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
      });
    })
  }
  let to_complete = 0;

  const queue = new Queue('io', 'redis://redis:6379');
  queue.clean(100, 'active');
  queue.clean(100, 'wait');
  queue.clean(100, 'completed');

  async function next() {
    configs.forEach((config, configID) => {
      // Ignore populations that are not yet evaluated
      config.neat.population.forEach(function (genome, index) {
        to_complete += 1;
        const json = genome.toJSON();
        queue.add({
          "index": index,
          "genome": json,
          "configID": configID,
          "startingPiece": config.STARTING_PIECE,
          "dt": parseFloat(process.env.FPS),
          "sampleRate": parseFloat(process.env.SAMPLE_RATE)
        });
      });
    });
  }



  queue.on('failed', function(job, err){
    // Job failed with reason err!
    console.error("Job failed: id: " + job.jobId + " with error: " + err);
    queue.retryJob(job);
  });


  queue.on('global:completed', function(job, response) {
    response = JSON.parse(response);
    let population = configs[response.configID].neat.population
    to_complete -= 1
    if(response.result.score === undefined) {
      console.log(response)
    }
    population[response.index].score = response.result.score;
    population[response.index].positions = response.result.positions;
    population[response.index].piece = process.env.STARTING_PIECE;
    if(to_complete === 0) {
      queue.clean(100, 'completed');
      evolve().then(next);
    }
  });

})
