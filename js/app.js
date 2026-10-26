/*
 * Shared page logic: header, footer, language toggle, calendar.
 * Content lives in data/site.js and data/schedule.js — edit those instead.
 */
(function () {
  "use strict";

  var SITE = window.SITE;
  var SCHEDULE = window.SCHEDULE || { weekly: [], events: [] };
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY_NAMES = {
    zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  };

  var I18N = {
    zh: {
      navHome: "主页",
      navCalendar: "日历",
      navRegions: "各区",
      navContact: "联系我们",
      langBtn: "EN",
      verse: "因为无论在哪里，有两三个人奉我的名聚会，那里就有我在他们中间。",
      verseRef: "马太福音 18:20",
      seeCalendar: "查看本周聚会",
      aboutTitle: "欢迎来到湾区教会",
      aboutBody:
        "我们是在旧金山湾区的一班基督徒，照着圣经聚会，追求认识基督，过彼此相爱的教会生活。湾区各地都有聚会，不论你是学生、上班族还是家庭，都欢迎你来。",
      regionsTitle: "五个区",
      viewRegion: "查看聚会",
      calendarTitle: "每周日历",
      prevWeek: "‹ 上一周",
      thisWeek: "本周",
      nextWeek: "下一周 ›",
      all: "全部",
      allRegions: "全湾区",
      eventsTitle: "特别聚会",
      noEvents: "目前没有特别聚会，请留意日历更新。",
      weeklyTitle: "固定聚会",
      weeklyEmpty: "聚会时间待更新。想参加的话，请通过下面的“联系我们”告诉我们，我们会尽快回复你！",
      contactTitle: "联系我们",
      contactBody: "想参加聚会、读经小组，或者有任何问题，欢迎填写表格或发邮件给我们，我们会尽快回复你！",
      contactBtn: "填写联系表格",
      backHome: "‹ 返回主页",
      map: "地图",
      footerTax: "我们是注册的 501(c)(3) 非营利组织，税号",
      footerDonate: "奉献请用 Zelle 转至",
    },
    en: {
      navHome: "Home",
      navCalendar: "Calendar",
      navRegions: "Regions",
      navContact: "Contact",
      langBtn: "中文",
      verse: "For where two or three are gathered together in my name, there am I in the midst of them.",
      verseRef: "Matthew 18:20",
      seeCalendar: "This week's meetings",
      aboutTitle: "Welcome",
      aboutBody:
        "We are Christians in the San Francisco Bay Area who meet according to the Bible, pursue knowing Christ, and live a church life of mutual love. We meet across the Bay — students, working people, and families are all welcome.",
      regionsTitle: "Our Regions",
      viewRegion: "See meetings",
      calendarTitle: "Weekly Calendar",
      prevWeek: "‹ Prev",
      thisWeek: "This week",
      nextWeek: "Next ›",
      all: "All",
      allRegions: "All Bay Area",
      eventsTitle: "Special Events",
      noEvents: "No special events right now — check back soon.",
      weeklyTitle: "Weekly Meetings",
      weeklyEmpty: "Meeting times coming soon. Want to join? Contact us below and we'll get back to you!",
      contactTitle: "Contact Us",
      contactBody: "Want to join a meeting or a Bible study group, or have a question? Fill out the form or email us — we'll reply soon!",
      contactBtn: "Open contact form",
      backHome: "‹ Back to home",
      map: "Map",
      footerTax: "We are a registered 501(c)(3) non-profit, tax ID",
      footerDonate: "To donate, Zelle to",
    },
  };

  var lang = "zh";
  try {
    if (localStorage.getItem("lang") === "en") lang = "en";
  } catch (e) {}

  // ---------- helpers ----------

  function tr(key) {
    return I18N[lang][key] || I18N.zh[key] || key;
  }

  function pick(obj, field) {
    return obj[field + "_" + lang] || obj[field + "_zh"] || obj[field + "_en"] || obj[field] || "";
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
    var ap = h >= 12 ? "PM" : "AM";
    return (h % 12 || 12) + ":" + p[1] + " " + ap;
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
    return r ? r.color : "var(--accent)";
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

  // ---------- header / footer ----------

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var regionLinks = SITE.regions
      .map(function (r) {
        return '<a href="' + r.id + '.html"><span class="dot" style="--rc:' + r.color + '"></span>' + esc(pick(r, "name")) + "</a>";
      })
      .join("");
    el.innerHTML =
      '<div class="header-inner">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand-mark" aria-hidden="true">✦</span>' +
      '<span class="brand-text"><b>' + esc(SITE.name_zh) + "</b><small>" + esc(SITE.name_en) + "</small></span>" +
      "</a>" +
      '<button class="menu-btn" aria-label="Menu" aria-expanded="false">☰</button>' +
      '<nav class="nav">' +
      '<a href="index.html">' + tr("navHome") + "</a>" +
      '<a href="index.html#calendar">' + tr("navCalendar") + "</a>" +
      '<details class="nav-regions"><summary>' + tr("navRegions") + "</summary><div class=\"menu\">" + regionLinks + "</div></details>" +
      '<a href="#contact">' + tr("navContact") + "</a>" +
      '<button class="lang-btn" type="button">' + tr("langBtn") + "</button>" +
      "</nav></div>";

    var menuBtn = el.querySelector(".menu-btn");
    menuBtn.addEventListener("click", function () {
      var open = el.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    el.querySelector(".lang-btn").addEventListener("click", function () {
      lang = lang === "zh" ? "en" : "zh";
      try {
        localStorage.setItem("lang", lang);
      } catch (e) {}
      renderAll();
    });
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML =
      "<p><b>© " + new Date().getFullYear() + " " + esc(SITE.name_en) + "</b> · " + esc(SITE.name_zh) + "</p>" +
      "<p>" + tr("footerTax") + " " + esc(SITE.taxId) + "<br>" +
      tr("footerDonate") + ' <a href="mailto:' + esc(SITE.zelle) + '">' + esc(SITE.zelle) + "</a></p>";
  }

  function renderStaticText() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = tr(nodes[i].getAttribute("data-i18n"));
    }
  }

  function renderContact() {
    var el = document.getElementById("contact-root");
    if (!el) return;
    el.innerHTML =
      "<p>" + tr("contactBody") + "</p>" +
      '<p class="contact-actions">' +
      '<a class="btn" href="' + esc(SITE.contactForm) + '" target="_blank" rel="noopener">' + tr("contactBtn") + "</a>" +
      '<a class="btn btn-ghost" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>" +
      "</p>";
  }

  // ---------- home page: region cards ----------

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
          : '<span class="muted">' + (lang === "zh" ? "时间待更新" : "Times coming soon") + "</span>";
        return (
          '<a class="region-card" href="' + r.id + '.html" style="--rc:' + r.color + '">' +
          "<h3>" + esc(pick(r, "name")) + "</h3>" +
          '<p class="area">' + esc(pick(r, "area")) + "</p>" +
          '<p class="summary">' + summary + "</p>" +
          '<span class="more">' + tr("viewRegion") + " →</span>" +
          "</a>"
        );
      })
      .join("");
  }

  // ---------- region page: hero + weekly cards ----------

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
              return (
                '<div class="cal-item' + (x.special ? " special" : "") + '" style="--rc:' + regionColor(it.region) + '">' +
                '<div class="ci-time">' + timeRange(it) + "</div>" +
                '<div class="ci-title">' + (x.special ? "★ " : "") + esc(pick(it, "title")) + "</div>" +
                '<div class="ci-meta">' + esc(regionName(it.region)) + (it.place ? " · " + placeHtml(it) : "") + "</div>" +
                "</div>"
              );
            })
            .join("");
        } else {
          html += '<div class="cal-none">—</div>';
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
            '<div class="event-date"><span class="m">' + (d.getMonth() + 1) + (lang === "zh" ? "月" : "/") + "</span>" +
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

  // ---------- boot ----------

  var pageRegion = document.body.getAttribute("data-region") || "all";
  var calRoot = document.getElementById("calendar-root");
  var drawCalendar = calRoot ? makeCalendar(calRoot, pageRegion === "all" ? null : pageRegion) : null;

  function renderAll() {
    renderStaticText();
    renderHeader();
    renderFooter();
    renderContact();
    renderRegionCards();
    if (pageRegion !== "all") {
      renderRegionHero(pageRegion);
      renderWeeklyCards(pageRegion);
    }
    if (drawCalendar) drawCalendar();
    renderEvents(pageRegion);
  }

  renderAll();
})();
