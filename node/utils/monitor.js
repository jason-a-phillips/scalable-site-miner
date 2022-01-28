'use strict';

const Schedule = require('node-schedule');
const Pg = require('./pg-query');
const Finder = require('../modules/finder');
const Promise = require('bluebird');
const Moment = require('moment');

/*
  1. First, register with controller
  2. Then, check in to show I'm alive
  3. Then, check my status.  If I should update, then wipe and update my scheduled tasks
  4. Keep checking in, keep checking if I should update
*/

const monitor = {

  init: function init() {
    // register myself with controller
    console.log('>>> I just registered myself', Moment.utc().format());
    return Pg.registerFinder();
  },

  checkIn: function checkIn() {
    // ping the controller that I'm alive
    console.log('>>> I just checked in', Moment.utc().format());
    return Pg.finderCheckIn();
  },

  checkShouldGetUpdate: function checkShouldGetUpdate() {
    return Pg.getFinderStatus()
      .then(result => {
        if (result && (result.status === global.Constants.FinderStatus.SHOULDGETUPDATE || result.status === global.Constants.FinderStatus.DEACTIVATED)) {

          if (global.FinderObj) {
            global.FinderObj.cancel();
          }
          global.FinderObj = null;

          if (result.status === global.Constants.FinderStatus.DEACTIVATED) {
            global.AmIOperational = false;
            console.log('>>> Setting myself to NOT operational');
            return Promise.resolve();
          } else if (result.status === global.Constants.FinderStatus.SHOULDGETUPDATE) {
            return Pg.getFinderAssignments()
              .then(rows => {
                global.FinderObj = Schedule.scheduleJob('00 * * * * *', () => {return Finder.find(rows).catch(e => console.log('!!!Error Scheduled Finder.find() err:', e))});
                return Promise.resolve();
              })
              .then(() => {
                global.AmIOperational = true;
                console.log('>>> Setting myself to OPERATIONAL');
                return Pg.updateFinderStatus(global.Constants.FinderStatus.OPERATIONAL);
              });
          }
        }

        return Promise.resolve();
      });
  },

};


module.exports = monitor;
