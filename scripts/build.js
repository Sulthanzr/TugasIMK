#!/usr/bin/env node
/*
 * Builder sederhana tanpa dependensi npm.
 * Urutan partial HTML dan file JS sengaja dipertahankan agar seluruh id,
 * event, dan logika aplikasi asli tetap berjalan.
 * Jalankan: node scripts/build.js
 */
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

const htmlParts = [
  "html/shared/00-head.html",
  "html/01-login.html",
  "html/shared/01-welcome.html",
  "html/shared/02-header.html",
  "html/02-dashboard.html",
  "html/03-players.html",
  "html/04-generator.html",
  "html/05-sessions.html",
  "html/06-payment.html",
  "html/shared/03-footer-and-modals.html",
  "html/shared/04-close.html"
];
const scripts = [
  "js/core/state.js",
  "js/core/helpers.js",
  "js/core/navigation.js",
  "js/core/generator-settings.js",
  "js/core/counters.js",
  "js/views/dashboard.js",
  "js/views/players.js",
  "js/views/generator.js",
  "js/views/sessions.js",
  "js/views/payment.js",
  "js/core/render-all.js",
  "js/events/00-load-state.js",
  "js/events/01-login.js",
  "js/events/02-navigation.js",
  "js/events/03-dashboard.js",
  "js/events/04-players.js",
  "js/events/05-generator.js",
  "js/events/06-sessions.js",
  "js/events/07-payment.js",
  "js/events/08-clock-and-courts.js",
  "js/events/09-initial-render.js"
];

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const markup = htmlParts.slice(0, -1).map(read).join("");
const scriptTags = scripts.map((file) => `  <script src="${file}"></script>\n`).join("");
const output = markup + scriptTags + read(htmlParts.at(-1));
fs.writeFileSync(path.join(root, "index.html"), output, "utf8");
console.log(`Selesai: index.html dirakit dari 6 layout, ${htmlParts.length - 6} komponen bersama, dan ${scripts.length} file JS.`);
