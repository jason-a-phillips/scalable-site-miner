'use strict';

const Schedule = require('node-schedule');
const Uuid = require('uuid/v4');
const Consts = require('./utils/constants');
const Monitor = require('./utils/monitor');

// Uncomment for developing a new template, otherwise comment out
// const Tester = require('./modules/tester');
// Tester.find();

// Uncomment to run the finder service
global.UniqueId = Uuid(); // create a unique ID for this instance
console.log('>>> Finder ' + global.UniqueId + ' reporting for duty!!!');
global.Constants = Consts;
global.FinderObj = null;
global.AmIOperational = false;

Monitor.checkIn()
  .then(Monitor.init)
  .catch(err => console.log(err));

Schedule.scheduleJob('50 */1 * * * *', () => {Monitor.checkShouldGetUpdate().catch(e => console.log('!!!Error Monitor.checkShouldGetUpdate():', e));});
Schedule.scheduleJob('10,40 */2 * * * *', () => {Monitor.checkIn().catch(e => console.log('!!!Error Monitor.checkIn():', e));});




