/*
 * Shared page logic: header, footer, language toggle, calendar, photos, animations.
 * Content lives in data/site.js, data/schedule.js and data/photos.js — edit those instead.
 *
 * Language: English is the default. Static page text is written twice in the HTML
 * (<span class="en"> / <span class="zh">) and CSS shows one; dynamic text uses I18N below.
 */
(function () {
  "use strict";

  var SITE = window.SITE;
  var SCHEDULE = window.SCHEDULE || { weekly: [], events: [] };
  var PHOTOS = window.PHOTOS || [];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY_NAMES = {
    zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  var I18N = {
    en: {
      navHome: "Home",
      navAbout: "About",
      navCalendar: "Calendar",
      navPhotos: "Photos",
      navRegions: "Regions",
      navContact: "Contact",
      langBtn: "中文",
      viewRegion: "See meetings →",
      timesSoon: "Times coming soon",
      prevWeek: "‹ Prev",
      thisWeek: "This week",
      nextWeek: "Next ›",
      all: "All",
      allRegions: "All Bay Area",
      addCal: "+ Google Calendar",
      noEvents: "No special events right now — check back soon!",
      weeklyEmpty: "Meeting times coming soon. Want to join? Contact us below and we'll get back to you!",
      contactBtn: "Contact form",
      backHome: "‹ Back to home",
      photoSoon: "Photo coming soon",
      special: "Special",
      footerAbout: "A young, joyful family of Christians across the San Francisco Bay Area.",
      footerExplore: "Explore",
      footerRegions: "Regions",
      footerTax: "We are a registered 501(c)(3) non-profit, tax ID",
      footerDonate: "To donate, Zelle to",
      verse: "“For where two or three are gathered together in my name, there am I in the midst of them.” — Matthew 18:20",
    },
    zh: {
      navHome: "主页",
      navAbout: "关于我们",
      navCalendar: "日历",
      navPhotos: "照片",
      navRegions: "各区",
      navContact: "联系我们",
      langBtn: "EN",
      viewRegion: "查看聚会 →",
      timesSoon: "时间待更新",
      prevWeek: "‹ 上一周",
      thisWeek: "本周",
      nextWeek: "下一周 ›",
      all: "全部",
      allRegions: "全湾区",
      addCal: "+ 加入 Google 日历",
      noEvents: "目前没有特别聚会，请留意更新！",
      weeklyEmpty: "聚会时间待更新。想参加的话，请通过下面的“联系我们”告诉我们，我们会尽快回复你！",
      contactBtn: "填写联系表格",
      backHome: "‹ 返回主页",
      photoSoon: "照片即将上传",
      special: "特别",
      footerAbout: "旧金山湾区一群年轻、喜乐的基督徒，像一个大家庭。",
      footerExplore: "浏览",
      footerRegions: "各区",
      footerTax: "我们是注册的 501(c)(3) 非营利组织，税号",
      footerDonate: "奉献请用 Zelle 转至",
      verse: "“因为无论在哪里，有两三个人奉我的名聚会，那里就有我在他们中间。” —— 马太福音 18:20",
    },
  };

  var lang = document.documentElement.lang === "zh-CN" ? "zh" : "en";

  // ---------- helpers ----------

  function tr(key) {
    return I18N[lang][key] || I18N.en[key] || key;
  }

  function pick(obj, field) {
    return obj[field + "_" + lang] || obj[field + "_en"] || obj[field + "_zh"] || obj[field] || "";
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function ymd(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseYmd(s) {
    var p = s.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function todayMidnight() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function fmtTime(hhmm) {
    var p = hhmm.split(":");
    var h = +p[0];
    return (h % 12 || 12) + ":" + p[1] + " " + (h >= 12 ? "PM" : "AM");
  }

  function timeRange(item) {
    if (!item.start) return "";
    return fmtTime(item.start) + (item.end ? " – " + fmtTime(item.end) : "");
  }

  function fmtDate(d) {
    return lang === "zh"
      ? d.getMonth() + 1 + "月" + d.getDate() + "日"
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function regionById(id) {
    for (var i = 0; i < SITE.regions.length; i++) {
      if (SITE.regions[i].id === id) return SITE.regions[i];
    }
    return null;
  }

  function regionName(id) {
    var r = regionById(id);
    return r ? pick(r, "name") : tr("allRegions");
  }

  function regionColor(id) {
    var r = regionById(id);
    return r ? r.color : "var(--primary)";
  }

  // "all" items show on every region's page.
  function matchesRegion(item, region) {
    return region === "all" || item.region === region || item.region === "all";
  }

  function itemsOn(date, region) {
    var key = ymd(date);
    var dow = DAYS[date.getDay()];
    var weekly = SCHEDULE.weekly.filter(function (w) {
      return (
        w.day === dow &&
        matchesRegion(w, region) &&
        (!w.skip || w.skip.indexOf(key) === -1) &&
        (!w.from || key >= w.from) &&
        (!w.until || key <= w.until)
      );
    });
    var events = SCHEDULE.events.filter(function (e) {
      return e.date === key && matchesRegion(e, region);
    });
    return weekly
      .map(function (w) { return { item: w, special: false }; })
      .concat(events.map(function (e) { return { item: e, special: true }; }))
      .sort(function (a, b) { return (a.item.start || "").localeCompare(b.item.start || ""); });
  }

  function placeHtml(item) {
    if (!item.place) return "";
    var place = esc(item.place);
    return item.map
      ? '<a href="' + esc(item.map) + '" target="_blank" rel="noopener">' + place + "</a>"
      : place;
  }

  // Link that opens Google Calendar with the meeting pre-filled (weekly ones repeat).
  function gcalUrl(item, date, weekly) {
    if (!item.start) return "";
    var d = ymd(date).replace(/-/g, "");
    var s = item.start.replace(":", "") + "00";
    var e = (item.end || item.start).replace(":", "") + "00";
    var params = [
      "action=TEMPLATE",
      "text=" + encodeURIComponent(pick(item, "title") + " · " + SITE.name_en),
      "dates=" + d + "T" + s + "/" + d + "T" + e,
      "ctz=America/Los_Angeles",
    ];
    if (item.place) params.push("location=" + encodeURIComponent(item.place));
    if (weekly) params.push("recur=" + encodeURIComponent("RRULE:FREQ=WEEKLY"));
    return "https://calendar.google.com/calendar/render?" + params.join("&");
  }

  // ---------- header / footer ----------

  function currentPage() {
    var p = location.pathname.split("/").pop().replace(/\.html$/, "");
    return p || "index";
  }

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var page = currentPage();
    var regionLinks = SITE.regions
      .map(function (r) {
        return '<a href="' + r.id + '.html"><span class="dot" style="--rc:' + r.color + '"></span>' + esc(pick(r, "name")) + "</a>";
      })
      .join("");
    function link(href, key, id) {
      return '<a href="' + href + '"' + (page === id ? ' class="active"' : "") + ">" + tr(key) + "</a>";
    }
    el.innerHTML =
      '<div class="header-inner">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand-logo" aria-hidden="true">CG</span>' +
      (lang === "zh"
        ? '<span class="brand-text"><b>' + esc(SITE.name_zh) + "</b><small>" + esc(SITE.name_en) + "</small></span>"
        : '<span class="brand-text"><b>Church of God</b><small>in SF Bay Area</small></span>') +
      "</a>" +
      '<button class="menu-btn" aria-label="Menu" aria-expanded="false">☰</button>' +
      '<nav class="nav">' +
      link("index.html", "navHome", "index") +
      link("about.html", "navAbout", "about") +
      link("index.html#calendar", "navCalendar", "") +
      link("photos.html", "navPhotos", "photos") +
      '<details class="nav-regions"><summary>' + tr("navRegions") + '</summary><div class="menu">' + regionLinks + "</div></details>" +
      '<a href="#contact">' + tr("navContact") + "</a>" +
      '<button class="lang-btn" type="button" aria-label="Switch language">' + tr("langBtn") + "</button>" +
      "</nav></div>";

    var menuBtn = el.querySelector(".menu-btn");
    menuBtn.addEventListener("click", function () {
      var open = el.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    el.querySelector(".nav").addEventListener("click", function (e) {
      if (e.target.closest("a")) el.classList.remove("open");
    });
    el.querySelector(".lang-btn").addEventListener("click", function () {
      lang = lang === "en" ? "zh" : "en";
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      try {
        localStorage.setItem("lang", lang);
      } catch (e) {}
      renderAll();
    });
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var regionLinks = SITE.regions
      .map(function (r) { return '<a href="' + r.id + '.html">' + esc(pick(r, "name")) + "</a>"; })
      .join("");
    el.innerHTML =
      '<div class="container">' +
      '<div class="footer-grid">' +
      "<div><h4>" + esc(lang === "zh" ? SITE.name_zh : SITE.name_en) + "</h4>" +
      "<p>" + tr("footerAbout") + "</p>" +
      '<p class="footer-verse">' + tr("verse") + "</p></div>" +
      "<div><h4>" + tr("footerExplore") + "</h4>" +
      '<a href="index.html">' + tr("navHome") + "</a>" +
      '<a href="about.html">' + tr("navAbout") + "</a>" +
      '<a href="index.html#calendar">' + tr("navCalendar") + "</a>" +
      '<a href="photos.html">' + tr("navPhotos") + "</a>" +
      '<a href="#contact">' + tr("navContact") + "</a></div>" +
      "<div><h4>" + tr("footerRegions") + "</h4>" + regionLinks + "</div>" +
      "</div>" +
      '<div class="footer-bottom">' +
      "<p><b>© " + new Date().getFullYear() + " " + esc(lang === "zh" ? SITE.name_zh : SITE.name_en) + "</b></p>" +
      "<p>" + tr("footerTax") + " " + esc(SITE.taxId) + " · " +
      tr("footerDonate") + ' <a href="mailto:' + esc(SITE.zelle) + '">' + esc(SITE.zelle) + "</a></p>" +
      "</div></div>";
  }

  function renderContact() {
    var el = document.getElementById("contact-root");
    if (!el) return;
    el.innerHTML =
      '<div class="contact-actions">' +
      '<a class="btn" href="' + esc(SITE.contactForm) + '" target="_blank" rel="noopener">' + tr("contactBtn") + "</a>" +
      '<a class="btn btn-outline-white" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>" +
      "</div>";
  }

  function renderHeroChips() {
    var el = document.getElementById("hero-chips");
    if (!el) return;
    el.innerHTML = SITE.regions
      .map(function (r) {
        return '<a href="' + r.id + '.html" style="--rc:' + r.color + '"><span class="dot" style="background:' + r.color + '"></span>' + esc(pick(r, "name")) + "</a>";
      })
      .join("");
  }

  // ---------- region cards ----------

  function renderRegionCards() {
    var el = document.getElementById("regions-root");
    if (!el) return;
    el.innerHTML = SITE.regions
      .map(function (r) {
        var meetings = SCHEDULE.weekly.filter(function (w) { return w.region === r.id; });
        var summary = meetings.length
          ? meetings
              .map(function (w) {
                return DAY_NAMES[lang][DAYS.indexOf(w.day)] + " " + fmtTime(w.start) + " · " + esc(pick(w, "title"));
              })
              .join("<br>")
          : '<span class="muted">' + tr("timesSoon") + "</span>";
        return (
          '<a class="region-card" href="' + r.id + '.html" style="--rc:' + r.color + '">' +
          "<h3>" + esc(pick(r, "name")) + "</h3>" +
          '<p class="area">' + esc(pick(r, "area")) + "</p>" +
          '<p class="summary">' + summary + "</p>" +
          '<span class="more">' + tr("viewRegion") + "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  // ---------- region page ----------

  function renderRegionHero(regionId) {
    var el = document.getElementById("region-hero");
    var r = regionById(regionId);
    if (!el || !r) return;
    document.title = pick(r, "name") + " · " + (lang === "zh" ? SITE.name_zh : SITE.name_en);
    (el.closest(".region-hero") || el).style.setProperty("--rc", r.color);
    el.innerHTML =
      '<a class="back" href="index.html">' + tr("backHome") + "</a>" +
      "<h1>" + esc(pick(r, "name")) + "</h1>" +
      '<p class="area">' + esc(pick(r, "area")) + "</p>" +
      '<p class="intro">' + esc(pick(r, "intro")) + "</p>";
  }

  // Used on region pages (one region) and the About page (data-region="all").
  function renderWeeklyCards(regionId) {
    var el = document.getElementById("weekly-root");
    if (!el) return;
    var meetings = SCHEDULE.weekly
      .filter(function (w) { return matchesRegion(w, regionId); })
      .sort(function (a, b) {
        return DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start);
      });
    if (!meetings.length) {
      el.innerHTML = '<p class="empty-note">' + tr("weeklyEmpty") + "</p>";
      return;
    }
    el.innerHTML =
      '<div class="weekly-cards">' +
      meetings
        .map(function (w) {
          return (
            '<div class="weekly-card" style="--rc:' + regionColor(w.region) + '">' +
            '<div class="wc-day">' + DAY_NAMES[lang][DAYS.indexOf(w.day)] + "</div>" +
            '<div class="wc-title">' + esc(pick(w, "title")) + "</div>" +
            '<div class="wc-time">' + timeRange(w) + "</div>" +
            '<div class="wc-place">' + placeHtml(w) + "</div>" +
            (regionId === "all" ? '<div class="wc-region">● ' + esc(regionName(w.region)) + "</div>" : "") +
            "</div>"
          );
        })
        .join("") +
      "</div>";
  }

  // ---------- calendar (week view) ----------

  function makeCalendar(root, lockedRegion) {
    var offset = 0;
    var filter = lockedRegion || "all";

    function draw() {
      var today = todayMidnight();
      var start = new Date(today);
      start.setDate(today.getDate() - today.getDay() + offset * 7);
      var end = new Date(start);
      end.setDate(start.getDate() + 6);

      var html =
        '<div class="cal-toolbar">' +
        '<button type="button" data-nav="-1">' + tr("prevWeek") + "</button>" +
        '<div class="cal-range">' + fmtDate(start) + " – " + fmtDate(end) + "</div>" +
        '<button type="button" data-nav="0"' + (offset === 0 ? " disabled" : "") + ">" + tr("thisWeek") + "</button>" +
        '<button type="button" data-nav="1">' + tr("nextWeek") + "</button>" +
        "</div>";

      if (!lockedRegion) {
        html +=
          '<div class="cal-filters" role="group">' +
          '<button type="button" data-filter="all" class="' + (filter === "all" ? "active" : "") + '">' + tr("all") + "</button>" +
          SITE.regions
            .map(function (r) {
              return (
                '<button type="button" data-filter="' + r.id + '" style="--rc:' + r.color + '" class="' +
                (filter === r.id ? "active" : "") + '"><span class="dot"></span>' + esc(pick(r, "name")) + "</button>"
              );
            })
            .join("") +
          "</div>";
      }

      html += '<div class="cal-grid">';
      for (var i = 0; i < 7; i++) {
        var d = new Date(start);
        d.setDate(start.getDate() + i);
        var items = itemsOn(d, filter);
        var isToday = d.getTime() === today.getTime();
        html +=
          '<div class="cal-day' + (isToday ? " is-today" : "") + (items.length ? "" : " is-empty") + '">' +
          '<div class="cal-day-head"><span class="dow">' + DAY_NAMES[lang][d.getDay()] + "</span>" +
          '<span class="date">' + (d.getMonth() + 1) + "/" + d.getDate() + "</span></div>";
        if (items.length) {
          html += items
            .map(function (x) {
              var it = x.item;
              var gcal = gcalUrl(it, d, !x.special);
              return (
                '<div class="cal-item' + (x.special ? " special" : "") + '" style="--rc:' + regionColor(it.region) + '">' +
                '<div class="ci-time">' + timeRange(it) + "</div>" +
                '<div class="ci-title">' + (x.special ? '<span class="ci-tag">' + tr("special") + "</span> " : "") + esc(pick(it, "title")) + "</div>" +
                '<div class="ci-meta">' + esc(regionName(it.region)) +
                (it.place && it.place !== pick(regionById(it.region) || {}, "name") ? " · " + placeHtml(it) : "") + "</div>" +
                (gcal ? '<a class="ci-add" href="' + esc(gcal) + '" target="_blank" rel="noopener">' + tr("addCal") + "</a>" : "") +
                "</div>"
              );
            })
            .join("");
        } else {
          html += '<div class="cal-none">·</div>';
        }
        html += "</div>";
      }
      html += "</div>";
      root.innerHTML = html;
    }

    root.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-nav")) {
        var n = +b.getAttribute("data-nav");
        offset = n === 0 ? 0 : offset + n;
      } else if (b.hasAttribute("data-filter")) {
        filter = b.getAttribute("data-filter");
      }
      draw();
    });

    return draw;
  }

  // ---------- upcoming special events ----------

  function renderEvents(regionId) {
    var el = document.getElementById("events-root");
    if (!el) return;
    var todayKey = ymd(todayMidnight());
    var upcoming = SCHEDULE.events
      .filter(function (e) { return e.date >= todayKey && matchesRegion(e, regionId); })
      .sort(function (a, b) { return a.date.localeCompare(b.date) || (a.start || "").localeCompare(b.start || ""); })
      .slice(0, 8);
    if (!upcoming.length) {
      el.innerHTML = '<p class="empty-note">' + tr("noEvents") + "</p>";
      return;
    }
    el.innerHTML =
      '<div class="event-list">' +
      upcoming
        .map(function (e) {
          var d = parseYmd(e.date);
          var note = pick(e, "note");
          return (
            '<article class="event" style="--rc:' + regionColor(e.region) + '">' +
            '<div class="event-date"><span class="m">' + (lang === "zh" ? d.getMonth() + 1 + "月" : d.toLocaleDateString("en-US", { month: "short" })) + "</span>" +
            '<span class="d">' + d.getDate() + "</span>" +
            '<span class="w">' + DAY_NAMES[lang][d.getDay()] + "</span></div>" +
            '<div class="event-body"><h3>' + esc(pick(e, "title")) + "</h3>" +
            '<p class="meta">' + esc(regionName(e.region)) + (e.start ? " · " + timeRange(e) : "") + (e.place ? " · " + placeHtml(e) : "") + "</p>" +
            (note ? "<p>" + esc(note) + "</p>" : "") +
            "</div></article>"
          );
        })
        .join("") +
      "</div>";
  }

  // ---------- photos + lightbox ----------

  var lightbox = null;
  var lbList = [];
  var lbIndex = 0;

  function ensureLightbox() {
    if (lightbox) return;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.innerHTML =
      '<button class="lb-btn lb-close" aria-label="Close">✕</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous">‹</button>' +
      "<figure><img alt=\"\"><figcaption></figcaption></figure>" +
      '<button class="lb-btn lb-next" aria-label="Next">›</button>';
    document.body.appendChild(lightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.closest(".lb-close")) closeLightbox();
      else if (e.target.closest(".lb-prev")) showPhoto(lbIndex - 1);
      else if (e.target.closest(".lb-next")) showPhoto(lbIndex + 1);
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
      if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
    });
  }

  function showPhoto(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    var p = lbList[lbIndex];
    lightbox.querySelector("img").src = p.src;
    lightbox.querySelector("img").alt = pick(p, "caption");
    lightbox.querySelector("figcaption").textContent = pick(p, "caption");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  // data-limit="5" makes the home-page mosaic (one big tile + four); empty slots get placeholders.
  function makeGallery(root) {
    var limit = +root.getAttribute("data-limit") || 0;

    function draw() {
      var list = PHOTOS.filter(function (p) { return p.src; });
      if (limit) list = list.slice(0, limit);
      var html = '<div class="photo-grid' + (limit ? " mosaic" : "") + '">';
      html += list
        .map(function (p, i) {
          return (
            '<button type="button" class="photo reveal" data-i="' + i + '">' +
            '<img loading="lazy" src="' + esc(p.src) + '" alt="' + esc(pick(p, "caption")) + '">' +
            (pick(p, "caption") ? '<span class="cap">' + esc(pick(p, "caption")) + "</span>" : "") +
            "</button>"
          );
        })
        .join("");
      var slots = limit ? limit - list.length : list.length ? 0 : 6;
      for (var i = 0; i < slots; i++) {
        html +=
          '<div class="photo placeholder reveal">' +
          '<small>' + tr("photoSoon") + "</small></div>";
      }
      html += "</div>";
      root.innerHTML = html;
      root._list = list;
      observeReveals(root);
    }

    root.addEventListener("click", function (e) {
      var ph = e.target.closest(".photo[data-i]");
      if (ph) {
        ensureLightbox();
        lbList = root._list;
        showPhoto(+ph.getAttribute("data-i"));
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    });

    return draw;
  }

  // ---------- animations ----------

  var revealObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) {
                en.target.classList.add("in");
                revealObserver.unobserve(en.target);
              }
            });
          },
          { threshold: 0.12 }
        )
      : null;

  function observeReveals(scope) {
    var nodes = (scope || document).querySelectorAll(".reveal:not(.in)");
    for (var i = 0; i < nodes.length; i++) {
      if (revealObserver) revealObserver.observe(nodes[i]);
      else nodes[i].classList.add("in");
    }
  }

  function setupScrollUi() {
    var header = document.getElementById("site-header");
    var toTop = document.createElement("button");
    toTop.className = "to-top";
    toTop.setAttribute("aria-label", "Back to top");
    toTop.textContent = "↑";
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(toTop);
    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle("scrolled", y > 10);
      toTop.classList.toggle("show", y > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- boot ----------

  var pageRegion = document.body.getAttribute("data-region") || "all";
  var isRegionPage = !!regionById(pageRegion);
  var calRoot = document.getElementById("calendar-root");
  var drawCalendar = calRoot ? makeCalendar(calRoot, isRegionPage ? pageRegion : null) : null;
  var galleryRoot = document.getElementById("gallery-root");
  var drawGallery = galleryRoot ? makeGallery(galleryRoot) : null;
  var titles = { en: document.body.getAttribute("data-title-en"), zh: document.body.getAttribute("data-title-zh") };

  function renderAll() {
    if (titles[lang]) document.title = titles[lang];
    renderHeader();
    renderFooter();
    renderContact();
    renderHeroChips();
    renderRegionCards();
    if (isRegionPage) renderRegionHero(pageRegion);
    renderWeeklyCards(pageRegion);
    if (drawCalendar) drawCalendar();
    if (drawGallery) drawGallery();
    renderEvents(pageRegion);
  }

  renderAll();
  setupScrollUi();
  observeReveals();

  // The browser jumps to #contact etc. before the JS-rendered sections above it
  // exist, so it lands in the wrong place. Jump again once everything is drawn.
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView();
      window.addEventListener("load", function () { target.scrollIntoView(); });
    }
  }
})();
