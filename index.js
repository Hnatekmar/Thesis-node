const ASYNC = require('async')
const NEAT = require('neataptic')
const _ = require('lodash')
const fs = require('fs')
const cluster = require('cluster')
const os = require('os')

const NUMBER_OF_THREADS = os.cpus().length

let neat = new NEAT.Neat(
    37,
    6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
    null,
    {
        popsize: NUMBER_OF_THREADS * 256,
        mutation: NEAT.methods.mutation.ALL,
        mutationRate: 0.25,
        network: new NEAT.architect.Random(
            37,
            256,
            6
        )
    }
)


let bestScore = Number.MIN_VALUE
function evolve () {
    neat.sort()
    console.log('Generation ' + neat.generation)

    // From https://wagenaartje.github.io/neataptic/docs/neat/
    let newPopulation = []

    // Elitism
    for (let i = 0; i < neat.elitism; i++) {
        newPopulation.push(neat.population[i])
    }

    // Breed the next individuals
    for (let i = 0; i < neat.popsize - neat.elitism; i++) {
        newPopulation.push(neat.getOffspring())
    }
    let score = neat.getFittest().score
    console.log(score)
    if (score > bestScore) {
        bestScore = score
        console.log('Saving best specimen')
        let jsonBest = JSON.stringify(neat.getFittest().toJSON())
        fs.writeFileSync("best.json", jsonBest)
    }
    delete neat.population
    // Replace the old population with the new population
    neat.population = newPopulation
    neat.mutate()

    neat.generation++
}

if (cluster.isMaster) {
    let children = []
    let count = 0
    for (let i = 0; i < NUMBER_OF_THREADS; i++) {
        children.push(cluster.fork())
    }
    for (let i = 0; i < NUMBER_OF_THREADS; i++) {
        children[i].on('message', (msg) => {
            count += 1
            neat.population[msg['index']].score = msg['score']
        })
    }
    _.chunk(neat.population, neat.population.length / children.length).forEach((chunk, index) => {
        let jsonChunk = chunk.map((genome) => genome.toJSON())
        children[index].send({
            'json': jsonChunk,
            'index': Math.floor(index * (neat.population.length / children.length))
        })
    })
    setInterval(function () {
        if (count === neat.population.length) {
            evolve()
            count = 0
            _.chunk(neat.population, neat.population.length / children.length).forEach((chunk, index) => {
                let jsonChunk = chunk.map((genome) => genome.toJSON())
                children[index].send({
                    'json': jsonChunk,
                    'index': Math.floor(index * (neat.population.length / children.length))
                })
            })
        }
    }, 100)
} else {
    let Simulation = require('./simulation/main.js').default
    let simulation = new Simulation(60)
    process.on('message', (info) => {
        for (let i = 0; i < info['json'].length; i++) {
            let genom = NEAT.Network.fromJSON(info['json'][i])
            let score = simulation.evalGenome(1 / 30.0, genom)
            process.send({
                'score': score,
                'index': info['index'] + i
            })
        }
    })
}
