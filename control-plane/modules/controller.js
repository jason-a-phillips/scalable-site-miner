'use strict';

const Promise = require('bluebird');
const Pg = require('../utils/pg-query');
const Moment = require('moment');

let frRegistered;
let frOperational;
let frStillUpdating;


function runFinderCheck() {

  frRegistered = [];
  frOperational = [];
  frStillUpdating = [];

  let shouldRebalance = false;

  return Pg.getLastFinderCheckins()
    .then(rows => {
      return rows.filter(row => Moment(row.maxcheckintime).utc().format() < Moment.utc().subtract(5, 'minutes').format());
    })
    .then(finders => {
      shouldRebalance = !!finders.length;
      // Disable finders not checking in
      return Promise.map(finders, finder => {
        console.log('>>> Deactivating, didnt check in', finder.uuid);
        return Pg.updateFinderStatus(Constants.FinderStatus.DEACTIVATED, finder.uuid);
      });
    })
    .then(() => {
      // Compare sourcetofinder and sourceconfig lists. Rebalance if not the same.
      return Pg.getSourceconfigs()
        .then(sources => {
          return Pg.getSourceToFinders()
            .then(sourcetofinders => {
              shouldRebalance = (sourcetofinders.length !== sources.length) ? true : shouldRebalance;
              return Promise.resolve();
            })
        });
    })
    .then(() => {
      // Get good finders
      return Pg.getOperationalFinders();
    })
    .then(rows => {

      if (!rows.length) {
        console.log('>>> No active finders.');
        return Promise.resolve();
      }

      // build my arrays of record types
      rows.map(row => {
        if (row.status === global.Constants.FinderStatus.REGISTERED) {
          frRegistered.push(row);
        } else if (row.status === global.Constants.FinderStatus.OPERATIONAL) {
          frOperational.push(row);
        } else if (row.status === global.Constants.FinderStatus.SHOULDGETUPDATE) {
          frStillUpdating.push(row);
        }
      });

      if (frRegistered.length > 0 || frStillUpdating.length > 0) {
        shouldRebalance = true;
      }

      return Promise.resolve();
    })
    .then(() => {
      // Disable where status = SHOULDGETUPDATE
      return Promise.map(frStillUpdating, row => {
        console.log('>>> Deactivating, status was SHOULDGETUPDATE', row.uuid);
        return Pg.updateFinderStatus(Constants.FinderStatus.DEACTIVATED, row.uuid);
      });
    })
    .then(() => {
      // Apportion finders if necessary
      let finders = frOperational.concat(frRegistered);

      if (shouldRebalance && finders.length) {
        let numerator = finders.length - 1;

        return Pg.deleteSourcetofinder()
          .then(() => {
            return Pg.getSourceconfigs();
          })
          .then(sources => {
            return Promise.map(sources, source => {
              numerator++;
              // console.log('>>> Apportioning source, finder:', [source.source, finders[numerator % finders.length].uuid]);
              return Pg.insertSourcetofinder(finders[numerator % finders.length].id, source.id);
            });
          })
          .then(() => {
            return Promise.map(finders, row => {
              return Pg.updateFinderStatus(Constants.FinderStatus.SHOULDGETUPDATE, row.uuid);
            });
          });
      } else {
        // console.log('>>> Nothing to apportion.');
        return Promise.resolve();
      }
    });
}

module.exports = {
  runFinderCheck
};


