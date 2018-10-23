!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.simulation=n():e.simulation=n()}(global,function(){return function(e){var n={};function o(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,o),r.l=!0,r.exports}return o.m=e,o.c=n,o.d=function(e,n,t){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,n){if(1&n&&(e=o(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(o.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)o.d(t,r,function(n){return e[n]}.bind(null,r));return t},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="",o(o.s=0)}([function(e,n,o){var t=o(1),r=o(2),i=o(3),u=o(4);if(i.isMaster)!function(){var e=o(5),n=new e("postgres","postgres","example",{dialect:"postgres",host:"192.168.1.52"}),a=o(6)(n,e);a.sync({force:!0});var p=o(7)(n,e);p.sync({force:!0}),p.belongsTo(a,{foreignKey:"fk_genome_id"});for(var l=u.cpus().length,s=new t.Neat(37,6,null,{popsize:128*l,mutation:t.methods.mutation.ALL,mutationRate:.15}),f=(Number.MIN_VALUE,[]),c=0,d=0;d<l;d++)f.push(i.fork());for(var g=0;g<l;g++)f[g].on("message",function(e){c+=1,s.population[e.index].score=e.score,s.population[e.index].real_id=e.index+s.generation*s.population.length,a.create({fitness:e.score,generation:s.generation})});r.chunk(s.population,s.population.length/f.length).forEach(function(e,n){var o=e.map(function(e){return e.toJSON()});f[n].send({json:o,index:Math.floor(n*(s.population.length/f.length))})}),setInterval(function(){c===s.population.length&&(!function(){s.sort(),console.log("Generation "+s.generation),p.create({fk_genome_id:s.population[0].real_id,type:"MAX",json:s.population[0].toJSON()}),p.create({fk_genome_id:s.population[s.population.length-1].real_id,type:"MIN",json:s.population[s.population.length-1].toJSON()});for(var e=[],n=0;n<s.elitism;n++)e.push(s.population[n]);for(var o=0;o<s.popsize-s.elitism;o++)e.push(s.getOffspring());s.population=e,s.mutate(),s.generation++}(),c=0,r.chunk(s.population,s.population.length/f.length).forEach(function(e,n){var o=e.map(function(e){return e.toJSON()});f[n].send({json:o,index:Math.floor(n*(s.population.length/f.length))})}))},100)}();else{var a=new(0,o(8).JSDOM)("<!doctype html><html><body></body></html>").window;global.window=a,global.document=a.document,global.navigator={userAgent:"node.js"};var p=new(0,o(9).default)(60);process.on("message",function(e){for(var n=0;n<e.json.length;n++){var o=t.Network.fromJSON(e.json[n]),r=p.evalGenome(1/30,o);process.send({score:r,index:e.index+n})}})}},function(e,n){e.exports=require("neataptic")},function(e,n){e.exports=require("lodash")},function(e,n){e.exports=require("cluster")},function(e,n){e.exports=require("os")},function(e,n){e.exports=require("sequelize")},function(e,n){e.exports=function(e,n){return e.define("genome",{id:{type:n.INTEGER,primaryKey:!0,autoIncrement:!0},fitness:{type:n.FLOAT},generation:{type:n.INTEGER}})}},function(e,n){e.exports=function(e,n){return e.define("genomeInfo",{fk_genome_id:{type:n.INTEGER,primaryKey:!0},type:{type:n.ENUM,values:["MIN","MAX"]},json:{type:n.JSON}})}},function(e,n){e.exports=require("jsdom")},function(e,n){e.exports=require("simulation")}])});