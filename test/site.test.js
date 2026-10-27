// Run: node --test test/
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const html = read("index.html");

test("core content and SEO basics", () => {
  assert.match(html, /<title>SL Secure[^<]+<\/title>/);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1/);
  assert.match(html, /name="description"/);
  assert.match(html, /property="og:image" content="assets\/img\/og-image\.jpg"/);
  assert.match(html, /Security cameras, access control &amp; cabling/);
  for (const id of ["services", "how", "who", "gallery", "faq", "contact", "quote"]) assert.match(html, new RegExp(`id="${id}"`));
  for (const s of ["Security cameras", "Access control", "Alarm systems", "Structured cabling", "Wi-Fi", "VoIP", "AV", "Smart home"]) assert.ok(html.includes(s), s);
});

test("all local asset references exist and paths are relative", () => {
  const refs = [...html.matchAll(/(?:src|href|srcset)="([^"#]+)"/g)].map((m) => m[1])
    .filter((u) => !/^(https?:|mailto:|tel:|sms:|\.\/$)/.test(u));
  assert.ok(refs.length > 5);
  for (const r of refs) {
    assert.ok(!r.startsWith("/"), "absolute path: " + r);
    assert.ok(fs.existsSync(path.join(root, r)), "missing: " + r);
  }
});

test("no invented facts or broken placeholders in the page", () => {
  assert.doesNotMatch(html, /TODO|placeholder text|lorem|ipsum|\{\{|undefined|555-/i);
  assert.doesNotMatch(html, /years of experience|5 stars|★|testimonial|licensed and insured/i);
});

test("placeholders live only in site.config.js and are hidden until filled", () => {
  const cfg = read("site.config.js");
  for (const k of ["phone", "sms", "email", "serviceArea", "license", "logo", "photos"]) assert.match(cfg, new RegExp(k + ":"));
  const js = read("script.js");
  assert.match(js, /\/\^TODO\/i/);
  assert.match(js, /application\/ld\+json/);
  assert.match(js, /LocalBusiness/);
  assert.doesNotMatch(js + html, /google-analytics|gtag\(|fbq\(|fetch\(|XMLHttpRequest/);
});

test("no WhatsApp anywhere; call, text and email present", () => {
  const all = html + read("script.js") + read("site.config.js");
  assert.doesNotMatch(all, /whatsapp|wa\.me/i);
  assert.match(html, /href="tel:\+13477657940"/);
  assert.match(html, /href="sms:\+13477657940"/);
  assert.match(html, /slsecureinc@gmail\.com/);
});

test("images are small", () => {
  const dir = path.join(root, "assets/img");
  for (const f of fs.readdirSync(dir)) {
    if (/\.(jpe?g|webp)$/.test(f)) assert.ok(fs.statSync(path.join(dir, f)).size < 200 * 1024, f + " too big");
  }
});
