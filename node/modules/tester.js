'use strict';

const Cheerio = require('cheerio');
const Promise = require('bluebird');
const Request = require('superagent');
const Moment = require('moment');
const sanitizeHtml = require('sanitize-html');
const pgQuery = require('../utils/pg-query');

const finder = {

  find: function find() {

    const rows = [{
      source: "Hacker News",
      config: {
        "uri": "https://news.ycombinator.com",
        "homepageLinksPath": ["table.itemlist tr > td > a.storylink"],
        "image": "meta[property=\"og:image\"]",
        "title": "meta[property=\"og:title\"]",
        "description": "meta[property=\"og:description\"]",
        "keywords": "meta[name=\"keywords\"]",
        "metaAuthor": "meta[name=\"author\"]",
        "urlFilters": [],  // Filters a page if the URL text matches a value contained in the array
        "pageFilters": []  // Filters an element on the page if the text matches a value contained in the array
      },
    }];

    const startTime = Moment.utc().format();

    return Promise.map(rows, row => {

      let config = row.config;

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log('>>> Request, source: ', row.source);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

      return Request.get(config.uri)
        .set({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'})
        .timeout({
          response: 10000,  // 10 seconds
          deadline: 16000,
        })
        .then((res) => {
          return Promise.resolve(res.res.text);
        })
        .then(body => {
          return Cheerio.load(body);
        })
        .then($ => {
          let links = [];

          config.homepageLinksPath.map(path => {
            const homePageLinks = $(path);
            for (const linkIndex in homePageLinks) {
              if (homePageLinks.hasOwnProperty(linkIndex)) {
                let link = $(homePageLinks[linkIndex]).attr('href');
                if (link) {
                  // link = link.indexOf(config.uri.replace('http://', '').replace('https://', '').replace('www.', '')) < 0 ? config.uri + link : link;
                  links.push(link);
                }
              }
            }
          });

          console.log(links);

          let insertLinks = [];

          return Promise.map(links, link => {
            const values = [row.source, link];

            return pgQuery.alreadyInserted(values)
              .then(row => {
                if (row.cnt === '0') {
                  insertLinks.push(link);
                }
                return Promise.resolve;
              })
              .catch(e => {
                console.log('!!! pgQuery.alreadyInserted Error:', [link, e]);
                return Promise.resolve;
              });
          }, {concurrency: 25})
            .then(() => {
              // filter link URLs for unwanted values
              if (config.urlFilters) {
                config.urlFilters.map(filter => {
                  insertLinks = insertLinks.filter(link => link.indexOf(filter) < 0);
                });
              }

              return Promise.map(insertLinks, url => {

                console.log('>>> URL:', url.slice(0, 50));

                return Request.get(url)
                  .set({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'})
                  .timeout({
                    response: 10000,  // 6 seconds
                    deadline: 16000,
                  })
                  .then(res => {
                    // console.log(res.res.text);
                    return Promise.resolve(res.res.text);
                  })
                  .then(body => {
                    return Cheerio.load(body);
                  })
                  .then($$ => {

                    let shouldMaybeInsert = true;

                    if (config.pageFilters && config.pageFilters.length > 0) {
                      config.pageFilters.map(item => {
                        const val = $$(item.path).text();
                        if (val === item.value) {
                          shouldMaybeInsert = false;
                        }
                      })
                    }

                    if (shouldMaybeInsert) {
                      const title = $$(config.title).attr('content') ? $$(config.title).attr('content') : $$(config.title).text();
                      const description = $$(config.description).attr('content') ? $$(config.description).attr('content') : $$(config.description).text();
                      const image = $$(config.image).attr('content');
                      const keywords = $$(config.keywords).attr('content') ? $$(config.keywords).attr('content') : $$(config.keywords).text();
                      const author = $$(config.metaAuthor).attr('content') ? $$(config.metaAuthor).attr('content') : $$(config.metaAuthor).text().trimRight().trimLeft();
                      const createdate = Moment.utc().format();

                      // console.log('---------------------------');
                      // console.log('Title:', title);
                      // console.log('Description:', description);
                      // console.log('Url:', url);
                      // console.log('Image:', image);
                      // console.log('Source:', row.source);
                      // console.log('Author:', author);
                      // console.log('Keywords:', keywords);
                      // console.log('CreateDate:', createdate);

                      const values = [sanitizeHtml(title), sanitizeHtml(description), sanitizeHtml(url), sanitizeHtml(image), createdate, row.source, sanitizeHtml(author), sanitizeHtml(keywords)];

                      if (title) {
                        return pgQuery.insertMaybe(values)
                          .then(() => {
                            return Promise.resolve();
                          });
                      }
                    }

                    return Promise.resolve();
                  })
                  .catch(e => {
                    console.log('!!!Error HTTP Request err for URL:', [url, e.message]);
                    return Promise.resolve();
                  });
              }, { concurrency: 8 });
            })
        })
        .catch(e => {
          console.log('!!!Error Error for source URL:', [config.uri, e.message]);
          return Promise.resolve();
        });
    }, { concurrency: 2 })
      .then(() => {
        return pgQuery.logJobHistory(startTime)
          .then(() => {
            return Promise.resolve();
          })
          .catch(e => {
            console.log('!!!Error logging job history:', e.message);
            return Promise.resolve();
          });
      });
  },

};


module.exports = finder;















