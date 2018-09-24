/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("p2");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("ces");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("chance");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var suite = new __webpack_require__(5).Benchmark.Suite();

var Simulation = __webpack_require__(8).default;

var NEAT = __webpack_require__(7);

var neat = new NEAT.Neat(37, 6, // LEFT, RIGHT, FORWARD, BACKWARDS, BREAK
null, {
  popsize: 256,
  mutation: NEAT.methods.mutation.ALL,
  mutationRate: 0.25,
  network: new NEAT.architect.Random(37, 128, 6)
});
var sim = new Simulation(60);
suite.add('SimulationStep', function () {
  for (var i in neat.population) {
    sim.evalGenome(1000 / 30.0, neat.population[i]);
  }
}).on('complete', function () {
  console.log(this[0].toString());
}).run({
  'async': true
});

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("benchmark");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("assert");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("neataptic");

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external "ces"
var external_ces_ = __webpack_require__(1);

// EXTERNAL MODULE: external "p2"
var external_p2_ = __webpack_require__(0);

// CONCATENATED MODULE: ./simulation/systems/physics.js


/* harmony default export */ var physics = (external_ces_["System"].extend({
  addedToWorld: function addedToWorld(world) {
    var _this = this;

    this._super(world);

    this.p2World = new external_p2_["World"]({
      gravity: [0, 0]
    });
    world.entityAdded('physics').add(function (entity) {
      var physicsComponent = entity.getComponent('physics');
      physicsComponent.world = _this.p2World;

      _this.p2World.addBody(physicsComponent.body);
    });
    world.entityRemoved('physics').add(function (entity) {
      _this.p2World.removeBody(entity.getComponent('physics').body);
    });
  },
  update: function update(dt) {
    this.p2World.step(1 / 30.0, dt, 20);
  }
}));
// CONCATENATED MODULE: ./simulation/systems/car.js



function indexOfMaximum(arr) {
  var index = -1;
  var maximum = -1;

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] > maximum) {
      maximum = arr[i];
      index = i;
    }
  }

  return index;
} // noinspection JSUnusedLocalSymbols


/* harmony default export */ var systems_car = (external_ces_["System"].extend({
  update: function update(dt) {
    var _this = this;

    this.world.getEntities('car').forEach(function (entity) {
      var body = entity.getComponent('car');
      var pb = body.chassis.getComponent('physics').body;

      if (pb.callbackInitialized === undefined) {
        pb.world.on('beginContact', function (event) {
          var bodyA = event.bodyA;
          var bodyB = event.bodyB;
          if (pb.sleepState !== external_p2_["Body"].SLEEPING) body.fitness -= 50000;

          if (bodyA.id === pb.id || bodyB.id === pb.id) {
            pb.allowSleep = true;
            pb.force = [0, 0];
            pb.sleep();
          }
        });
        pb.callbackInitialized = true;
      }

      if (_this.input === undefined) {
        _this.input = [];

        for (var i = 0; i <= body.sensors.length; i++) {
          _this.input.push(0);
        }

        body.backWheel.setBrakeForce(0);
        body.frontWheel.setBrakeForce(0);
        body.frontWheel.setSideFriction(8000);
        body.backWheel.setSideFriction(6000);
      }

      for (var _i = 0; _i < body.sensors.length; _i++) {
        body.sensors[_i].cast(pb.position, [pb.id], pb.angle);

        if (body.sensors[_i].shortest.distance === Infinity || body.sensors[_i].shortest.distance > 800) {
          body.sensors[_i].shortest.distance = 800;
        }

        body.sensors[_i].shortest.distance /= 800.0;
        _this.input[_i] = body.sensors[_i].shortest.distance;
      }

      _this.input[body.sensors.length - 1] = pb.angle;
      var vel = Math.sqrt(external_p2_["vec2"].squaredLength(pb.velocity));

      if (vel === 0 && body.fitness !== 0) {
        pb.allowSleep = true;
        pb.force = [0, 0];
        pb.sleep();
      }

      if (pb.sleepState === external_p2_["Body"].SLEEPING) return;
      var output = body.genome.activate(_this.input);
      var isVelNaN = isNaN(vel);

      for (var _i2 = 0; _i2 < output.length; _i2++) {
        if (isVelNaN || isNaN(output[_i2])) {
          output[_i2] = 0;
          body.fitness = -9000000;
          pb.allowSleep = true;
          pb.force = [0, 0];
          pb.sleep();
          return;
        }
      }

      var steeringControl = output.slice(0, 3);
      var steeringChoice = indexOfMaximum(steeringControl);
      var throttleControl = output.slice(4, 6);
      var throttleChoice = indexOfMaximum(throttleControl);
      var dir = 0;

      if (throttleChoice === 0) {
        // FORWARD
        dir = -1;
        body.fitness += vel;
      } else if (throttleChoice === 1) {
        // BACKWARDS
        dir = 0.15;
        body.fitness += vel * 0.5;
      } else if (throttleChoice === 2) {
        // BREAK
        if (vel === 0.0) {
          pb.allowSleep = true;
          pb.force = [0, 0];
          pb.sleep();
        }

        dir = 0;
        body.fitness -= 100;
        body.frontWheel.setBrakeForce(5 * 2000);
      }

      if (steeringChoice === 0) {
        if (body.frontWheel.steerValue > 5.0 / 6.0 * Math.PI) {
          body.frontWheel.steerValue -= Math.PI / 180.0 * 10;
        }
      } else if (steeringChoice === 1) {
        if (body.frontWheel.steerValue < Math.PI / 6.0) {
          body.frontWheel.steerValue += Math.PI / 180.0 * 10;
        }
      }

      body.backWheel.engineForce = dir * 7 * 9000;
    });
  }
}));
// CONCATENATED MODULE: ./simulation/components/physics.js

/* harmony default export */ var components_physics = (external_ces_["Component"].extend({
  name: 'physics',
  init: function init(body) {
    this.body = body;
  }
}));
// CONCATENATED MODULE: ./simulation/components/car.js

/*
 * Component that represents car
 */

/* harmony default export */ var components_car = (external_ces_["Component"].extend({
  name: 'car',
  force: 0.0,
  init: function init(chassis, genome, car, frontWheel, backWheel) {
    this.genome = genome;
    this.chassis = chassis;
    this.car = car;
    this.fitness = 0;
    this.frontWheel = frontWheel;
    this.backWheel = backWheel;
  },
  getAngle: function getAngle(wheel, angle) {
    if (angle < wheel.angleFrom) angle = wheel.angleFrom;
    if (angle > wheel.angleTo) angle = wheel.angleTo;
    return angle;
  },
  steer: function steer(angle) {
    var _this = this;

    this.wheels.forEach(function (wheel) {
      wheel.angle = _this.getAngle(wheel, angle);
    });
  }
}));
// EXTERNAL MODULE: external "lodash"
var external_lodash_ = __webpack_require__(3);

// CONCATENATED MODULE: ./simulation/entities/raySensor.js
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// import * as PolyK from 'polyk'
// import * as _ from 'lodash'

var raySensor_Sensor =
/*#__PURE__*/
function () {
  function Sensor(endPoint, world) {
    var _this = this;

    _classCallCheck(this, Sensor);

    this.endPoint = endPoint;
    this.world = world;
    this.shortest = null;
    this.endPoint[0] *= 800;
    this.endPoint[1] *= 800;
    var t = this;
    this.shortest = {
      distance: Infinity
    };
    this.ray = new external_p2_["Ray"]({
      mode: external_p2_["Ray"].ALL,
      from: t.origin,
      to: t.endPoint,
      callback: function callback(result) {
        if (t.ignoredIDs.includes(result.body.id)) return;
        var distance = result.getHitDistance(t.ray);

        if (distance < _this.shortest.distance) {
          t.shortest.distance = distance;
          t.shortest.body = result.body;
        }
      }
    });
  }

  _createClass(Sensor, [{
    key: "cast",
    value: function cast(origin, ignoredIDs, rotation) {
      var rotatedEndPoint = [0, 0];
      external_p2_["vec2"].rotate(rotatedEndPoint, this.endPoint, rotation);
      var destination = [0, 0];
      destination[0] = origin[0] + rotatedEndPoint[0];
      destination[1] = origin[1] + rotatedEndPoint[1];
      this.ignoredIDs = ignoredIDs;
      this.calculateShortest(origin, destination);
    }
  }, {
    key: "calculateShortest",
    value: function calculateShortest(origin, destination) {
      this.ray.from = origin;
      this.ray.to = destination;
      this.ray.update();
      var result = new external_p2_["RaycastResult"]();
      this.world.raycast(result, this.ray);
    }
  }]);

  return Sensor;
}();
// CONCATENATED MODULE: ./simulation/entities/car.js






/* harmony default export */ var entities_car = (function (x, y, world, genome) {
  var entity = new external_ces_["Entity"]();
  var body = new external_p2_["Body"]({
    mass: 2000,
    position: [x, y],
    allowSleep: false
  });
  body.addShape(new external_p2_["Box"]({
    width: 100,
    height: 200
  }));
  entity.addComponent(new components_physics(body));
  var car = new external_p2_["TopDownVehicle"](body);
  var frontWheel = car.addWheel({
    localPosition: [0, 100]
  });
  var backWheel = car.addWheel({
    localPosition: [0, -100]
  });
  entity.addComponent(new components_car(entity, genome, car, frontWheel, backWheel));
  world.addEntity(entity);
  var carComponent = entity.getComponent('car');
  var p2World = entity.getComponent('physics').world;
  car.addToWorld(p2World);
  carComponent.sensors = external_lodash_["range"](0, 360, 10).map(function (el) {
    return new raySensor_Sensor([Math.cos(el * (Math.PI / 180)), Math.sin(el * (Math.PI / 180))], p2World);
  });
  return entity;
});
// CONCATENATED MODULE: ./simulation/entities/wall.js



/* harmony default export */ var wall = (function (x, y, w, h, world) {
  var entity = new external_ces_["Entity"]();
  var body = new external_p2_["Body"]({
    mass: 0,
    position: [x, y]
  });
  body.addShape(new external_p2_["Box"]({
    width: w,
    height: h
  }));
  entity.addComponent(new components_physics(body // Matter.Bodies.rectangle(x, y, w, h, {
  //   isStatic: true
  // })
  ));
  world.addEntity(entity);
  return entity;
});
// CONCATENATED MODULE: ./simulation/entities/physicsGroup.js
function physicsGroup_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function physicsGroup_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function physicsGroup_createClass(Constructor, protoProps, staticProps) { if (protoProps) physicsGroup_defineProperties(Constructor.prototype, protoProps); if (staticProps) physicsGroup_defineProperties(Constructor, staticProps); return Constructor; }

var PhysicsGroup =
/*#__PURE__*/
function () {
  function PhysicsGroup(bodies) {
    physicsGroup_classCallCheck(this, PhysicsGroup);

    var assert = __webpack_require__(6);

    assert(bodies instanceof Array);
    this.bodies = bodies;
    this.bodies.forEach(function (el) {
      el.oldOrigin = el.body.position.slice(0);
    });
  }
  /**
   * moves all object by relative offset
   */


  physicsGroup_createClass(PhysicsGroup, [{
    key: "move",
    value: function move(offsetX, offsetY) {
      this.bodies.forEach(function (el) {
        el.body.position[0] += offsetX;
        el.body.position[1] += offsetY;
      });
    }
  }, {
    key: "moveAbsolute",
    value: function moveAbsolute(x, y) {
      this.bodies.forEach(function (el) {
        el.body.position = el.oldOrigin.slice(0);
      });
      this.move(x, y);
    }
  }]);

  return PhysicsGroup;
}();


// CONCATENATED MODULE: ./simulation/entities/roadPart.js

/* harmony default export */ var roadPart = (function (x, y, world, walls) {
  var wallPhysicsComponent = walls.map(function (wall) {
    return wall.getComponent('physics');
  });
  return new PhysicsGroup(wallPhysicsComponent);
});
// EXTERNAL MODULE: external "chance"
var external_chance_ = __webpack_require__(2);
var external_chance_default = /*#__PURE__*/__webpack_require__.n(external_chance_);

// CONCATENATED MODULE: ./simulation/systems/roadDirector.js





function getDirection(x, y, w, h) {
  if (x >= w) return 'right';
  if (y >= h) return 'up';
  if (x <= 0) return 'left';
  if (y <= 0) return 'down';
  return 'onScreen';
}

var STARTING_PIECE = 'Box';
/* harmony default export */ var roadDirector = (external_ces_["System"].extend({
  setWorld: function setWorld(world) {
    var _this = this;

    this.world = world;
    this.rng = new external_chance_default.a('RNG0,0');
    this.position = [0, 0];
    this.parts = {
      '-': {
        'group': roadPart(0, 0, this.world, [wall(0, 250, 8000, 20, this.world), wall(0, 550, 8000, 20, this.world)]),
        'possibleParts': {
          'left': ['Cross', 'T'],
          'right': ['Cross', 'T']
        }
      },
      'I': {
        'group': roadPart(0, 0, this.world, [wall(250, 0, 20, 8000, this.world), wall(550, 0, 20, 8000, this.world)]),
        'possibleParts': {
          'up': ['Cross', 'I'],
          'down': ['Cross', 'T', 'I']
        }
      },
      'T': {
        'group': roadPart(0, 0, this.world, [wall(250, 700, 20, 400, this.world), wall(550, 700, 20, 400, this.world), wall(125, 500, 250, 20, this.world), wall(675, 500, 250, 20, this.world), wall(400, 250, 800, 20, this.world)]),
        'possibleParts': {
          'down': ['Cross', 'I'],
          'up': ['Cross', 'I'],
          'left': ['Cross', 'T'],
          'right': ['Cross', 'T']
        }
      },
      'Cross': {
        'group': roadPart(0, 0, this.world, [wall(675, 500, 250, 20, this.world), wall(125, 500, 250, 20, this.world), wall(675, 250, 250, 20, this.world), wall(125, 250, 250, 20, this.world), wall(250, 50, 20, 400, this.world), wall(550, 50, 20, 400, this.world), wall(250, 700, 20, 400, this.world), wall(550, 700, 20, 400, this.world)]),
        'possibleParts': {
          'up': ['Cross', 'I'],
          'down': ['Cross', 'T', 'I'],
          'left': ['Cross', 'T'],
          'right': ['Cross', 'T']
        }
      },
      'Box': {
        'group': roadPart(0, 0, this.world, [wall(400, 0, 800, 20, this.world), wall(0, 400, 20, 800, this.world), wall(800, 400, 20, 800, this.world), wall(400, 800, 800, 20, this.world)]),
        'possibleParts': {}
      }
    };
    Object.keys(this.parts).forEach(function (key) {
      if (key !== STARTING_PIECE) {
        _this.parts[key]['group'].moveAbsolute(Math.sin(Math.random()) * 50000, Math.cos(Math.random()) * 50000);
      }
    });
  },
  reset: function reset() {
    this.rng = new external_chance_default.a('RNG0,0');
    this.position = [0, 0];
    this.currentPart['group'].moveAbsolute(Math.sin(Math.random()) * 50000, Math.cos(Math.random()) * 50000);
    this.currentPart = this.parts[STARTING_PIECE];
    this.currentPart['group'].moveAbsolute(0, 0);
  },
  setCar: function setCar(car) {
    this.car = car;
  },
  getCarPosition: function getCarPosition() {
    if (this.car != null) {
      var body = this.car.getComponent('physics').body;
      return body.position;
    }

    return null;
  },
  swapNextRoadPart: function swapNextRoadPart(direction) {
    if (this.currentPart === undefined) return;
    var possiblePieces = this.currentPart['possibleParts'][direction];
    if (possiblePieces.length === 0) return;
    if (direction === 'up') this.position[1] += 1;
    if (direction === 'down') this.position[1] -= 1;
    if (direction === 'left') this.position[0] -= 1;
    if (direction === 'right') this.position[0] += 1;
    this.currentPart['group'].moveAbsolute(50000, 50000);
    this.rng = new external_chance_default.a('RNG' + this.position[0] + ',' + this.position[1]);

    if (this.position[0] === 0 && this.position[1] === 0) {
      this.currentPart = this.parts[STARTING_PIECE];
    } else {
      this.currentPart = this.parts[this.rng.pickone(possiblePieces)];
    }

    this.currentPart['group'].moveAbsolute(0, 0);
    this.moveCarBackToScreen(direction);
  },
  moveCarBackToScreen: function moveCarBackToScreen(direction) {
    var body = this.car.getComponent('physics').body;
    this.car.getComponent('car').fitness += 500;
    var newPos = [0, 0];

    if (direction === 'up') {
      newPos = [body.position[0], 0];
    } else if (direction === 'down') {
      newPos = [body.position[0], 800];
    } else if (direction === 'left') {
      newPos = [800, body.position[1]];
    } else if (direction === 'right') {
      newPos = [0, body.position[1]];
    }

    body.position = newPos;
  },
  update: function update(dt) {
    if (this.currentPart === undefined) {
      this.currentPart = this.parts[STARTING_PIECE];
    }

    var pos = this.getCarPosition();

    if (pos !== null) {
      var x = pos[0];
      var y = pos[1];
      var direction = getDirection(x, y, 800, 800);

      if (direction !== 'onScreen') {
        this.swapNextRoadPart(direction);
      }
    }
  }
}));
// CONCATENATED MODULE: ./simulation/main.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return main_Simulation; });
function main_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function main_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function main_createClass(Constructor, protoProps, staticProps) { if (protoProps) main_defineProperties(Constructor.prototype, protoProps); if (staticProps) main_defineProperties(Constructor, staticProps); return Constructor; }







var CES = __webpack_require__(1);

function fillNaN(object, value) {
  function replaceNaN(x) {
    if (isNaN(x)) {
      return value;
    }

    return x;
  }

  var keys = Object.keys(object);

  for (var i in keys) {
    if (typeof object[keys[i]] === 'number' && isNaN(object[keys[i]])) {
      object[keys[i]] = value;
    } else if (object[keys[i]] !== null && object[keys[i]].constructor === Float32Array) {
      for (var j = 0; j < object[keys[i]].length; j++) {
        object[keys[i]][j] = replaceNaN(object[keys[i]][j]);
      }
    }
  }
}
/**
 * Main class of simulation
 */


var main_Simulation =
/*#__PURE__*/
function () {
  function Simulation(frames) {
    main_classCallCheck(this, Simulation);

    this.time = frames;
  }

  main_createClass(Simulation, [{
    key: "init",
    value: function init() {
      if (this.world === undefined) {
        this.world = new CES.World();
        this.physicsSystem = new physics();
        this.world.addSystem(this.physicsSystem);
        this.world.addSystem(new systems_car());
        this.car = entities_car(400.0, 400.0, this.world, this.genome);
        this.roadDirector = new roadDirector();
        this.roadDirector.setWorld(this.world);
        this.roadDirector.setCar(this.car);
        this.world.addSystem(this.roadDirector);
      } else {
        this.car.getComponent('car').genome = this.genome;
      }

      this.lastDt = 0;
    }
  }, {
    key: "evaluate",
    value: function evaluate(genome) {
      this.destroy();
      this.genome = genome;
      this.init();
      this.acc = 0;
      this.lastDt = null;
      var t = this;
      return new Promise(function (resolve) {
        t.onFinish = resolve;
      });
    }
  }, {
    key: "evalGenome",
    value: function evalGenome(dt, genome) {
      this.destroy();
      this.genome = genome;
      this.init();
      this.acc = 0;
      this.lastDt = null;
      var fitness = 0;

      while (this.acc < this.time && this.car.getComponent('physics').body.sleepState !== external_p2_["Body"].SLEEPING) {
        fitness = this.update(dt);
      }

      return fitness;
    }
    /**
     * Main simulation loop
     */

  }, {
    key: "update",
    value: function update(dt) {
      if (this.lastDt === null) this.lastDt = dt;
      this.acc += dt;

      if (this.acc < this.time && this.car.getComponent('physics').body.sleepState !== external_p2_["Body"].SLEEPING) {
        this.world.update(dt);
      }

      return this.car.getComponent('car').fitness;
    }
    /**
     * Called on component destruction
     */

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.world !== undefined) {
        this.car.getComponent('car').fitness = 0;
        var body = this.car.getComponent('physics').body; //fillNaN(body, 0.0)

        body.allowSleep = false;

        if (body.sleepState === external_p2_["Body"].SLEEPING) {
          body.wakeUp();
        }

        body.setZeroForce();
        body.position = [this.position[0], this.position[1]];
        body.angularVelocity = 0;
        body.velocity = [0, 0];
        body.angle = 0;
        this.roadDirector.reset();
      } else {
        this.position = [400, 400];
        this.velocity = [0, 0];
      }
    }
  }]);

  return Simulation;
}();



/***/ })
/******/ ]);