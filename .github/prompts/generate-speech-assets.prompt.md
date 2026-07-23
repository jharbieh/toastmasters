---
mode: ask
description: Generate speech markdown and slideshow from speech_*.txt in speeches/
---
Generate and/or refresh speech presentation assets in this repository.

Workflow:
1. Ensure the source file is in speeches/ and follows speech_*.txt naming.
2. Run:
   - node scripts/generate_speech_assets.js --file <path> for one file, or
   - node scripts/generate_speech_assets.js for all files.
3. Verify generated outputs exist with same base name:
   - .md (formatted markdown)
   - .html (local slideshow)
4. If requested for continuous automation, run watch mode:
   - node scripts/generate_speech_assets.js --watch
5. Summarize what files were generated and how to open the slideshow.

Constraints:
- Do not overwrite slides.css or slides.js unless explicitly asked.
- Keep output local and lightweight (no external CDN/framework requirement).
- Preserve speaker wording as much as possible while improving formatting.
