# IELTS mobile workbook — development foundation

This is an unfinished implementation; see docs/progress.md and the approved plan.

Run tests: `npm test`. Serve `public/` with any static web server. No install or build is required. Vercel root: `ielts-workbook`; output: `public`; build/install commands empty.

Private source PDF and generated `*.study.json` MUST NOT be committed. Generate an unverified package with `python scripts/extract_book.py /path/book.pdf /private/book.study.json`, then import in browser. Requires PyMuPDF/Tesseract in conversion environment only. OCR is not an answer key. Backup records via the UI before clearing browser data.
