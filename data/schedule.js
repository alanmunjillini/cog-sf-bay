/*
 * ================================================================
 *  每周日历 · WEEKLY CALENDAR  ← 每周只需要改这个文件
 *  Edit this file to update the calendar. No build step needed.
 * ================================================================
 *
 * region 可选值 / region values:
 *   "berkeley" | "scu" | "de-anza" | "south-bay" | "stanford" | "all"
 *   ("all" = 全湾区聚会，会显示在每个区的页面上)
 *
 * 时间用 24 小时制 "HH:MM"，例如 "14:00" = 2:00 PM
 * Times are 24-hour "HH:MM".
 */

window.SCHEDULE = {
  /*
   * 固定聚会：每周自动出现在日历上
   * Recurring meetings: show up every week automatically.
   *
   *   day:   "Sun" "Mon" "Tue" "Wed" "Thu" "Fri" "Sat"
   *   skip:  ["2026-11-29"]   这几天暂停（可选）/ dates it does NOT happen (optional)
   *   from / until: "2026-09-01"  开始/结束日期（可选）/ first / last date (optional)
   */
  weekly: [
    {
      region: "berkeley",
      day: "Sun",
      start: "11:00",
      end: "13:30",
      title_zh: "主的桌子聚会和早午餐",
      title_en: "Lord's Table & Brunch",
      place: "Berkeley",
      map: "",
    },

    // 例子 / Example — 复制、删掉 // 、改成真实信息：
    // {
    //   region: "stanford",
    //   day: "Wed",
    //   start: "19:00",
    //   end: "20:00",
    //   title_zh: "读经小组",
    //   title_en: "Bible Study",
    //   place: "Old Union 200",
    //   map: "",
    // },
  ],

  /*
   * 特别聚会：只在某一天出现（福音聚会、特会、爱筵……）
   * One-time events: show on one date only.
   *
   *   date: "YYYY-MM-DD"
   *   note_zh / note_en: 简短说明（可选）/ short description (optional)
   */
  events: [
    {
      region: "south-bay",
      date: "2026-11-07",
      start: "14:00",
      end: "15:30",
      title_zh: "诗歌音乐会",
      title_en: "Hymns Music Concert",
      place: "",
      map: "",
      note_zh: "一同来享受诗歌音乐会！",
      note_en: "Come enjoy an afternoon of hymns and music together!",
    },

    // 例子 / Example:
    // {
    //   region: "all",
    //   date: "2026-11-22",
    //   start: "14:00",
    //   end: "16:30",
    //   title_zh: "感恩节福音聚会",
    //   title_en: "Thanksgiving Gospel Meeting",
    //   place: "Palo Alto",
    //   map: "",
    //   note_zh: "会后有爱筵，欢迎带朋友来！",
    //   note_en: "Love feast afterwards — bring a friend!",
    // },
  ],
};
