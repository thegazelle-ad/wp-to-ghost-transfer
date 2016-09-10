const knex = require('knex')({
  client: 'mysql',
  connection: {
    // The host where the MariaDB is located
    "host": "127.0.0.1",
    // The username to login to the DB with
    "user": "root",
    // The password for the given user
    "password": "password",
    // The name of The Gazelle's database in the MariaDB
    "database": "the_gazelle",
  },
  pool: {
    max: 2000,
    min: 0
  }
});

knex.select('name', 'slug')
.from('categories')
.then((rows) => {
  const functionsStarted = rows.length;
  let functionsDone = 0;
  rows.forEach((cat) => {
    knex('categories')
    .where('slug', '=', cat.slug)
    .update({name: cat.name.toLowerCase()})
    .then(() => {
      functionsDone++;
      console.log(functionsDone);
      if (functionsDone >= functionsStarted) {
        console.log("success");
        knex.destroy();
      }
    })
  })
})
