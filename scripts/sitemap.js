import fs from "fs";
import admin from "firebase-admin";

// ==============================
// FIREBASE INIT
// ==============================
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ==============================
// BASE URL (CHANGE THIS LATER)
// ==============================
const BASE_URL = "https://yourdomain.com";

// ==============================
// STATIC PAGES (IMPORTANT SEO PAGES)
// ==============================
const staticPages = [
  "/",
  "/post/scholarships/",
  "/post/remote-jobs/",
  "/post/nigeria-opportunities/",
  "/post/side-hustles/"
];

// ==============================
// FETCH POSTS
// ==============================
async function getPosts() {
  const snapshot = await db.collection("posts").get();

  const posts = [];

  snapshot.forEach(doc => {
    const post = doc.data();

    if (post.slug && post.category) {
      posts.push({
        slug: post.slug,
        category: post.category
      });
    }
  });

  return posts;
}

// ==============================
// GENERATE SITEMAP XML
// ==============================
function generateSitemap(posts) {
  let urls = "";

  // STATIC PAGES
  staticPages.forEach(page => {
    urls += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // DYNAMIC POSTS
  posts.forEach(post => {
    const url = `/post/${post.category}/${post.slug}.html`;

    urls += `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ==============================
// WRITE FILE
// ==============================
async function buildSitemap() {
  console.log("Generating sitemap...");

  const posts = await getPosts();

  const sitemap = generateSitemap(posts);

  fs.writeFileSync("./sitemap.xml", sitemap);

  console.log("✅ sitemap.xml generated successfully");
}

buildSitemap();
