const MAX_POPSIZE = 20000;
const NUMBER_OF_TRIES = 10;

const NEAT = require('neataptic');
const Queue = require('bull');
const queue = new Queue('io', 'redis://192.168.1.26:32769');

let now = Date.now()

function next(subset) {
    let neat = new NEAT.Neat(
        6,
        6,
        null,
        {
            popsize: subset
        }
    );
    now = Date.now();
    neat.population.forEach(function (genome, index) {
        const json = genome.toJSON();
        queue.add({
            "index": index,
            "genome": json,
            "startingPiece": 'I',
            "dt": 0.016,
            "sampleRate": 120
        });
    });
}

let counter = 2200


queue.clean(100, 'active');
queue.clean(100, 'wait');
queue.clean(100, 'completed');

next(counter)

let completed_count = 0;
let remaining_tries = NUMBER_OF_TRIES;
let acc = 0;
queue.on('global:completed', function(job, response) {
    completed_count += 1;
    if(completed_count === counter) {
        let time = (Date.now() - now) / 1000
        completed_count = 0;
        queue.clean(100, 'completed');
        if (counter <= MAX_POPSIZE && remaining_tries === 0) {
            console.log(counter + ',' + acc / NUMBER_OF_TRIES);
            counter += 100
            remaining_tries = NUMBER_OF_TRIES;
            acc = 0;
        } else {
            remaining_tries -= 1;
            acc += time
        }
        next(counter)
    }
});
