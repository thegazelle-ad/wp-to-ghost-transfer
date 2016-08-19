'use strict';

const ghost = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'gazelle_ghost',
  }
});

const wordpress = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'gazelle_wordpress',
  }
});

function disconnect() {
  wordpress.destroy();
  ghost.destroy();
}

// The categories from the wordpress database lazily hardcoded to avoid a bit of code
let categories = [
  {name: "Uncategorized", slug: "uncategorized"},
  {name: "Features", slug: "features"},
  {name: "News", slug: "news"},
  {name: "Opinion", slug: "opinion"},
  {name: "Creative", slug: "creative"},
  {name: "Video", slug: "video"},
  {name: "Media", slug: "media"},
  {name: "Research", slug: "research"},
  {name: "Advice", slug: "advice"},
]

// Which command do you wish to run?
// make this null every time you leave the document
const choiceFlag = "meta";
if (!choiceFlag) {
  throw new Error("You have to choose which operation you want to do");
}

if (choiceFlag === "cat") {
// Fill categories table
  ghost('categories').insert(categories).then(() => {}).then(() => {
    disconnect();
  });
}

if (choiceFlag === "meta") {
// Fill posts_meta table
  // From ghost/core/server/models/base.js
  function slugify (title) {
    // Remove URL reserved chars: `:/?#[]@!$&'()*+,;=` as well as `\%<>|^~£"`
    let slug = title.replace(/[:\/\?#\[\]@!$&'()*+,;=\\%<>\|\^~£"]/g, '')
                .replace(/(\s|\.)/g, '-')
                .replace(/-+/g, '-')
                .toLowerCase();

    slug = slug.charAt(slug.length - 1) === '-' ? slug.substr(0, slug.length - 1) : slug;
    slug = /^(ghost|ghost\-admin|admin|wp\-admin|wp\-login|dashboard|logout|login|signin|signup|signout|register|archive|archives|category|categories|tag|tags|page|pages|post|posts|user|users|rss)$/g
           .test(slug) ? slug + '-post' : slug;
    return slug;
  }

  const manuallyEditedSlugs = ['iran', 'iran2', 'gabo', 'gabo2', 'welcome-to-ghost'];

  const categorySlugToId = {};
  categories.forEach((val, index) => {
    categorySlugToId[val.slug] = index+1;
  });
  console.log(JSON.stringify(categorySlugToId, null, 4));
  wordpress.select('post_name', 'post_title', 'meta_value')
  .from('wp_posts')
  .leftJoin('wp_postmeta', 'wp_posts.ID', '=', 'wp_postmeta.post_id')
  .whereIn('post_status', ['draft', 'publish']).andWhere('post_type', '=', 'post').andWhere('wp_postmeta.meta_key', '=', 'gazelle_views_count')
  .then((wordpressRowsViews) => {
    wordpress.select('post_name', 'post_title', 'slug')
    .from('wp_posts')
    .leftJoin('wp_term_relationships', 'wp_term_relationships.object_id', '=', 'wp_posts.ID')
    .leftJoin('wp_term_taxonomy', 'wp_term_taxonomy.term_taxonomy_id', '=', 'wp_term_relationships.term_taxonomy_id')
    .leftJoin('wp_terms', 'wp_terms.term_id', '=', 'wp_term_taxonomy.term_id')
    .whereIn('post_status', ['draft', 'publish']).andWhere('post_type', '=', 'post').andWhere('wp_term_taxonomy.taxonomy', '=', 'category')
    .then((wordpressRowsCategory) => {
      ghost.select('id', 'published_at', 'slug')
      .from('posts')
      .whereNotIn('slug', manuallyEditedSlugs)
      .then((ghostRows) => {
        const insertArray = [];
        ghostRows.forEach((ghostRow) => {
          const insertObject = {};
          insertObject.id = ghostRow.id;
          insertObject.description = null;
          insertObject["gazelle_published_at"] = ghostRow["published_at"];

          // adding category
          const categoryRows = wordpressRowsCategory.filter((wordpressRow) => {
            let wordpressSlug = wordpressRow['post_name'] || slugify(wordpressRow['post_title']);
            if (wordpressSlug === ghostRow.slug) {
              return true;
            }
            return false;
          });
          let categoryId;
          if (categoryRows.length === 0) {
            console.log(ghostRow.slug + " had no category");
            categoryId = categorySlugToId["uncategorized"];
          }
          else if (categoryRows.length === 1) {
            if (categorySlugToId[categoryRows[0].slug]) {
              categoryId = categorySlugToId[categoryRows[0].slug];
            }
            else {
              console.log("slug made uncategorized from: " + categoryRows[0].slug);
            }
          }
          else if (categoryRows.length === 2) {
            const filtered = categoryRows.filter((row) => {
              if (row.slug === "uncategorized") {
                return false;
              }
              return true;
            });
            if (filtered.length === 1 && categorySlugToId[filtered[0].slug]) {
              categoryId = categorySlugToId[filtered[0].slug];
            }
            else if (categoryRows[0].slug === categoryRows[1].slug) {
              categoryId = categorySlugToId[categoryRows[0].slug];
            }
            else {
              switch(ghostRow.slug) {
                case "arts-capstones":
                  categoryId = categorySlugToId["creative"];
                  break;
                case "australianz":
                case "film-race":
                case "foreign-correspondent-clare":
                case "student-government-elections-meet-the-candidates":
                  categoryId = categorySlugToId["news"];
                  break;
                case "global-celebrations":
                case "pearl-cultivation-rak":
                  categoryId = categorySlugToId["features"];
                  break;
               case "open-campus":
                  categoryId = categorySlugToId["media"];
                  break;
                default:
                  console.log("2 categories but not as expected");
                  console.log(categoryRows[0].slug, categoryRows[1].slug);
                  console.log(ghostRow.slug);
                  categoryId = categorySlugToId["uncategorized"];
              }
            }
          }
          else {
            console.log("unexpected more than 2 categories for an article")
            categoryId = categorySlugToId["uncategorized"];
          }
          if (!categoryId || categoryId < 1 || categoryId > 9) {
            console.log(categoryId);
          }
          if (!categoryId || !(typeof categoryId) === "number") {
            console.log("one slipped through somehow: " + ghostRow.slug);
            categoryId = categorySlugToId["uncategorized"];
          }
          insertObject["category_id"] = categoryId;

          // Adding views
          const viewRows = wordpressRowsViews.filter((wordpressRow) => {
            let wordpressSlug = wordpressRow['post_name'] || slugify(wordpressRow['post_title']);
            if (wordpressSlug === ghostRow.slug) {
              return true;
            }
            return false;
          });
          let views;
          if (viewRows.length === 0) {
            views = 0;
          }
          else if (viewRows.length === 1) {
            views = viewRows[0]["meta_value"]
          }
          else {
            console.log(ghostRow.slug, "had more than 1 view data");
            views = 0;
          }
          insertObject["views"] = views;

          // push object to array
          insertArray.push(insertObject);
        });
        ghost('posts_meta').insert(insertArray).then(() => {}).then(() => {
          disconnect();
          console.log("success");
        }).catch((err) => {
          disconnect();
          console.error(err);
        })
      });
    });
  });
}
