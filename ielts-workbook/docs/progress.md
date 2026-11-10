# Development checkpoint 2026-11-10

This is NOT the complete approved workbook. Do not present it as finished.

Implemented: private JSON book import, IndexedDB book/answer/range storage, exact word+punctuation+space counting, body pagination, long-reading dialog with questions, original page image view, native range underline and vocabulary collection, choice/fill/matching/writing controls, backup export/import, reduced-motion animation.

Verified: seven Node tests; cloud Chrome UI demonstration choice/fill/match/writing survives reload. Android long-press and real book import not yet acceptance tested. Independent reviewer found malformed import/backup and empty page issues; schema/empty-page fixes applied with regression tests. Large question groups are separately paged; single questions >300 units are rejected pending content-level splitting.

Incomplete: OCR text/layout correction, exercise mapping across the book, original-page answer overlays, drawn matching lines (currently paired buttons), annotation undo outside reading dialog, translation, original audio, OSS speech, dictation, AI dialogue. No fake AI responses, no paid service or credentials used.

OCR export: 136 source pages, all unverified. Image+OCR package private and excluded from repository. Layout-preserving reconstruction has not been completed. Generic OCR blocks are provisionally reading blocks, not pedagogically classified.

Rulings: React/Vite/TS was tentative in approved plan; dependencies unavailable in current environment. Development foundation uses buildless ES modules and native Node tests. No runtime third-party dependencies. Existing public repository preserved, new branch/subdirectory only. Vercel app shell contains no textbook; Sites is private entry, not Vercel access control.
