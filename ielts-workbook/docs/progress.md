# Development checkpoint 2026-11-10

This is NOT the complete approved workbook. Do not present it as finished.

Implemented: private JSON book import, IndexedDB book/answer/range storage, exact word+punctuation+space counting, body pagination, long-reading dialog with questions, original page image view, native range underline and vocabulary collection, choice/fill/matching/writing controls, backup export/import, reduced-motion animation.

Verified: seven Node tests; cloud Chrome UI demonstration choice/fill/match/writing survives reload. Android long-press and real book import not yet acceptance tested. Independent reviewer found malformed import/backup and empty page issues; schema/empty-page fixes applied with regression tests. Large question groups are separately paged; single questions >300 units are rejected pending content-level splitting.

Incomplete: OCR text/layout correction, exercise mapping across the book, original-page answer overlays, drawn matching lines (currently paired buttons), annotation undo outside reading dialog, translation, original audio, OSS speech, dictation, AI dialogue. No fake AI responses, no paid service or credentials used.

OCR export: 136 source pages, all unverified. Image+OCR package private and excluded from repository. Layout-preserving reconstruction has not been completed. Generic OCR blocks are provisionally reading blocks, not pedagogically classified.

Rulings: React/Vite/TS was tentative in approved plan; dependencies unavailable in current environment. Development foundation uses buildless ES modules and native Node tests. No runtime third-party dependencies. Existing public repository preserved, new branch/subdirectory only. Vercel app shell contains no textbook; Sites is private entry, not Vercel access control.

## 2026-11-11 update

The private package now contains 136 original images, 14 linked reading tasks, 14 full writing prompts and 311 answer entries. Entries comprise typed exercises and numbered answers beside original question images. Text of the entire workbook is still pending manual proofing. All scan pages accept normalized freehand strokes, straight lines and positioned text. These marks are separate from structured answers. The revised package retains previous OCR blocks where a saved underline refers to them.

6,177 synthetic English pronunciation clips use CMU Flite and IMA ADPCM. Saved vocabulary can be played and tested without a network. Listening exercise recordings require a user's publisher audio file, attached per page. Recording files are stored on the device separately from progress backups.

Text chat uses local Qwen2.5-0.5B-Instruct, machine translation uses OPUS-MT en-zh, and common glossary entries work offline. Voice input uses local Whisper and general voice output has an optional Kokoro fallback. First use downloads model weights. No paid endpoint is configured.

Cloud Chrome imported the real learning package and verified answer reuse across two original pages, native desktop selection, vocabulary collection and dictation feedback. Text generation and machine translation both produced responses. Translation of a short sentence repeated part of its output, so model quality remains a limitation. Android long-press, microphone recognition on a real handset, general TTS and publisher recordings have not been verified. Nine Node regression tests pass.
