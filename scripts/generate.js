import fs from "fs";
import path from "path";
import admin from "firebase-admin";
import { execSync } from "child_process";

// ==============================
// FIREBASE INIT (GitHub Actions safe)
// ==============================
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ==============================
// OUTPUT ROOT
// ==============================
const OUTPUT_DIR = path.resolve("./post");

// ==============================
// SAFE SLUG FUNCTION
// ==============================
function safeSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==============================
// ENSURE DIRECTORY EXISTS
// ==============================
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ==============================
// HTML TEMPLATE
// ==============================
function createHTML(post) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${post.title}</title>
  <meta name="description" content="${post.description || ""}">

  <style>
    body { font-family: Arial; margin:0; background:#f6f7fb; }
    header { background:#1a73e8; color:white; padding:20px; text-align:center; }
    .container { max-width:800px; margin:auto; background:white; padding:20px; }
    img { width:100%; border-radius:10px; }
    a { color:#1a73e8; }
  </style>
</head>

<body>

<header>
  <h2>OpportunityHub</h2>
</header>

<div class="container">

  <h1>${post.title}</h1>
  <p><b>Category:</b> ${post.category}</p>

  ${post.imageUrl ? `<img src="${post.imageUrl}" />` : ""}

  <div>
    ${post.content || ""}
  </div>

</div>

</body>
</html>
`;
}

// ==============================
// MAIN GENERATOR
// ==============================
async function generate() {
  console.log("🚀 Generating SEO pages...");

  const snapshot = await db.collection("posts").get();

  snapshot.forEach(doc => {
    const post = doc.data();

    if (!post.slug || !post.category) return;

    const category = safeSlug(post.category);
    const slug = safeSlug(post.slug);

    // CATEGORY FOLDER
    const categoryPath = path.join(OUTPUT_DIR, category);
    ensureDir(categoryPath);

    // FULL FILE PATH
    const filePath = path.join(categoryPath, `${slug}.html`);

    // WRITE HTML FILE
    fs.writeFileSync(filePath, createHTML(post));

    console.log("✅ Created:", filePath);
  });

  console.log("✅ HTML generation complete");

  // ==============================
  // RUN SITEMAP GENERATION
  // ==============================
  try {
    console.log("🗺 Generating sitemap...");
    execSync("node scripts/sitemap.js");
    console.log("✅ Sitemap generated");
  } catch (err) {
    console.error("❌ Sitemap error:", err);
  }

  console.log("🎉 BUILD COMPLETE");
}

generate();
