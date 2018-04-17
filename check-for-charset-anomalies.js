'use strict';

const _ = require('lodash');

function disconnect() {
	informationSchema.destroy();
        gazelle.destroy();
}

const password = process.argv[2];
const informationSchema = require('knex')({
  client: 'mysql',
  connection: {
    host: "localhost",
    user: "root",
    password: password,
    database: "information_schema",
    charset: 'latin1'
  }
});

const gazelle = require('knex')({
  client: 'mysql',
  connection: {
    host: "localhost",
    user: "root",
    password: password,
    database: "the_gazelle",
    charset: 'utf8'
  }
});

gazelle('staff').where('slug', '=', 'Ã¡dÃ¡m-nagy').del().then(() =>
  informationSchema.select('table_name', 'column_name')
    .from('columns')
    .where('table_schema', '=', 'the_gazelle')
    .whereNotNull('character_set_name')
    .where('table_name', 'not like', 'knex%')
).then(textColumns => {
  const byTable = textColumns.reduce((acc, cur) => {
    if (Object.prototype.hasOwnProperty.call(acc, cur.table_name)) {
      acc[cur.table_name].push(cur.column_name);
    } else {
      acc[cur.table_name] = [cur.column_name];
    }
    return acc;
  }, {});
  byTable.articles.push('published_at');
  const errors = [];
  const isInvalid = /(\b\S*?[^\w\s\n\r\[\]\{\}\.\,\<\>\-!=@\(\)\:à\\\/"'’áć™\;\?#&%ê\+“ă—Áčéő\*‘”\–ëó$~ñńèö£\^ß°]\S*?\b)/
  let cnt = 0;
  const promises = _.map(byTable, (columns, table) => {
    return gazelle.select(...columns).from(table).then(rows => {
      rows.forEach(singleRow => {
        columns.forEach(singleColumn => {
          if (singleColumn !== 'html' && singleColumn !== 'published_at' && (!singleRow.published_at || new Date(singleRow.published_at).getTime() > new Date(2016, 6, 0, 0, 0, 0, 0).getTime())) {
            const value = singleRow[singleColumn];
            if (value) {
              const match = value.match(isInvalid);
              if (match !== null) {
                errors.push({ anomaly: match[1], table, column: singleColumn, published_at: singleRow.published_at, slug: singleRow.slug });
              }
            }
          }
        });
      });
    });
  });
  return Promise.all(promises).then(() => errors);
}).then(errors => {
  console.log(errors.length);
  console.log(errors.slice(0, 50));
}).then(disconnect);
