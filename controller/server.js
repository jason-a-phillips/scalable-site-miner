'use strict';

const Schedule = require('node-schedule');
const Controller = require('./modules/controller');
const Consts = require('./utils/constants');

global.Constants = Consts;
global.ActiveFinders = [];

console.log('Controller starting up!');

Controller.runFinderCheck()
  .catch(err => console.log('>>> Worker.runFinderCheck():', err));

Schedule.scheduleJob('30 */1 * * * *', () => {
  Controller.runFinderCheck().catch(err => console.log('!!!Error Controller.runFinderCheck():', err));
});























