
'use strict';

const Pg = require('./pg-connector');
const Moment = require('moment');

let query = {

  getOperationalFinders: function() {
    let sql = 'select id, uuid, registertime, status from finderregistry where status in ($1,$2,$3);';

    let values = [Constants.FinderStatus.REGISTERED, Constants.FinderStatus.OPERATIONAL, Constants.FinderStatus.SHOULDGETUPDATE];

    let query = {
      name: 'get-operational-finders',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('getOperationalFinders count:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            console.log('!!!Error getOperationalFinders:', err);
            throw err;
          });
      });
  },

  getLastFinderCheckins: function() {
    let sql = 'select fc.uuid, max(checkintime) as maxcheckintime  ' +
      'from findercheckin fc join finderregistry fr on fc.uuid = fr.uuid ' +
      'where fr.status != $1 ' +
      'group by fc.uuid;'

    let values = [global.Constants.FinderStatus.DEACTIVATED];

    let query = {
      name: 'get-last-finder-checkins',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('getLastFinderCheckins count:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            console.log('!!!Error getLastFinderCheckins:', err);
            throw err;
          })
      });
  },

  updateFinderStatus: function(status, uuid) {
    let sql = 'update finderregistry set status = $1 ' +
      'where uuid = $2;';

    let values = [status, uuid];

    let query = {
      name: 'disable-finder',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('disableFinder count:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            console.log('!!!Error updateFinderStatus:', err);
            throw err;
          })
      });
  },

  deleteSourcetofinder: function() {
    let sql = 'delete from sourcetofinder;';

    let values = [];

    let query = {
      name: 'delete-sourcetofinder',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('deleteSourcetofinder count:', res.rows.length);
            return res.rows[0];
          })
          .catch(err => {
            client.release();
            console.log('!!!Error deleteSourcetofinder:', err);
            throw err;
          })
      });
  },

  getSourceconfigs: function() {
    let sql = 'select * from sourceconfig where disabled = false;';

    let values = [];

    let query = {
      name: 'get-sourceconfig',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('getSourceconfigs count:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            console.log('!!!Error getSourceconfigs:', err);
            throw err;
          })
      });
  },

  getSourceToFinders: function() {
    let sql = 'select id, finderid, sourceid, createtime from sourcetofinder;';

    let values = [];

    let query = {
      name: 'get-sourcetofinder',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('getSourceToFinders count:', res.rows.length);
            return res.rows;
          })
          .catch(err => {
            client.release();
            console.log('!!!Error getSourceToFinders:', err);
            throw err;
          })
      });
  },


  insertSourcetofinder: function(finderid, sourceid) {

    let sql = 'insert into sourcetofinder (finderid, sourceid, createtime) ' +
      'values ($1, $2, $3  AT TIME ZONE \'UTC\'); ';

    let values = [finderid, sourceid, Moment.utc().format()];

    let query = {
      name: 'insert-sourcetofinder',
      text: sql,
      values: values
    };

    return Pg.connect()
      .then(client => {
        return client.query(query)
          .then(res => {
            client.release();
            // console.log('insertSourcetofinder count:', res.rows.length);
          })
          .catch(err => {
            client.release();
            console.log('!!!Error insertSourcetofinder:', err);
            throw err;
          })
      });
  },
};

module.exports = query;
