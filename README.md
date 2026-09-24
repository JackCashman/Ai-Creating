# Scene English

Existing course UI extended with contextual AI, opt-in browser speech recognition, a theme expression bank and adaptive spaced review. Original device-local `sceneEnglishV1`/`sceneEnglishV2` records are preserved; the bank uses `sceneEnglishBankV1`. No cross-device synchronization or closed-page push is promised.

Source assets live in `public/`; `worker/index.js` implements server-only integrations and serves embedded assets. `npm run build` emits the Cloudflare ESM Worker. `npm test` checks legacy learning, new UI state, scheduling, API input/security guards and fixture-based provider adapters. No live credentials were available during implementation. Model relevance quality, dictionary contract access and browser microphone behavior must be tested with authorized services before declaring these integrations operational.

## Runtime configuration

All real keys must be Sites runtime secrets, never committed or placed in the browser. `.env.example` lists names only. The installed OpenAI Developers trusted `openai-platform-api-key` skill must be available and its approval workflow completed before creating/reusing an OpenAI key. The current session exposed connector tools but did not expose that skill; no key was created. Set `OPENAI_API_KEY` after secure authorization. `OPENAI_MODEL` defaults to `gpt-4.1-mini` with Responses structured outputs and `store:false`.

Oxford needs authorized `OXFORD_APP_ID` and `OXFORD_APP_KEY`. Its adapter reads British English Entries definitions/examples. Collins needs `COLLINS_API_KEY` and the **actual licensed** `COLLINS_DICTIONARY_CODE`; no code or contract is guessed. Both adapters are pending live authorization tests. Public official dictionary links work independently. Dictionary API response content is displayed as text, not executed or injected; official definitions are not automatically copied to durable storage. Users write their own meaning notes.

Private Sites dispatch supplies the authenticated-user header; APIs reject missing identity and cross-origin POSTs. The existing owner-only access policy must be retained. No public AI endpoint or client key input is provided.

## Learning behavior

The course topic is server-owned. The learner adds scenario details and goals. Recent 12 turns are sent; older turns remain local. Off-topic model results force a retry and cannot increase successful response count. Clarification/repetition/translation, partial sentences and mixed-language attempts must not be rejected just for lacking keywords. Feedback targets a single point and asks immediate re-expression. Model judgments can be wrong; learner can explain relevance. Never infer pronunciation from text.

Speech input uses browser recognition with explicit consent (the browser service may process audio remotely). Text is shown for confirmation and never auto-sent. The original local recorder remains separate.

A/B expression items enter the due queue; C pauses. Default intervals are 1/3/7/14/30/60 days from successful recall, not a scientific personalized forgetting function. Again schedules 10 minutes and resets the stage; Hard shortens spacing without advancing; Good advances one step; Easy skips one step. Blank recall cannot claim independent success; answers lock after reveal. Review evidence and personal examples export as JSON.

## Sources

- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/models/gpt-4.1-mini
- https://developer.oxforddictionaries.com/documentation/making-requests-to-the-api
- https://api.collinsdictionary.com/api/v1/documentation/html
- https://www.collinsdictionary.com/collins-api
