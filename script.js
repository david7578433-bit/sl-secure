(function () {
  "use strict";
  var S = window.SITE || {};
  var isSet = function (v) { return typeof v === "string" && v.trim() !== "" && !/^TODO/i.test(v.trim()); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var e164 = function (v) { var d = String(v || "").replace(/\D/g, ""); if (/^\+/.test(String(v).trim())) return "+" + d; if (d.length === 10) return "+1" + d; return d.length === 11 && d[0] === "1" ? "+" + d : d; };
  var telHref = isSet(S.phone) ? "tel:" + e164(S.phone) : null;
  var smsNum = isSet(S.sms) ? e164(S.sms) : (isSet(S.phone) ? e164(S.phone) : null);
  // "?&body=" works on both iPhone and Android.
  var smsHref = function (text) { return "sms:" + smsNum + (text ? "?&body=" + encodeURIComponent(text) : ""); };
  var email = isSet(S.email) ? S.email.trim() : null;
  var hello = "Hi SL Secure, I'd like to ask about a free site survey.";

  // Call / Text buttons: real links when filled in, otherwise they scroll to the form.
  $$("[data-tel]").forEach(function (a) { if (telHref) a.href = telHref; });
  $$("[data-sms]").forEach(function (a) { if (smsNum) a.href = smsHref(hello); });
  $$("[data-phone-text],[data-phone-label]").forEach(function (el) { if (isSet(S.phone)) el.textContent = S.phone; });
  $$("[data-legal]").forEach(function (el) { if (isSet(S.legalName)) el.textContent = S.legalName; });
  if (!isSet(S.phone)) $$("[data-tel]").forEach(function (a) { a.setAttribute("href", "#contact"); });
  if (!smsNum) $$("[data-sms]").forEach(function (a) { a.setAttribute("href", "#contact"); });

  var show = function (key, val, fn) {
    if (!isSet(val)) { $$("[data-" + key + "-wrap]").forEach(function (w) { w.hidden = true; }); return; }
    $$("[data-" + key + "-wrap]").forEach(function (w) { w.hidden = false; });
    $$("[data-" + key + "]").forEach(fn || function (el) { el.textContent = val; });
  };
  show("area", S.serviceArea);
  show("hours", S.hours);
  show("license", S.license);
  show("email", email, function (a) { a.textContent = email; a.href = "mailto:" + email; });

  if (isSet(S.logo)) $$("[data-logo]").forEach(function (img) { img.src = S.logo; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Gallery from config
  var photos = Array.isArray(S.photos) ? S.photos.filter(function (p) { return p && isSet(p.src); }) : [];
  if (photos.length) {
    var g = document.querySelector("[data-gallery]");
    g.innerHTML = "";
    photos.forEach(function (p) {
      var li = document.createElement("li");
      var fig = document.createElement("figure"); fig.className = "gal-item";
      var img = document.createElement("img"); img.src = p.src; img.alt = p.caption || "SL Secure project"; img.loading = "lazy";
      fig.appendChild(img);
      if (p.caption) { var c = document.createElement("figcaption"); c.textContent = p.caption; fig.appendChild(c); }
      li.appendChild(fig); g.appendChild(li);
    });
    var note = document.querySelector("[data-gallery-note]"); if (note) note.hidden = true;
  }

  // LocalBusiness structured data, built from the config (only filled-in fields are included).
  var ld = {
    "@context": "https://schema.org", "@type": "LocalBusiness", "@id": "#business",
    name: S.name || "SL Secure",
    legalName: isSet(S.legalName) ? S.legalName : undefined,
    description: "Low-voltage contractor: security cameras, access control and intercoms, alarm systems, structured cabling, Wi-Fi and networking, phone systems, AV and smart home.",
    image: "assets/img/og-image.jpg",
    makesOffer: ["Security cameras / CCTV", "Access control & intercoms", "Alarm systems", "Structured cabling", "Wi-Fi & networking", "Phone systems / VoIP", "TV, AV & sound", "Smart home"]
      .map(function (n) { return { "@type": "Offer", itemOffered: { "@type": "Service", name: n } }; })
  };
  if (isSet(S.siteUrl)) { ld.url = S.siteUrl; ld.image = S.siteUrl.replace(/\/?$/, "/") + "assets/img/og-image.jpg"; }
  if (isSet(S.phone)) ld.telephone = S.phone;
  if (email) ld.email = email;
  var areas = (Array.isArray(S.areaServed) ? S.areaServed : []).filter(isSet);
  if (areas.length) ld.areaServed = areas;
  else if (isSet(S.serviceArea)) ld.areaServed = S.serviceArea;
  if (isSet(S.license)) ld.identifier = S.license;
  var A = S.address || {};
  if (isSet(A.city)) {
    ld.address = { "@type": "PostalAddress", streetAddress: isSet(A.street) ? A.street : undefined, addressLocality: A.city,
      addressRegion: isSet(A.region) ? A.region : undefined, postalCode: isSet(A.postalCode) ? A.postalCode : undefined, addressCountry: A.country || "US" };
  }
  var s = document.getElementById("ld-business");
  if (!s) { s = document.createElement("script"); s.type = "application/ld+json"; s.id = "ld-business"; document.head.appendChild(s); }
  s.textContent = JSON.stringify(ld);

  // Quote form → pre-filled text message (SMS) or email. Nothing is sent to any server.
  var form = document.getElementById("quote");
  if (form) {
    var err = form.querySelector(".form-err");
    var lastBtn = "sms";
    $$("[data-send]").forEach(function (b) { b.addEventListener("click", function () { lastBtn = b.getAttribute("data-send"); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      if (!name || !phone) { err.hidden = false; (name ? f.phone : f.name).focus(); return; }
      err.hidden = true;
      var svcs = $$("#quote input[name=services]:checked").map(function (i) { return i.value; });
      var lines = ["Quote request — SL Secure", "", "Name: " + name, "Phone: " + phone];
      if (f.location.value.trim()) lines.push("Location: " + f.location.value.trim());
      if (f.property.value) lines.push("Property: " + f.property.value);
      if (svcs.length) lines.push("Interested in: " + svcs.join(", "));
      if (f.details.value.trim()) lines.push("", f.details.value.trim());
      var body = lines.join("\n");
      var via = (e.submitter && e.submitter.getAttribute("data-send")) || lastBtn;
      var url;
      if (via === "email") {
        url = "mailto:" + (email || "") + "?subject=" + encodeURIComponent("Quote request — " + name) + "&body=" + encodeURIComponent(body);
        window.location.href = url;
      } else {
        url = smsHref(body);
        window.location.href = url;
      }
      form.setAttribute("data-last-url", url);
    });
  }

  if (window.console && console.info) {
    var todo = [];
    ["phone", "email", "serviceArea", "license", "hours", "siteUrl"].forEach(function (k) { if (!isSet(S[k])) todo.push(k); });
    if (todo.length) console.info("SL Secure: fill in site.config.js →", todo.join(", "));
  }
})();
