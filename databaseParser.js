var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gazelle_old"
});

con.connect(function(err){
  if (err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

// Gets the category of each post
// Spaces are provided to the query since nothing but the first line starts at the beginning
let query = "\
SELECT post_title, name\
  FROM wp_terms AS terms\
       INNER JOIN wp_term_taxonomy AS tax\
       ON terms.term_id = tax.term_taxonomy_id\
       \
       INNER JOIN wp_term_relationships AS rel\
       ON terms.term_id = rel.term_taxonomy_id\
       \
       INNER JOIN wp_posts AS posts\
       ON posts.ID = rel.object_id\
 WHERE tax.taxonomy = 'category'";

con.query(query, (err, rows) => {
	if (err) {
		throw err;
	}
	console.log("categories");
	console.log(rows.slice(0, 4));
});

// Gets the author of each post
query = "\
SELECT post_title, name\
  FROM wp_terms AS terms\
       INNER JOIN wp_term_taxonomy AS tax\
       ON terms.term_id = tax.term_taxonomy_id\
       \
       INNER JOIN wp_term_relationships AS rel\
       ON terms.term_id = rel.term_taxonomy_id\
       \
       INNER JOIN wp_posts AS posts\
       ON posts.ID = rel.object_id\
 WHERE tax.taxonomy= 'author'";

con.query(query, (err, rows) => {
	if (err) {
		throw err;
	}
	console.log("authors");
	console.log(rows.slice(0, 4));
});

// Gets the issues of each post
query = "\
SELECT post_title, name\
  FROM wp_terms AS terms\
       INNER JOIN wp_term_taxonomy AS tax\
       ON terms.term_id = tax.term_taxonomy_id\
       \
       INNER JOIN wp_term_relationships AS rel\
       ON terms.term_id = rel.term_taxonomy_id\
       \
       INNER JOIN wp_posts AS posts\
       ON posts.ID = rel.object_id\
 WHERE tax.taxonomy= 'issue'";

con.query(query, (err, rows) => {
	if (err) {
		throw err;
	}
	console.log("issues");
	console.log(rows.slice(0, 4));
});

// nav_menu
query = "\
SELECT post_title, name\
  FROM wp_terms AS terms\
       INNER JOIN wp_term_taxonomy AS tax\
       ON terms.term_id = tax.term_taxonomy_id\
       \
       INNER JOIN wp_term_relationships AS rel\
       ON terms.term_id = rel.term_taxonomy_id\
       \
       INNER JOIN wp_posts AS posts\
       ON posts.ID = rel.object_id\
 WHERE tax.taxonomy= 'nav_menu'";

con.query(query, (err, rows) => {
	if (err) {
		throw err;
	}
	console.log("nav_menu");
	console.log(rows.slice(0, 4));
});

// post_format
query = "\
SELECT post_title, name\
  FROM wp_terms AS terms\
       INNER JOIN wp_term_taxonomy AS tax\
       ON terms.term_id = tax.term_taxonomy_id\
       \
       INNER JOIN wp_term_relationships AS rel\
       ON terms.term_id = rel.term_taxonomy_id\
       \
       INNER JOIN wp_posts AS posts\
       ON posts.ID = rel.object_id\
 WHERE tax.taxonomy= 'post_format'";

con.query(query, (err, rows) => {
	if (err) {
		throw err;
	}
	console.log("post_format");
	console.log(rows.slice(0, 4));
});

// post_tag
query = "\
SELECT post_title, name\
  FROM wp_terms AS terms\
       INNER JOIN wp_term_taxonomy AS tax\
       ON terms.term_id = tax.term_taxonomy_id\
       \
       INNER JOIN wp_term_relationships AS rel\
       ON terms.term_id = rel.term_taxonomy_id\
       \
       INNER JOIN wp_posts AS posts\
       ON posts.ID = rel.object_id\
 WHERE tax.taxonomy= 'post_tag'";

con.query(query, (err, rows) => {
	if (err) {
		throw err;
	}
	console.log("post_tag");
	console.log(rows.slice(0, 4));
});

con.end(function(err) {
	if (err) {
		console.log("error disconnecting from db");
		throw err;
	}
	console.log("disconnected correctly");
});