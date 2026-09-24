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

## 每日微型单元（本次更新）

进入课程后默认打开“每日单元”。每课最多五个同主题原创表达，按理解、听辨、连接、个人造句、隐藏答案提取、真实输出与修改运行。合成示范不冒充视频原声。首次使用先完成提取及两次输出；已有历史时还需先回忆旧内容。过程保存在原课程记录的 `micro` 字段，不删除旧学习记录，不以完成单元授予等级。提示使用和首次回忆保留；草稿可跨课程切换恢复。

表达首次复习按当前间隔列表首项安排（默认次日）。表达 JSON 备份可从“复习计划与数据”恢复：校验完整文件后再写入，按条目ID或主题与表达去重，保留本地已有内容与间隔设置。备份限5MB；仅包含表达及其复习历史，不包含课程对话、单元记录或录音。

### 使用与验证

- 网站：原有 Scene English Site，保持原有私有访问。
- 源码：https://github.com/JackCashman/Ai-Creating
- 本地校验：先 `npm run build`，再 `npm test`；无需安装第三方依赖。
- 部署：构建输出是 Worker ESM，依赖 Sites 私有身份代理，不能直接作为 GitHub Pages 的完整服务部署。迁移至其他平台需实现可信服务端鉴权，不能接受客户端自行提供的身份头。
- 新增回归：空单元不能完成、隐藏答案后才可提交、初次回忆保留、课程草稿隔离、提示证据不清零、首次复习次日、备份去重与无效文件拒绝。
- 测试使用本地 DOM 桩及模拟服务；未完成真实手机、麦克风、YouTube字幕与付费API联调。
