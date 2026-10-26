/*
 * 网站基本信息 · SITE SETTINGS
 * 名称、联系方式、五个区的介绍。很少需要改。
 * Church name, contact info, and the 5 region intros. Rarely changes.
 */

window.SITE = {
  name_zh: "旧金山湾区教会",
  name_en: "Church of God in SF Bay Area",
  email: "cogisf@gmail.com",
  contactForm: "https://forms.gle/Bsvrer4Zd3NxHAwt9",
  taxId: "93-4301783",
  zelle: "cogisf@gmail.com",

  // color = 这个区在日历上的颜色 / the region's color on the calendar
  regions: [
    {
      id: "berkeley",
      name_zh: "伯克利",
      name_en: "Berkeley",
      area_zh: "UC Berkeley · 东湾",
      area_en: "UC Berkeley · East Bay",
      color: "#2f6690",
      intro_zh: "伯克利的弟兄姊妹在 UC Berkeley 附近聚会。欢迎学生、学者和东湾的朋友一同来读经、交通。",
      intro_en: "Saints in Berkeley meet near UC Berkeley. Students, scholars, and East Bay friends are welcome to read the Bible and fellowship with us.",
    },
    {
      id: "scu",
      name_zh: "圣塔克拉拉大学",
      name_en: "SCU",
      area_zh: "Santa Clara University",
      area_en: "Santa Clara University",
      color: "#7b4b94",
      intro_zh: "在 Santa Clara University 的学生聚会。欢迎同学们一起来认识主、彼此扶持。",
      intro_en: "A student gathering at Santa Clara University. Come get to know the Lord and support one another.",
    },
    {
      id: "de-anza",
      name_zh: "迪安萨学院",
      name_en: "De Anza",
      area_zh: "De Anza College · Cupertino",
      area_en: "De Anza College · Cupertino",
      color: "#3f7d4e",
      intro_zh: "在 De Anza College 的学生聚会。不论你是刚开始认识基督，还是已经信主多年，都欢迎你。",
      intro_en: "A student gathering at De Anza College. Whether you are new to Christ or have walked with Him for years, you are welcome.",
    },
    {
      id: "south-bay",
      name_zh: "南湾",
      name_en: "South Bay",
      area_zh: "Palo Alto · 南湾",
      area_en: "Palo Alto · South Bay",
      color: "#b5651d",
      intro_zh: "南湾的主日聚会在 Palo Alto。我们一同记念主、敬拜神，并彼此建造。",
      intro_en: "The South Bay Lord's Day meeting is in Palo Alto. We remember the Lord, worship God, and build one another up.",
    },
    {
      id: "stanford",
      name_zh: "斯坦福",
      name_en: "Stanford",
      area_zh: "Stanford University",
      area_en: "Stanford University",
      color: "#a3262f",
      intro_zh: "在 Stanford University 的学生和学者聚会。欢迎来一起读经、祷告。",
      intro_en: "A gathering for students and scholars at Stanford University. Join us to read the Bible and pray.",
    },
  ],
};
