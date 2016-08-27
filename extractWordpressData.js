/* TODO:
What we need for a ghost import is:
ID,
title,
slug,
markdown,
html,
status: published,
published_at,
rest null
*/

/* Following functions are all borrowed from the wp2ghost repo at URL:
https://github.com/jonhoo/wp2ghost
MIT License
Copyright (c) 2014 Jon Gjengset
*/
var treatToMarkdown = function(html) {
  html = html.replace(/\r\n/g, "\n");
  html = html.replace(/\r/g, "\n");
  html = html.replace(/\[((source)?code)[^\]]*\]\n*([\s\S]*?)\n*\[\/\1\]/g, '<pre><code>$3</code></pre>');
  html = html.replace(/\[caption.+\](.+)\[\/caption\]/g, '$1');
  return html;
}

var treatToHtml = function(html) {
  html = treatToMarkdown(html);
  html = html.replace(/\n\n/g, '<p>');
  html = html.replace(/<pre>(.*?)<\/pre>/g, function(match) { return match.replace(/<p>/g, "\n\n"); });
  html = html.replace(/<p><pre>/g, "<pre>");
  return html;
}

// From ghost/core/server/models/base.js
var slugify = function(title) {
  // Remove URL reserved chars: `:/?#[]@!$&'()*+,;=` as well as `\%<>|^~£"`
  slug = title.replace(/[:\/\?#\[\]@!$&'()*+,;=\\%<>\|\^~£"]/g, '')
              .replace(/(\s|\.)/g, '-')
              .replace(/-+/g, '-')
              .toLowerCase();

  slug = slug.charAt(slug.length - 1) === '-' ? slug.substr(0, slug.length - 1) : slug;
  slug = /^(ghost|ghost\-admin|admin|wp\-admin|wp\-login|dashboard|logout|login|signin|signup|signout|register|archive|archives|category|categories|tag|tags|page|pages|post|posts|user|users|rss)$/g
         .test(slug) ? slug + '-post' : slug;
  return slug;
}
// Borrowed functions end here





// file system
var fs = require('fs');
var _ = require('lodash');

// Database variables

var DATABASE_HOST = "localhost";
var DATABASE_USER_NAME = "root";
var DATABASE_PASSWORD = "password";
var WORDPRESS_DATABASE_NAME = "gazelle_wordpress";
var GHOST_DATABASE_NAME = "gazelle_ghost";

// Wordpress boilerplate

var wordpressQueryBuilder = require('knex')({
  // Using MariaDB
  client: 'mysql',
  connection: {
    host: DATABASE_HOST,
    user: DATABASE_USER_NAME,
    password: DATABASE_PASSWORD,
    database: WORDPRESS_DATABASE_NAME
  }
});

var wp_terms = 'wp_terms';
var wp_title = 'post_title';
var wp_name = 'name'
var wp_taxonomy = 'wp_term_taxonomy';
var wp_termId = 'term_id';
var wp_taxonomyId = 'term_taxonomy_id';
var wp_relationships = 'wp_term_relationships';
var wp_posts = 'wp_posts';
var wp_objectId = 'object_id';
var wp_postId = "ID";
var taxonomy = 'taxonomy';

function postToWordpressTermQuery(queryTerm) {
  return wordpressQueryBuilder
    .select(wp_title, wp_name)
    .from(wp_terms)
      .innerJoin(wp_taxonomy, (wp_terms+'.'+wp_termId), '=', (wp_taxonomy+'.'+wp_taxonomyId))
      .innerJoin(wp_relationships, (wp_terms+'.'+wp_termId), '=', (wp_relationships+'.'+wp_taxonomyId))
      .innerJoin(wp_posts, (wp_posts+'.'+wp_postId), '=', (wp_relationships+'.'+wp_objectId))
    .where((wp_taxonomy+'.'+taxonomy), '=', queryTerm)
}

function disconnectWordpress() {
  wordpressQueryBuilder.destroy();
}

// Ghost boilerplate

var ghostQueryBuilder = require('knex')({
  // Using MariaDB
  client: 'mysql',
  connection: {
    host: DATABASE_HOST,
    user: DATABASE_USER_NAME,
    password: DATABASE_PASSWORD,
    database: GHOST_DATABASE_NAME
  }
});

function disconnectGhost() {
  ghostQueryBuilder.destroy();
}

// data export code
function getWpTerm(termSlug, fileName) {
  // Count how many functions have to finish
  functionCount++;

  wordpressQueryBuilder
  .distinct().select('slug')
  .from(wp_terms)
    .innerJoin(wp_taxonomy, wp_terms+'.'+wp_termId, '=', wp_taxonomy+'.'+wp_taxonomyId)
  .where(wp_taxonomy+'.'+taxonomy, '=', termSlug)
  .then((rows) => {
    var slugs = rows.map((row) => {
      return row.slug;
    })
    wordpressQueryBuilder
    .select('name', 'slug')
    .from(wp_terms)
      .innerJoin(wp_taxonomy, wp_terms+'.'+wp_termId, '=', wp_taxonomy+'.'+wp_taxonomyId)
    .whereIn('slug', slugs).andWhere(wp_taxonomy+'.'+taxonomy, '=', termSlug)
    .then((rows) => {
      fs.writeFileSync('jsonData/' + fileName + '.json', JSON.stringify(rows, null, 4));
      disconnectIfDone();
    });
  });
}

function disconnectIfDone() {
  cnt++;
  if (cnt >= functionCount) {
    disconnectWordpress();
    disconnectGhost();
  }
}
/*
// counts how many queries are done
var functionCount = 0;
var cnt = 0;
// export actually happens here
getWpTerm('category', 'categories');

getWpTerm('author', 'authors');

getWpTerm('issue', 'issues');

getWpTerm('nav_menu', 'nav_menues');

getWpTerm('post_format', 'post_formats');

getWpTerm('post_tag', 'post_tags');

var gazelle_post_data = [];
functionCount++;
ghostQueryBuilder
.select('slug', 'id')
.from('posts')
.then((rows) => {
  postToWordpressTermQuery
})

*/

// wordpressQueryBuilder
// .select('ID', 'post_title', 'post_name', 'post_date_gmt', 'post_date', 'post_status', 'post_content')
// .from('wp_posts')
// .whereIn('post_status', ['draft', 'publish']).andWhere('post_type', '=', 'post').then((rows) => {
//   var posts = rows.map((row) => {
//     var date = new Date(row["post_date_gmt"]);
//     if (!date.getTime()) {
//       date = new Date(row["post_date"]);
//     }
//     var status = row["post_status"];
//     if (status === "publish") {
//       status = "published";
//     }
//     var post = {
//       id: row.ID,
//       title: row["post_title"],
//       slug: row["post_name"] || slugify(row["post_title"]),
//       markdown: treatToMarkdown(row["post_content"]),
//       html: treatToHtml(row["post_content"]),
//       image: null,
//       featured: 0,
//       page: 0,
//       status: status,
//       language: "en_US",
//       visibility: "public",
//       "meta_title": null,
//       "meta_description": null,
//       "author_id": 1,
//       "created_at": date.getTime(),
//       "created_by": 1,
//       "updated_at": date.getTime(),
//       "updated_by": 1,
//       "published_at": date.getTime(),
//       "published_by": 1,
//     };
//     return post;
//   });
//   var jsonOut = {
//     meta: {
//       "exported_on": Date.now(),
//       "version": "004",
//     },
//     data: {
//       posts: cleanUp(posts),
//     },
//   };
//   fs.writeFileSync('jsonData/posts.json', JSON.stringify(jsonOut, null, 4));
//   disconnectGhost();
//   disconnectWordpress();
// })

// function cleanUp(posts) {
//   return posts.filter((post) => {
//     if (!post.title && !post.slug) {
//       return false;
//     }
//     if (!post.html && !post.markdown) {
//       return false;
//     }
//     _.forEach(post, (value) => {
//       if (!value && value !== null && value !== 0) {
//         console.log(post);
//         throw new Error("missing value");
//       }
//     });
//     return true;
//   })
// }
