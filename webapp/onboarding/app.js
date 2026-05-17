const chapters = [
  {
    kicker: "Overview",
    title: "Why This Onboarding Guide Exists",
    summary:
      "New members join with different goals, confidence levels, and timelines. This guide gives a common starting point so each member can grow with clarity and support.",
    know: [
      "Toastmasters learning is practical: meeting participation, feedback, and repetition.",
      "Your mentor and club officers help you select realistic first steps.",
      "Progress is personalized; there is no single pace for everyone.",
    ],
    apply: [
      "Share your top 2 communication goals with your mentor.",
      "Attend consistently for the first 8 to 12 meetings to build rhythm.",
      "Take at least one small role early to reduce first-meeting anxiety.",
    ],
    tip: "Treat your first season as exploration, not perfection. Confidence follows repetition.",
  },
  {
    kicker: "History & Global Presence",
    title: "Toastmasters International at a Glance",
    summary:
      "Toastmasters International began in 1924 and has grown into a global nonprofit network focused on communication and leadership development across many countries.",
    know: [
      "Founded by Dr. Ralph C. Smedley to help people become better speakers and leaders.",
      "Members learn in local clubs while sharing standards and educational pathways globally.",
      "Regions and districts support clubs with training, contests, and events.",
    ],
    apply: [
      "Review the region and district maps to understand the wider community.",
      "Attend at least one district or area event in your first year.",
      "Use the magazine and resource library for examples and inspiration.",
    ],
    tip: "You are joining both a local club and a worldwide learning community.",
  },
  {
    kicker: "Member Value",
    title: "How Toastmasters Helps You Grow",
    summary:
      "Members typically improve public speaking, active listening, leadership, and professional presence through repeated speaking opportunities and supportive evaluations.",
    know: [
      "Prepared speeches sharpen structure, storytelling, and delivery.",
      "Table Topics trains fast thinking and concise expression.",
      "Evaluations develop listening, empathy, and coaching language.",
    ],
    apply: [
      "Set one speaking metric and one leadership metric for the quarter.",
      "Ask evaluators for one specific stretch recommendation each speech.",
      "Practice reflection: what worked, what to adjust, what to try next.",
    ],
    tip: "Growth compounds when you alternate speaking, evaluating, and facilitating.",
  },
  {
    kicker: "Meeting Roles",
    title: "Your Role in a Club Meeting",
    summary:
      "A strong meeting depends on members rotating responsibilities. Toastmasters wear many hats, and each role builds a different communication skill.",
    know: [
      "Core roles include Toastmaster, Speaker, Evaluator, Table Topics Master, and General Evaluator.",
      "Support roles such as Timer, Grammarian, Ah-Counter, and Word of the Day Master build listening precision.",
      "Role rotation spreads growth opportunities and keeps meetings resilient.",
    ],
    apply: [
      "Start with a support role, then move into speaking and facilitation roles.",
      "Prepare a short role checklist before each meeting.",
      "After serving, capture one skill gained and one skill to improve.",
    ],
    tip: "The fastest confidence gains often come from consistent small roles.",
  },
  {
    kicker: "Pathways",
    title: "How Pathways Levels and Projects Work",
    summary:
      "Pathways is the Toastmasters education system. Members complete projects in levels, practicing communication and leadership in a self-paced format.",
    know: [
      "Each path is built from progressive projects with practical assignments.",
      "Levels help you sequence skills from fundamentals to advanced application.",
      "Projects become stronger when tied directly to real club opportunities.",
    ],
    apply: [
      "Choose your first path with your mentor based on your primary goal.",
      "Plan your next two projects and schedule tentative speech dates.",
      "Use the Base Camp dashboard to track completion and reflect on lessons.",
    ],
    tip: "Pick momentum over complexity. Finishing early projects quickly builds traction.",
  },
  {
    kicker: "Club Operations",
    title: "Why Club Officer Roles Matter",
    summary:
      "Club quality depends on shared leadership. Officer roles keep meetings consistent, welcoming, and educationally effective.",
    know: [
      "Officers coordinate education, membership, finance, logistics, and communication.",
      "Leadership roles create hands-on experience in planning and accountability.",
      "Healthy clubs invite members to contribute beyond speeches.",
    ],
    apply: [
      "Volunteer for committee or project support before taking an officer role.",
      "Ask an officer to explain one monthly workflow you can assist with.",
      "Attend officer training when available.",
    ],
    tip: "Leadership in Toastmasters is practice, not title. Start by owning one process.",
  },
  {
    kicker: "Meeting Excellence",
    title: "What Makes a Club Meeting Successful",
    summary:
      "Great meetings are inclusive, on-time, and purpose-driven. Success comes from preparation, clear agendas, and active member participation.",
    know: [
      "Prepared role holders keep transitions smooth and energy high.",
      "Balanced speaking opportunities improve member retention.",
      "Constructive feedback culture keeps standards high without discouraging members.",
    ],
    apply: [
      "Review role scripts and timings before meeting day.",
      "Rotate participants intentionally so no one is overlooked.",
      "Close meetings with a clear next-step call to action.",
    ],
    tip: "A reliable meeting rhythm is often the best recruitment and retention strategy.",
  },
  {
    kicker: "Contests & Recognition",
    title: "Speech Competitions and Accredited Speaker",
    summary:
      "Toastmasters offers speech contests at multiple levels and an Accredited Speaker program for advanced recognition of professional speaking excellence.",
    know: [
      "Contests help members practice under pressure and elevate storytelling quality.",
      "Contest pathways can include club, area, division, district, and beyond.",
      "The Accredited Speaker program is a distinct advanced achievement track.",
    ],
    apply: [
      "Observe a contest first, then volunteer as a judge or helper.",
      "Choose one speech to refine deeply for contest readiness.",
      "Research eligibility and expectations for advanced recognition pathways.",
    ],
    tip: "Competing is optional, but contest preparation accelerates speaking precision.",
  },
  {
    kicker: "Best Practices",
    title: "Your 90-Day New Member Playbook",
    summary:
      "The first 90 days set your trajectory. A clear plan helps new members stay engaged and build measurable growth.",
    know: [
      "Consistency beats intensity: regular attendance builds confidence.",
      "Feedback becomes useful when tied to one focus skill at a time.",
      "Mentor check-ins reduce uncertainty and improve completion rates.",
    ],
    apply: [
      "Month 1: attend, observe, and complete one support role.",
      "Month 2: deliver your first project and complete one evaluation role.",
      "Month 3: take a leadership-support task and map your next project cycle.",
    ],
    tip: "Finish your first projects early, then expand role variety to broaden leadership skills.",
  },
];

const resources = [
  { name: "Toastmasters International", url: "https://www.toastmasters.org/" },
  { name: "Regions Map (2025-2026)", url: "https://content.toastmasters.org/image/upload/district-maps-2025-2026.pdf" },
  { name: "Membership", url: "https://www.toastmasters.org/membership" },
  { name: "Club Meeting Roles", url: "https://www.toastmasters.org/membership/club-meeting-roles" },
  { name: "Pathways", url: "https://www.toastmasters.org/education/pathways" },
  { name: "Base Camp Dashboard", url: "https://app.basecamp.toastmasters.org/dashboard" },
  { name: "Resource Library", url: "https://www.toastmasters.org/resources" },
  { name: "Toastmaster Magazine", url: "https://www.toastmasters.org/magazine" },
  { name: "Find a Club", url: "https://www.toastmasters.org/find-a-club" },
  { name: "Events", url: "https://www.toastmasters.org/events" },
];

const slider = document.getElementById("slider");
const dotsContainer = document.getElementById("chapterDots");
const chapterMeta = document.getElementById("chapterMeta");
const template = document.getElementById("slideTemplate");

let currentSlide = 0;

init();

function init() {
  renderSlides();
  renderDots();
  renderResources();
  bindEvents();
  updateChapterMeta(0);
}

function bindEvents() {
  document.getElementById("prevSlide").addEventListener("click", () => goToSlide(currentSlide - 1));
  document.getElementById("nextSlide").addEventListener("click", () => goToSlide(currentSlide + 1));
  document.getElementById("jumpOverview").addEventListener("click", () => goToSlide(0));
  document.getElementById("jumpBestPractices").addEventListener("click", () => goToSlide(chapters.length - 1));
  document.getElementById("downloadEbook").addEventListener("click", downloadEbookHtml);
  document.getElementById("downloadMarkdown").addEventListener("click", downloadEbookMarkdown);

  slider.addEventListener("scroll", handleScroll, { passive: true });
  slider.addEventListener("keydown", handleSliderKeys);
}

function renderSlides() {
  const fragment = document.createDocumentFragment();
  chapters.forEach((chapter) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".slide-kicker").textContent = chapter.kicker;
    clone.querySelector(".slide-title").textContent = chapter.title;
    clone.querySelector(".slide-summary").textContent = chapter.summary;
    fillList(clone.querySelector('[data-kind="know"]'), chapter.know);
    fillList(clone.querySelector('[data-kind="apply"]'), chapter.apply);
    clone.querySelector(".tip").textContent = chapter.tip;
    fragment.appendChild(clone);
  });
  slider.appendChild(fragment);
}

function renderDots() {
  dotsContainer.innerHTML = "";
  chapters.forEach((chapter, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to chapter ${index + 1}: ${chapter.title}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  syncDots(0);
}

function renderResources() {
  const ul = document.getElementById("resourceList");
  ul.innerHTML = resources
    .map((resource) => `<li><a href="${escapeHtml(resource.url)}" target="_blank" rel="noopener">${escapeHtml(resource.name)}</a></li>`)
    .join("");
}

function fillList(container, items) {
  container.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function goToSlide(index) {
  const safeIndex = Math.max(0, Math.min(index, chapters.length - 1));
  const slideWidth = slider.clientWidth + 12.8;
  slider.scrollTo({ left: slideWidth * safeIndex, behavior: "smooth" });
  currentSlide = safeIndex;
  syncDots(currentSlide);
  updateChapterMeta(currentSlide);
}

function handleScroll() {
  const slideWidth = slider.clientWidth + 12.8;
  const index = Math.round(slider.scrollLeft / slideWidth);
  const safeIndex = Math.max(0, Math.min(index, chapters.length - 1));
  if (safeIndex !== currentSlide) {
    currentSlide = safeIndex;
    syncDots(currentSlide);
    updateChapterMeta(currentSlide);
  }
}

function handleSliderKeys(event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goToSlide(currentSlide + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goToSlide(currentSlide - 1);
  }
}

function syncDots(activeIndex) {
  [...dotsContainer.querySelectorAll(".dot")].forEach((dot, index) => {
    if (index === activeIndex) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

function updateChapterMeta(index) {
  chapterMeta.textContent = `Chapter ${index + 1} of ${chapters.length} - ${chapters[index].title}`;
}

function downloadEbookHtml() {
  const html = buildEbookHtml();
  downloadBlob(html, "toastmasters_new_member_onboarding_guide.html", "text/html;charset=utf-8");
}

function downloadEbookMarkdown() {
  const markdown = buildEbookMarkdown();
  downloadBlob(markdown, "toastmasters_new_member_onboarding_guide.md", "text/markdown;charset=utf-8");
}

function buildEbookHtml() {
  const chapterBlocks = chapters
    .map((chapter, index) => {
      const know = chapter.know.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      const apply = chapter.apply.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      return [
        `<section class="chapter">`,
        `<p class="kicker">${escapeHtml(chapter.kicker)}</p>`,
        `<h2>${index + 1}. ${escapeHtml(chapter.title)}</h2>`,
        `<p>${escapeHtml(chapter.summary)}</p>`,
        `<h3>What to Know</h3><ul>${know}</ul>`,
        `<h3>How to Apply It</h3><ul>${apply}</ul>`,
        `<blockquote>${escapeHtml(chapter.tip)}</blockquote>`,
        `</section>`,
      ].join("");
    })
    .join("\n");

  const resourceBlocks = resources
    .map((resource) => `<li><a href="${escapeHtml(resource.url)}">${escapeHtml(resource.name)}</a></li>`)
    .join("\n");

  return [
    "<!DOCTYPE html>",
    "<html lang=\"en\">",
    "<head>",
    "<meta charset=\"UTF-8\" />",
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />",
    "<title>Toastmasters New Member Onboarding Guide</title>",
    "<style>",
    "body{font-family:Georgia,serif;margin:2rem auto;max-width:900px;line-height:1.6;color:#222;padding:0 1rem;}",
    "h1,h2,h3{font-family:'Trebuchet MS',sans-serif;}",
    ".chapter{margin:0 0 2rem;padding:1rem 1.1rem;border:1px solid #ddd;border-radius:12px;}",
    ".kicker{text-transform:uppercase;font-size:.75rem;letter-spacing:.14em;font-weight:700;color:#555;margin:0;}",
    "blockquote{margin:1rem 0 0;padding:.6rem .8rem;border-left:4px solid #c49102;background:#faf7ef;}",
    "a{color:#004165;text-decoration:none;}a:hover{text-decoration:underline;}",
    "</style>",
    "</head>",
    "<body>",
    "<h1>Toastmasters New Member Onboarding Guide</h1>",
    "<p>This guide is designed to help new members understand Toastmasters and succeed in their first 90 days.</p>",
    chapterBlocks,
    "<section>",
    "<h2>Official Resources</h2>",
    `<ul>${resourceBlocks}</ul>`,
    "</section>",
    "</body>",
    "</html>",
  ].join("\n");
}

function buildEbookMarkdown() {
  const chapterBlocks = chapters
    .map((chapter, index) => {
      const know = chapter.know.map((item) => `- ${item}`).join("\n");
      const apply = chapter.apply.map((item) => `- ${item}`).join("\n");
      return [
        `## ${index + 1}. ${chapter.title}`,
        `**${chapter.kicker}**`,
        "",
        chapter.summary,
        "",
        "### What to Know",
        know,
        "",
        "### How to Apply It",
        apply,
        "",
        `> ${chapter.tip}`,
      ].join("\n");
    })
    .join("\n\n");

  const resourceBlocks = resources.map((resource) => `- [${resource.name}](${resource.url})`).join("\n");

  return [
    "# Toastmasters New Member Onboarding Guide",
    "",
    "A practical onboarding resource for new members, mentors, and club officers.",
    "",
    chapterBlocks,
    "",
    "## Official Resources",
    resourceBlocks,
  ].join("\n");
}

function downloadBlob(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
