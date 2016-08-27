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

const _ = require('lodash');

function disconnect() {
  wordpress.destroy();
  ghost.destroy();
}

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


// The categories from the wordpress database lazily hardcoded to avoid a bit of code
// Taken by a distinct select of inner join on categories of each post
let categories = [
  {name: "Uncategorized", slug: "uncategorized"},
  {name: "Features", slug: "features"},
  {name: "News", slug: "news"},
  {name: "Opinion", slug: "opinion"},
  {name: "Creative", slug: "creative"},
  {name: "Video", slug: "video"},
  {name: "Media", slug: "media"},
  {name: "Research", slug: "research"},
]

// The available functions are:
// categories
// post_meta
// issues
// authors_posts
// authors

// We will let teams table start out empty and editor's can handle it themselves

export function categories() {
// Fill categories table
  ghost('categories').insert(categories).then(() => {}).then(() => {
    disconnect();
  });
}

export function post_meta() {
// Fill posts_meta table
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
      ghost.select('id', 'published_at', 'slug', 'status')
      .from('posts')
      .whereNotIn('slug', manuallyEditedSlugs)
      .then((ghostRows) => {
        const insertArray = [];
        ghostRows.forEach((ghostRow) => {
          const insertObject = {};
          insertObject.id = ghostRow.id;
          insertObject.description = null;
          if (ghostRow.status === "published") {
            insertObject["gazelle_published_at"] = ghostRow["published_at"];
          }
          else if (ghostRow.status === "draft") {
            insertObject["gazelle_published_at"] = null;
          }
          else {
            console.log("unexpected publish date event");
            insertObject["gazelle_published_at"] = null;
          }

          // adding category
          const categoryRows = wordpressRowsCategory.filter((wordpressRow) => {
            let wordpressSlug = wordpressRow.post_name || slugify(wordpressRow.post_title);
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
                  categoryId = categorySlugToId["video"];
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
            let wordpressSlug = wordpressRow.post_name || slugify(wordpressRow.post_title);
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
        // Hardcode a few special values
        insertArray.push(
          {
            id: 699,
            description: null,
            "gazelle_published_at": "2015-04-04 14:02:08",
            "category_id": categorySlugToId.news,
            views: 0,
          },
          {
            id: 697,
            description: null,
            "gazelle_published_at": "2015-04-11 12:41:31",
            "category_id": categorySlugToId.features,
            views: 0,
          },
          {
            id: 549,
            description: null,
            "gazelle_published_at": "2015-05-02 13:10:05",
            "category_id": categorySlugToId.news,
            views: 0,
          },
          {
            id: 548,
            description: null,
            "gazelle_published_at": "2015-05-09 14:00:48",
            "category_id": categorySlugToId.features,
            views: 0,
          },
          {
            // The Welcome-To-Ghost post
            id: 1,
            description: null,
            "gazelle_published_at": null,
            "category_id": categorySlugToId.uncategorized,
            views: 0,
          }
        );
        ghost('posts_meta').insert(insertArray).then(() => {
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


export function authors() {
// Insert authors table
  wordpress.distinct().select('name', 'slug')
  .from('wp_posts')
  .innerJoin('wp_term_relationships', 'wp_term_relationships.object_id', '=', 'wp_posts.ID')
  .innerJoin('wp_term_taxonomy', 'wp_term_taxonomy.term_taxonomy_id', '=', 'wp_term_relationships.term_taxonomy_id')
  .innerJoin('wp_terms', 'wp_terms.term_id', '=', 'wp_term_taxonomy.term_id')
  .whereIn('post_status', ['draft', 'publish']).andWhere('post_type', '=', 'post').andWhere('wp_term_taxonomy.taxonomy', '=', 'author')
  .then((authorRows) => {
    authorRows.map((row) => {
      if (row.slug.substring(0, 4) === "cap-") {
        row.slug = row.slug.substring(4, row.slug.length)
      }
      return row;
    })
    console.log("Filtered authors:")
    authorRows = authorRows.filter((row) => {
      if (row.slug.search(/\d/) !== -1 || row.name.search(/\d/) !== -1) {
        console.log("Slug:", row.slug, "Name:", row.name);
        return false;
      }
      return true;
    });
    // Other than name and slug will simply be nulled as we don't have the other information in database
    // ghost('authors')
    // .insert(authorRows)
    // .then(disconnect);
  })
}

export function issues() {
// Insert issues table
  wordpress.distinct().select('name', 'slug')
  .from('wp_posts')
  .innerJoin('wp_term_relationships', 'wp_term_relationships.object_id', '=', 'wp_posts.ID')
  .innerJoin('wp_term_taxonomy', 'wp_term_taxonomy.term_taxonomy_id', '=', 'wp_term_relationships.term_taxonomy_id')
  .innerJoin('wp_terms', 'wp_terms.term_id', '=', 'wp_term_taxonomy.term_id')
  .whereIn('post_status', ['draft', 'publish']).andWhere('post_type', '=', 'post').andWhere('wp_term_taxonomy.taxonomy', '=', 'issue')
  .then((issues) => {
    wordpress.distinct().select('name', 'slug', 'post_date', 'post_date_gmt')
    .from('wp_posts')
    .innerJoin('wp_term_relationships', 'wp_term_relationships.object_id', '=', 'wp_posts.ID')
    .innerJoin('wp_term_taxonomy', 'wp_term_taxonomy.term_taxonomy_id', '=', 'wp_term_relationships.term_taxonomy_id')
    .innerJoin('wp_terms', 'wp_terms.term_id', '=', 'wp_term_taxonomy.term_id')
    .whereIn('post_status', ['draft', 'publish']).andWhere('post_type', '=', 'post').andWhere('wp_term_taxonomy.taxonomy', '=', 'issue')
    .then((wordpressDataRows) => {
      const insertArray = issues.map((issue, index) => {
        const posts = wordpressDataRows.filter((dataRow) => {
          if (issue.name === dataRow.name && issue.slug === dataRow.slug) {
            return true;
          }
          return false;
        });
        const dateCount = {};
        posts.forEach((post) => {
          let date = new Date(post["post_date_gmt"]);
          if (!date.getTime()) {
            date = new Date(post["post_date"])
          }
          let dateString = date.getFullYear().toString();
          let month = date.getMonth()+1;
          if (month < 10) {
            dateString += "-0" + month.toString();
          }
          else {
            dateString += "-" + month.toString();
          }
          let day = date.getDate();
          if (day < 10) {
            dateString += "-0" + day.toString();
          }
          else {
            dateString += "-" + day.toString();
          }
          if (dateCount.hasOwnProperty(dateString)) {
            dateCount[dateString]++;
          }
          else {
            dateCount[dateString] = 1;
          }
        });
        let publishDate;
        let maxCount = -1;
        _.forEach(dateCount, (val, key) => {
          if (val > maxCount) {
            publishDate = key;
            maxCount = val;
          }
        });
        if (maxCount === -1) {
          throw new Error("There were no posts in the issue: " + issue.name);
        }
        let name = issue.name;
        let slug = slugify(issue.name);
        // Assuming the issues are fetched chronologically by the select statement
        // Because this is also what it seemed like.
        // Remember to also double check that everything is correct in the database though.
        let order = index+1;
        return {
          name: name,
          slug: slug,
          "issue_order": order,
          "published_at": publishDate,
        };
      });
      ghost('issues').insert(insertArray)
      .then(disconnect);
    });
  });
}

export function authors_posts() {
// Insert authors_posts table
  function normalizeAuthor(slug) {
    if (slug.substring(0, 4) === "cap-") {
      slug = slug.substring(4, slug.length)
    }

    // Got this from logging the filtered authors
    if (slug === "amanda-randone2") {
      slug = "amanda-randone";
    }
    if (slug === "kate-melville-rea-2") {
      slug = "kate-melville-rea";
    }
    return slug;
  }

  wordpress.select('slug', 'post_name', 'post_title', 'post_content')
  .from('wp_posts')
  .innerJoin('wp_term_relationships', 'wp_term_relationships.object_id', '=', 'wp_posts.ID')
  .innerJoin('wp_term_taxonomy', 'wp_term_taxonomy.term_taxonomy_id', '=', 'wp_term_relationships.term_taxonomy_id')
  .innerJoin('wp_terms', 'wp_terms.term_id', '=', 'wp_term_taxonomy.term_id')
  .whereIn('post_status', ['draft', 'publish']).andWhere('post_type', '=', 'post').andWhere('wp_term_taxonomy.taxonomy', '=', 'author')
  .then((wordpressPosts) => {
    ghost.select('id', 'slug')
    .from('posts')
    .then((ghostPosts) => {
      ghost.select('id', 'slug')
      .from('authors')
      .then((ghostAuthors) => {
        wordpressPosts = wordpressPosts.filter((post) => {
          if (!post.post_name && !post.post_title) {
            return false;
          }
          if (!post.post_content) {
            return false;
          }
          return true;
        });

        let insertArray = wordpressPosts.map((wpPost) => {
          let wordpressPostSlug = wpPost.post_name || slugify(wpPost.post_title);
          let wordpressAuthorSlug = normalizeAuthor(wpPost.slug);
          let ghostPostId = ghostPosts.find((post) => {
            return wordpressPostSlug === post.slug;
          });
          if (ghostPostId === undefined) {
            console.log("post");
            console.log(wordpressPostSlug, "is undefined");
          }
          else {
            ghostPostId = ghostPostId.id;
          }
          let ghostAuthorId = ghostAuthors.find((author) => {
            return wordpressAuthorSlug === author.slug;
          });
          if (ghostAuthorId === undefined) {
            console.log("author");
            console.log(wordpressAuthorSlug, "is undefined");
          }
          else {
            ghostAuthorId = ghostAuthorId.id;
          }
          return {
            author_id: ghostAuthorId,
            post_id: ghostPostId,
          };
        });
        ghost('authors_posts').insert(insertArray)
        .then(() => {
          console.log("success");
        })
        .then(disconnect());
      });
    });
  });
}
