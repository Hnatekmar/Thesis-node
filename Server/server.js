const express = require('express');
let { JSDOM } = require('jsdom');
const bodyParser = require('body-parser');
const NEAT = require('neataptic');
let jsdom = new JSDOM('<!doctype html><html><body></body></html>');
let { window } = jsdom;
global.window = window
global.document = window.document
global.navigator = {
    userAgent: 'node.js',
};
const app = express();
const port = 3000;
app.listen(port);
app.use(bodyParser.json());

const Simulation = require('simulation').default;
const simulation = new Simulation(60);
app.post('/evaluate', function (req, res) {
    let genom = NEAT.Network.fromJSON(req.body);
    simulation.evaluate(genom).then(() => {
        let score = simulation.car.getComponent('car').fitness;
        res.json({
            score: score
        })
    });
    for(let i = 0; i <= 60; i += 1.0 / 60.0) {
        simulation.update(1.0 / 60.0);
    }
})
