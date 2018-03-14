
'use strict';

const Pg = require('./pg-connector');
const Moment = require('moment');
const Promise = require('bluebird');

const pgquery = {

  updateFinderStatus: function updateFinderStatus(status) {
    const sql = 'update finderregistry set status = $1 ' +
      'where uuid = $2;';

    const values = [status, global.UniqueId];

    const query = {
      name: 'update-finder-status',
      text: sql,
      values: values,
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('updateFinderStatus count:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },

  finderCheckIn: function finderCheckIn() {
    const sql = 'insert into findercheckin (uuid, checkintime) ' +
      'values ($1, $2 AT TIME ZONE \'UTC\');';

    const values = [global.UniqueId, Moment.utc().format()];

    const query = {
      name: 'finder-checkin',
      text: sql,
      values: values,
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('finderCheckIn count:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },

  getFinderAssignments: function getFinderAssignments() {
    const sql = 'select c.* ' +
      'from sourceconfig c join sourcetofinder sf on c.id = sf.sourceid ' +
      'join finderregistry f on f.id = sf.finderid ' +
      'where f.uuid = $1;';

    const values = [global.UniqueId];

    const query = {
      name: 'get-finder-assignments',
      text: sql,
      values: values,
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            console.log('>>> Number of finders assigned:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },

  getFinderStatus: function getFinderStatus() {
    const sql = 'select status from finderregistry where uuid = $1;';

    const values = [global.UniqueId];

    const query = {
      name: 'get-finder-status',
      text: sql,
      values: values,
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('getFinderStatus count:', res.rows.length);
            return res.rows[0];
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },

  registerFinder: function registerFinder() {
    const sql = 'insert into finderregistry (uuid, registertime, status) ' +
      'values ($1, $2 AT TIME ZONE \'UTC\', $3);';

    const values = [global.UniqueId, Moment.utc().format(), global.Constants.FinderStatus.REGISTERED];

    const query = {
      name: 'register-finder',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('registerFinder count:', res.rows.length);
            return Promise.resolve();
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },

  // Used by finder to do check-if-exists and insert new record if not
  insertMaybe: function insertMaybe(values) {

    const sql = 'with rows as ( ' +
      'insert into ingress (title, description, url, image, createdate, domain, author, keywords) ' +
      'select $1, $2, $3, $4, $5, $6, $7, $8 ' +
      'where not exists (select 1 from ingress where domain = $6 and url = $3) ' +
      'returning 1 ) ' +
      'select count(*) from rows;';

    const query = {
      name: 'insert-maybe',
      text: sql,
      values: values,
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('insertMaybe count:', res.rows.length);
            return Promise.resolve();
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },

  alreadyInserted: function insert(params) {

    let sql = 'select count(*) as cnt from ingress where domain = $1 and url = $2;';

    const query = {
      name: 'already-inserted',
      text: sql,
      values: params,
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('updateFinderStatus count:', res.rows.length);
            if (res.rows.length > 0) {
              return res.rows[0];
            } else {
              return {};
            }
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },


  logJobHistory: function logJobHistory(start) {

    console.log('>>> UUID ' + global.UniqueId + ' finished job in ' + Moment().utc().diff(Moment(start), 'seconds') + ' seconds.');

    const sql = 'insert into finderjobhistory (uuid, starttime, finishtime) ' +
      'values ($1, $2 AT TIME ZONE \'UTC\', $3 AT TIME ZONE \'UTC\');';

    const query = {
      name: 'log-job-history',
      text: sql,
      values: [global.UniqueId, start, Moment.utc().format()],
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('logJobHistory count:', res.rows.length);
            return Promise.resolve();
          })
          .catch(err => {
            client.release();
            throw err;
          });
      });
  },
};

module.exports = pgquery;
