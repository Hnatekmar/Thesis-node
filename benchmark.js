const benchmark = new require('nodemark')
const Simulation = require('./simulation/main.js').default
const NEAT = require('neataptic')

const neat = new NEAT.Neat(
    37,
    6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
    null,
    {
        popsize: 4,
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
function generation() {
	for (let i in neat.population) {
		sim.evalGenome(1 / 30.0, neat.population[i])
	}
}

let result = benchmark(generation)
console.log(result)
console.log(result.milliseconds() + ' ms')
