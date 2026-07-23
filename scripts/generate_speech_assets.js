#!/usr/bin/env node
/*
  Generate Markdown and slideshow HTML files for speech_*.txt sources in speeches/.
  Usage:
    node scripts/generate_speech_assets.js
    node scripts/generate_speech_assets.js --watch
    node scripts/generate_speech_assets.js --file speeches/speech_example.txt
*/

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const SPEECHES_DIR = path.join(ROOT_DIR, "speeches");
const TXT_PREFIX = "speech_";
const MANIFEST_FILENAME = "index.json";

function parseArgs(argv) {
  const args = {
    watch: false,
    file: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--watch") {
      args.watch = true;
      continue;
    }
    if (token === "--file") {
      args.file = argv[i + 1] || null;
      i += 1;
    }
  }

  return args;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function isSpeechTxt(filename) {
  return filename.toLowerCase().startsWith(TXT_PREFIX) && filename.toLowerCase().endsWith(".txt");
}

function isSpeechHtml(filename) {
  const lowered = filename.toLowerCase();
  return lowered.startsWith(TXT_PREFIX) && lowered.endsWith(".html") && lowered !== "speech_template.html";
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return null;
  }
}

function toSpeechId(filename) {
  return filename.replace(/\.html$/i, "");
}

function titleFromHtml(htmlContent, fallbackTitle) {
  const match = /<title>([^<]+)<\/title>/i.exec(htmlContent || "");
  return (match && match[1] ? match[1].trim() : fallbackTitle) || fallbackTitle;
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function summaryFromHtml(htmlContent, fallbackTitle) {
  const leadMatch = /<p\s+class=\"lead\">([\s\S]*?)<\/p>/i.exec(htmlContent || "");
  if (leadMatch && leadMatch[1]) {
    return decodeHtml(leadMatch[1].replace(/<[^>]*>/g, "").trim());
  }

  const descMatch = /<meta\s+name=\"description\"\s+content=\"([^\"]*)\"\s*\/>/i.exec(htmlContent || "");
  if (descMatch && descMatch[1]) {
    return decodeHtml(descMatch[1].trim());
  }

  return `Toastmasters speech deck for ${fallbackTitle}.`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitBlocks(lines) {
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (!line.trim()) {
      if (current.length) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    current.push(line.trim());
  }

  if (current.length) {
    blocks.push(current);
  }

  return blocks;
}

function isOrderedBlock(lines) {
  return lines.every((line) => /^\d+\.\s+/.test(line));
}

function isBulletBlock(lines) {
  return lines.every((line) => /^[-*]\s+/.test(line));
}

function isLikelyListBlock(lines) {
  if (lines.length < 3) {
    return false;
  }

  return lines.every((line) => {
    if (/[.!?]$/.test(line)) {
      return false;
    }
    return line.length <= 120;
  });
}

function normalizeTitle(raw) {
  return raw.replace(/^#+\s*/, "").trim() || "Untitled Speech";
}

function formatFromTxt(txtContent) {
  const lines = txtContent
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }
  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  if (!lines.length) {
    return {
      title: "Untitled Speech",
      markdown: "# Untitled Speech\n\n",
      contentBlocks: [],
    };
  }

  const title = normalizeTitle(lines[0]);
  const bodyLines = lines.slice(1);
  const rawBlocks = splitBlocks(bodyLines);

  const contentBlocks = rawBlocks.map((rawBlock) => {
    if (isOrderedBlock(rawBlock)) {
      const items = rawBlock.map((line) => line.replace(/^\d+\.\s+/, "").trim()).filter(Boolean);
      return { type: "ol", items };
    }

    if (isBulletBlock(rawBlock)) {
      const items = rawBlock.map((line) => line.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
      return { type: "ul", items };
    }

    if (isLikelyListBlock(rawBlock)) {
      return { type: "ul", items: rawBlock.map((line) => line.trim()).filter(Boolean) };
    }

    const paragraph = rawBlock.join(" ").replace(/\s+/g, " ").trim();
    return { type: "p", text: paragraph };
  });

  const mdLines = [`# ${title}`, ""];

  for (const block of contentBlocks) {
    if (block.type === "p") {
      mdLines.push(block.text, "");
      continue;
    }

    if (block.type === "ol") {
      block.items.forEach((item, index) => {
        mdLines.push(`${index + 1}. ${item}`);
      });
      mdLines.push("");
      continue;
    }

    if (block.type === "ul") {
      block.items.forEach((item) => {
        mdLines.push(`- ${item}`);
      });
      mdLines.push("");
    }
  }

  return {
    title,
    markdown: `${mdLines.join("\n").trim()}\n`,
    contentBlocks,
  };
}

function firstParagraph(blocks) {
  for (const block of blocks) {
    if (block.type === "p" && block.text) {
      return block.text;
    }
  }
  return "A Toastmasters speech presentation.";
}

function shortHeading(text, fallback) {
  const source = text.split(/[.?!]/)[0].trim() || text.trim();
  if (!source) {
    return fallback;
  }
  const words = source.split(/\s+/).slice(0, 7);
  let heading = words.join(" ");
  if (heading.length > 55) {
    heading = `${heading.slice(0, 52)}...`;
  }
  return heading;
}

function splitLongList(items) {
  if (items.length <= 5) {
    return [items];
  }

  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}

function buildSlideModels(title, blocks) {
  const lead = firstParagraph(blocks);
  const slides = [
    {
      kicker: "Toastmasters Speech",
      title,
      lead,
      body: [],
    },
  ];

  let count = 1;

  for (const block of blocks) {
    if (block.type === "p") {
      slides.push({
        kicker: "Message",
        title: shortHeading(block.text, `Point ${count}`),
        lead: "",
        body: [{ type: "p", text: block.text }],
      });
      count += 1;
      continue;
    }

    if (block.type === "ol" || block.type === "ul") {
      const chunks = splitLongList(block.items);
      for (let index = 0; index < chunks.length; index += 1) {
        const suffix = chunks.length > 1 ? ` (${index + 1}/${chunks.length})` : "";
        slides.push({
          kicker: "Key Points",
          title: `Action Steps${suffix}`,
          lead: "",
          body: [{ type: block.type, items: chunks[index] }],
        });
        count += 1;
      }
    }
  }

  return slides;
}

function renderBlockHtml(block) {
  if (block.type === "p") {
    return `<p>${escapeHtml(block.text)}</p>`;
  }

  if (block.type === "ol") {
    const items = block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    return `<ol>${items}</ol>`;
  }

  const items = block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<ul>${items}</ul>`;
}

function renderSlidesHtml(slides) {
  return slides
    .map((slide, index) => {
      const isActive = index === 0;
      const headingTag = index === 0 ? "h1" : "h2";
      const titleHtml = `<${headingTag}>${escapeHtml(slide.title)}</${headingTag}>`;
      const leadHtml = slide.lead ? `<p class=\"lead\">${escapeHtml(slide.lead)}</p>` : "";
      const bodyHtml = slide.body.map(renderBlockHtml).join("\n        ");

      return `
    <section class=\"slide${isActive ? " active" : ""}\" id=\"slide-${index + 1}\" aria-hidden=\"${isActive ? "false" : "true"}\">
      <article class=\"card\">
        <p class=\"kicker\">${escapeHtml(slide.kicker)}</p>
        ${titleHtml}
        ${leadHtml}
        ${bodyHtml}
      </article>
    </section>`;
    })
    .join("\n");
}

function buildHtml(title, contentBlocks) {
  const slides = buildSlideModels(title, contentBlocks);
  const slidesHtml = renderSlidesHtml(slides);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="Toastmasters speech slide deck for ${escapeHtml(title)}." />
  <link rel="stylesheet" href="slides.css" />
</head>
<body>
  <main class="deck" aria-live="polite">${slidesHtml}
  </main>

  <footer class="controls" aria-label="Slide controls">
    <div class="controls-left">
      <button type="button" data-action="prev" aria-label="Previous slide">Previous</button>
      <button type="button" data-action="next" aria-label="Next slide">Next</button>
      <span class="hint">Keys: Left/Right, PageUp/PageDown, Space</span>
    </div>
    <div class="progress-wrap" aria-label="Presentation progress">
      <div class="progress" role="progressbar" aria-label="Slide progress" aria-valuemin="1" aria-valuemax="${slides.length}" aria-valuenow="1">
        <div class="progress-fill"></div>
      </div>
      <span class="progress-text">Slide 1/${slides.length}</span>
    </div>
  </footer>

  <script src="slides.js"></script>
</body>
</html>
`;
}

function ensureRequiredSlideAssets() {
  const required = ["slides.css", "slides.js"];
  const missing = required.filter((file) => !fs.existsSync(path.join(SPEECHES_DIR, file)));
  if (missing.length) {
    console.warn(`[warn] Missing shared slideshow assets: ${missing.join(", ")}`);
    console.warn("[warn] Create these files in speeches/ before opening generated HTML decks.");
  }
}

function generateForTxtFile(txtPath) {
  const source = safeRead(txtPath);
  if (source == null) {
    console.error(`[error] Could not read ${toPosix(path.relative(ROOT_DIR, txtPath))}`);
    return;
  }

  const baseName = path.basename(txtPath, ".txt");
  const mdPath = path.join(path.dirname(txtPath), `${baseName}.md`);
  const htmlPath = path.join(path.dirname(txtPath), `${baseName}.html`);

  const { title, markdown, contentBlocks } = formatFromTxt(source);
  const html = buildHtml(title, contentBlocks);

  fs.writeFileSync(mdPath, markdown, "utf8");
  fs.writeFileSync(htmlPath, html, "utf8");

  console.log(`[ok] ${toPosix(path.relative(ROOT_DIR, txtPath))}`);
  console.log(`     -> ${toPosix(path.relative(ROOT_DIR, mdPath))}`);
  console.log(`     -> ${toPosix(path.relative(ROOT_DIR, htmlPath))}`);
}

function discoverSpeechTxtFiles() {
  if (!fs.existsSync(SPEECHES_DIR)) {
    console.error("[error] speeches/ directory does not exist.");
    return [];
  }

  return fs
    .readdirSync(SPEECHES_DIR)
    .filter(isSpeechTxt)
    .map((file) => path.join(SPEECHES_DIR, file));
}

function resolveTargetFiles(inputFile) {
  if (!inputFile) {
    return discoverSpeechTxtFiles();
  }

  const resolved = path.isAbsolute(inputFile) ? inputFile : path.join(ROOT_DIR, inputFile);
  if (!fs.existsSync(resolved)) {
    console.error(`[error] File not found: ${toPosix(path.relative(ROOT_DIR, resolved))}`);
    return [];
  }

  if (!isSpeechTxt(path.basename(resolved))) {
    console.error("[error] Input file must start with speech_ and end with .txt");
    return [];
  }

  return [resolved];
}

function generateSpeechManifest() {
  if (!fs.existsSync(SPEECHES_DIR)) {
    return null;
  }

  const speechHtmlFiles = fs
    .readdirSync(SPEECHES_DIR)
    .filter(isSpeechHtml)
    .sort((a, b) => a.localeCompare(b));

  const entries = speechHtmlFiles
    .map((filename) => {
      const absolutePath = path.join(SPEECHES_DIR, filename);
      const html = safeRead(absolutePath);
      const id = toSpeechId(filename);
      const title = titleFromHtml(html, id.replace(/^speech_/, "").replace(/_/g, " "));
      const summary = summaryFromHtml(html, title);
      const updatedAt = fs.statSync(absolutePath).mtime.toISOString();

      return {
        id,
        title,
        summary,
        htmlPath: `speeches/${filename}`,
        markdownPath: `speeches/${id}.md`,
        updatedAt,
      };
    });

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: entries.length,
    speeches: entries,
  };

  const outputPath = path.join(SPEECHES_DIR, MANIFEST_FILENAME);
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return {
    outputPath,
    count: entries.length,
  };
}

function runOnce(args) {
  ensureRequiredSlideAssets();
  const files = resolveTargetFiles(args.file);
  if (!files.length && args.file) {
    console.log("[info] No matching speech_*.txt files found.");
  } else {
    files.forEach(generateForTxtFile);
  }

  const manifestResult = generateSpeechManifest();
  if (manifestResult) {
    console.log(`[ok] ${toPosix(path.relative(ROOT_DIR, manifestResult.outputPath))}`);
    console.log(`     -> Indexed ${manifestResult.count} speech deck(s)`);
  }
}

function runWatch(args) {
  ensureRequiredSlideAssets();
  runOnce(args);

  console.log("[watch] Watching speeches/ for speech_*.txt changes...");

  const pending = new Map();

  fs.watch(SPEECHES_DIR, (eventType, filename) => {
    if (!filename || !isSpeechTxt(filename)) {
      return;
    }

    const fullPath = path.join(SPEECHES_DIR, filename);

    if (pending.has(fullPath)) {
      clearTimeout(pending.get(fullPath));
    }

    const timer = setTimeout(() => {
      pending.delete(fullPath);
      if (!fs.existsSync(fullPath)) {
        generateSpeechManifest();
        return;
      }
      console.log(`[watch] ${eventType}: ${toPosix(path.relative(ROOT_DIR, fullPath))}`);
      generateForTxtFile(fullPath);
      const manifestResult = generateSpeechManifest();
      if (manifestResult) {
        console.log(`[ok] ${toPosix(path.relative(ROOT_DIR, manifestResult.outputPath))}`);
        console.log(`     -> Indexed ${manifestResult.count} speech deck(s)`);
      }
    }, 180);

    pending.set(fullPath, timer);
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.watch) {
    runWatch(args);
    return;
  }
  runOnce(args);
}

main();
