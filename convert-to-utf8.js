'use strict';

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
).then(columnsToConvert => {
  const promises = columnsToConvert.map(row => {
    const { table_name: table, column_name: col } = row;
    return gazelle.schema.raw(`UPDATE \`${table}\` SET \`${col}\` = @txt WHERE char_length(\`${col}\`) =  LENGTH(@txt := CONVERT(BINARY CONVERT(\`${col}\` USING latin1) USING utf8))`);
  });
  return Promise.all(promises)
}).then(disconnect);
