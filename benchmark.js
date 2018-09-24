const suite = new require('benchmark').Benchmark.Suite()
const Simulation = require('./simulation/main.js').default
const NEAT = require('neataptic')

const neat = new NEAT.Neat(
    37,
    6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
    null,
    {
        popsize: 256,
        mutation: NEAT.methods.mutation.ALL,
        mutationRate: 0.25,
        network: new NEAT.architect.Random(
            37,
            128,
            6
        )
    }
)


let sim = new Simulation(60)
suite.add('SimulationStep', function () {	
	for (let i in neat.population) {
		sim.evalGenome(1000 / 30.0, neat.population[i])
	}
}).on('complete', function() {
	console.log(this[0].toString())
}).run({ 'async': true })
