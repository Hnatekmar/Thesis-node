const request = require('request-promise-any');
const ip = require('ip');
const url = require('url');

async function getBestWeight(servers, names, my_ip) {
    let best_score = -Infinity;
    for(let i = 0; i < names.length; i++) {
        let server_url = url.parse(servers[names[i]].url);
        console.log(server_url);
        if (my_ip !== server_url.hostname) {
            let weight = await request.get('http://' + server_url.hostname + ':3000/weight');
            if (weight > best_score) {
                best_score = weight;
            }
            servers[names[i]].weight = weight;
        }
    }
    return best_score;
}

function benchmark() {
    const Simulation = require('simulation').default;
    const NEAT = require('neataptic');
    const fs = require('fs');

    const neat = new NEAT.Neat(
        37,
        6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
        null,
        {
            popsize: 8,
            mutation: NEAT.methods.mutation.ALL,
            mutationRate: 0.25,
            network: new NEAT.architect.Random(
                37,
                128,
                6
            )
        }
    );

    const jsonData = fs.readFileSync('population.json');
    neat.import(JSON.parse(jsonData));

    let sim = new Simulation(60);
    const now = Date.now();
    for (let i in neat.population) {
        sim.evalGenome(1 / 60.0, neat.population[i])
    }
    return Date.now() - now;
}

module.exports = {
    getWeight: async function () {
        console.log(process.env.HOST + ':8080/api/providers');
        let result = await request.get(process.env.HOST + ':8080/api/providers');
        const servers = JSON.parse(result).docker.backends["backend-Server-server"].servers;
        const names = Object.keys(servers);
        const my_ip = ip.address();
        // Get best score
        let best_weight = await getBestWeight(servers, names, my_ip);
        const my_weight = benchmark();
        console.log(my_weight);
        best_weight = max(best_weight, my_weight);
        for(let i = 0; i < names.length; i++) {
            let server_url = url.parse(servers[names[i]].url);
            if (my_ip !== server_url.hostname) {
                servers[names[i]].weight = max(best_weight - my_weight, 1);
            } else {
                servers[names[i]].weight = max(best_weight - servers[names[i]].weight, 1);
            }
            request.put(process.env.HOST + ':8080/api/providers/' + names[i], servers[names[i]], {
                'content-type': 'application/json',
                body: servers[names[i]]
            });
        }
        resolve(my_weight);
    }
};