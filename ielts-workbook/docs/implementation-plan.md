# IELTS 手机交互练习册 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 若用户选择分工执行，改用 superpowers:subagent-driven-development；不得默认启动执行者。

**Goal:** 将用户提供的 Ready for IELTS Workbook 转换为保留原书结构、支持手机大字阅读和作答的网页，逐步接入教材音频与免费开源 AI。

**Architecture:** 原书页图、校对后的文字和题目结构分别保存，通过稳定的页码、题号、文本位置关联。浏览器负责阅读、题目交互、划线和本地学习记录；音频及 AI 使用独立适配接口，服务不可用时核心练习仍可使用。

**Tech Stack:** 拟采用 TypeScript、React、Vite、IndexedDB；离线内容转换使用 Python、PyMuPDF 和开源 OCR；逻辑测试使用 Vitest，浏览器测试使用 Playwright。版本、许可证和运行环境在实施前核实并锁定，当前未安装或验证这些项目依赖。

**Spec:** 本文件“已确认需求与实现约定”一节。未来进入代码仓库后，将本文件放入 `docs/superpowers/plans/2026-11-10-ielts-workbook.md`，保持需求与计划一起交付。

## 当前状态

- 用户已批准手机原型的交互方向，并要求删除“点选划线”、尽量保留原书版面。
- 此次通过的是局部原型，不代表全书转换、音频、AI、长期保存或手机实机测试已经完成。
- 已检查附件共 136 页，是扫描型 PDF；初次检查未发现文本层、嵌入音频及可直接使用的资源链接。
- 部分临时原型被工作区维护清理；可根据对话重建。原型不作为正式项目或数据存储。
- 本计划尚待实施。免费云端 AI 的可用提供方、具体模型及教材音频来源尚未核实；不得写成已接通。

## 已确认需求与实现约定

### A. 使用条件

1. 手机网页优先，用户没有可持续开机的模型运行电脑。
2. 只用免费能力、开源模型，不接入付费 API；不得自动升级、充值或产生超额费用。
3. 用户接受免费云端服务的额度、排队或中断限制；额度耗尽时停用相关 AI，保留阅读与练习。
4. AI 目标包含文字交流、英语语音输入、AI 语音回应、表达纠正、围绕题目追问、翻译与写作反馈。

### B. 原书与手机排版

1. 尽量保留原书标题、段落、插图、表格、题号、题序和选项顺序，不能用“原书对照”代替主视图的版面保留。
2. 手机上放大文字，提供翻书动画；原书页码与手机分页编号同时可定位。
3. 每个手机内容页不超过 300 计数单位；题目与选项尽量完整同页。用户定义的单位为“英文单词＋标点＋空格”，不是字符数或单纯词数。
4. 阅读材料不超过 100 时尽量与题同页；超过 100 时有独立的阅读材料入口，以可展开浮窗呈现。
5. 点击长材料浮窗后，上方阅读、下方显示相关题目并可作答。长材料超过 300 时分段；不能删减材料来满足上限。
6. 300 是内容上限，不要求塞满。若文字放大、表格或题组占用空间，允许更早分页。
7. 原书布局与大字、300 上限冲突时，优先保留内容、题序、段落关系和可读字号，进行最小必要拆页；提供原页对照。

以下是实施默认值，并非用户逐项指定：正文默认 20 px，浮窗正文 22 px；计数排除导航和状态文字，包含教材正文、题干和选项；答案不参与重新分页以免输入时跳页。OCR 排版换行还原为一个空格，语义分段另存；正文中真实连续空格逐个计数。英文缩约词和连字符复合词暂按一个词计，同时其中标点各计一次；这些规则必须在测试中固定。

### C. 作答与划线

1. 连线、单选/多选、填空、写作电子化；题目仍保持对应原页关系。
2. 写作有草稿保存；允许在较大的输入区输入并回到原题。
3. 只保留系统长按/拖动选择文字后划线，可撤销。删除点选起止词的划线模式及按钮。
4. 划线在收起浮窗、切换题目、翻页及刷新后保留；跨行选区不能漏字、扩大到整词或错位。
5. 可将选中的词/短语加入单词本，保存来源页码与原句；提供翻译和听写。
6. 作答、连线、选择文本时不触发滑动翻页；保留独立翻页按钮，动画遵循减少动态效果设置。

### D. 音频、数据与交付

1. 教材配套音频按题目或音轨编号映射，点击可播放。原版录音与模型合成语音明确区分。
2. 尚未取得或无法核实的音频显示不可用原因，不挂虚假播放按钮，不用模型朗读冒充教材音频。
3. 默认学习数据保存在当前设备，提供导出/导入；不宣称本地存储等于永久备份或跨设备同步。
4. 正式版默认私人使用。教材文件不提交到公开仓库，也不在未确认访问控制时公开发布。
5. 麦克风只在用户操作后启用；AI 仅发送本次问题所需的内容，不上传整书或整个学习记录。
6. 若免费资源无法支持某项 AI 能力，报告具体缺项，不以预置答复假装模型结果。

## Global Constraints

- 手机网页优先，用户没有可持续开机的模型运行电脑。
- 只用免费能力、开源模型，不接入付费 API；不得自动升级、充值或产生超额费用。
- 每个手机内容页不超过 300 计数单位。
- 阅读材料超过 100 时有独立的阅读材料入口，以可展开浮窗呈现。
- 点击长材料浮窗后，上方阅读、下方显示相关题目并可作答。
- 删除点选起止词的划线模式及按钮。
- 尽量保留原书标题、段落、插图、表格、题号、题序和选项顺序。

## Review Focus

1. 扫描识别把否定词、题号、标点或多选说明识错：逐题对照原页，未校对题不进入自动评分（任务 1、3）。
2. 长选区跨行、缩放、分页或重新加载后错位：用稳定文字位置定位，不只存像素坐标（任务 4）。
3. 浏览器空间不足、清理或异常刷新：显式提示保存失败，支持恢复备份，不假报已保存（任务 5）。
4. 麦克风权限拒绝、音频失效、服务超额：清晰退回文字或核心练习，不丢草稿、不转付费（任务 6、7）。
5. 100/300 边界与长题组：保持所有内容、明确分段导航，不截断原文、不把浮窗题目挤出可访问区域（任务 2）。

## 文件与接口结构（计划创建）

| 路径 | 职责 |
|---|---|
| `content/book.json` | 版本、原书页码、章节、块、题目与资源映射 |
| `content/pages/` | 页图；受访问范围约束，不放公开仓库 |
| `scripts/extract_book.py` | 页图、OCR 和坐标输出 |
| `src/content/types.ts` | 内容契约和稳定 ID |
| `src/reader/count.ts`, `paginate.ts`, `Reader.tsx`, `ReadingPanel.tsx` | 计数、分页、原页布局、浮窗、翻页 |
| `src/exercises/Exercise.tsx`, `grade.ts` | 连线、选择、填空、写作与答案核验 |
| `src/annotations/ranges.ts`, `SelectionToolbar.tsx` | 原生选区、划线、撤销、收藏入口 |
| `src/study/store.ts`, `Wordbook.tsx`, `Dictation.tsx` | 本地记录、备份、单词本、听写 |
| `src/media/audio.ts`, `AudioPlayer.tsx` | 教材音频、移动端播放及失败处理 |
| `src/ai/contracts.ts`, `client.ts`, `Tutor.tsx` | AI、翻译、语音适配与状态 |
| `server/ai-proxy.ts` | 仅在选定服务需要密钥代理时创建；密钥不入前端 |
| `tests/`, `e2e/`, `docs/verification.md` | 可复现验证与实际限制 |

核心类型统一：`BookBlock {id,sourcePage,text,bbox,kind,reviewStatus}`；`Exercise {id,sourcePage,blockIds,type,prompt,options,acceptedAnswers,reviewStatus}`；`TextRange {blockId,start,end,textVersion}`；`AIResult<T> {status:'ok'|'unavailable'|'quota'|'error',value?:T,message?:string}`。bbox 使用相对于原页的坐标；start/end 是同一规范化文本版本的 UTF-16 偏移。答案以 exerciseId 存储，不能以手机页索引作为键。

## 实施顺序

### 任务 1：原书内容与资源清点

**Files:** `scripts/extract_book.py`, `src/content/types.ts`, `content/book.json`, `tests/content.test.ts`, `docs/resource-audit.md`。

**Interfaces:** 输出 `BookBlock[]`、`Exercise[]` 和资源映射；未校对标记 `reviewStatus:'pending'`。

- [ ] 检查实际项目环境与依赖；创建项目基础和锁文件。核对 PDF 哈希、136 页索引及书面页码。
- [ ] 建立首个真实单元的页图与 OCR，逐题核对题号、否定词、多选说明、答案和阅读材料关联；写出具体差异，不以 OCR 置信度替代校对。
- [ ] 测试：`sourcePages.length === 136`、ID 无重复、所有题目 sourcePage 存在、未校对题不能自动评分；运行 `npm test -- tests/content.test.ts`，先观察失败再实现约束并通过。
- [ ] 从书中版权/资源说明定位官方配套资源，核验版本、音轨及访问条件；记录已找到、需用户资源、不可用三种状态。
- [ ] 首单元校对通过后按同样流程扩展全书；每批输出已校对题数与剩余页数，保存阶段成果。
- [ ] 提交内容契约、脚本及已获准存储的资料；源书私有文件单独管理。

### 任务 2：大字原页阅读与浮窗

**Files:** `src/reader/count.ts`, `paginate.ts`, `Reader.tsx`, `ReadingPanel.tsx`, `tests/pagination.test.ts`, `e2e/reader.spec.ts`。

**Interfaces:** `countUnits(text:string):number`；`paginate(blocks:BookBlock[],limit:number):PageSegment[]`；`PageSegment {id,sourcePage,blockIds,units}`；`readingMode(text:string):'inline'|'panel'`。

- [ ] 测试 `countUnits('Hello, world!') === 5`；构造总数 99/100/101 的材料，断言 100 仍同页，101 为浮窗入口；299/300/301 验证分页不超 300。
- [ ] 运行 `npm test -- tests/pagination.test.ts` 观察失败；实现计数和分页。对极长块按句、词边界拆分，保留源文本映射；总内容前后对比一致。
- [ ] 实现原书块定位、最小重排、大字号、原页对照和翻页。一个长题组必要拆分时重复题干导航而不漏选项。
- [ ] 实现材料独立入口与浮窗展开；上方材料、下方相关题目。浮窗内翻段只换材料段，不清除题目答案。
- [ ] `npx playwright test e2e/reader.spec.ts` 验证 320/360/390/430 px、旋转、长表格、301 单位材料、减少动画设置；无水平意外溢出、遗漏或不可访问题目。
- [ ] 测试通过后提交。

### 任务 3：电子作答与写作

**Files:** `src/exercises/Exercise.tsx`, `grade.ts`, `tests/exercises.test.ts`, `e2e/exercises.spec.ts`。

**Interfaces:** `grade(exercise:Exercise,answer:unknown):{status:'correct'|'incorrect'|'ungraded',feedback:string}`；所有写入调用任务 5 的 `saveRecord`，初期使用同接口内存适配。

- [ ] 编写并运行失败测试：多选按集合比较；填空按本题允许答案判断；未校对题返回 `ungraded`；写作不输出伪造 IELTS 分数。
- [ ] 实现选择、填空、触摸连线与可撤销连线；写作大输入区、词数与草稿回显。连接与选择操作不能触发翻页。
- [ ] `npm test -- tests/exercises.test.ts` 和 `npx playwright test e2e/exercises.spec.ts`：检验换页返回、浮窗收起、软键盘弹出、连线修改时答案不丢失。
- [ ] 提交本任务。

### 任务 4：长按划线与文本定位

**Files:** `src/annotations/ranges.ts`, `SelectionToolbar.tsx`, `tests/ranges.test.ts`, `e2e/selection.spec.ts`。

**Interfaces:** `captureRange(selection:Selection,blockId:string):TextRange|null`；`renderRanges(text:string,ranges:TextRange[]):RenderedRange[]`；`RenderedRange {start,end,underlined}`。

- [ ] 测试选中半个词、跨行、多个重叠范围、中文译文不属于原文、不同文本版本；断言渲染范围与原选区逐字符一致。
- [ ] 实现系统选区捕获、划线、撤销及选词收藏；删除点选划线按钮和状态，不保留隐藏替代模式。选区跨块时拆成各块合法范围。
- [ ] `npm test -- tests/ranges.test.ts`；`npx playwright test e2e/selection.spec.ts` 验证收起重开、缩放重排、翻页后定位与撤销。
- [ ] 用真实 Android 浏览器手工确认长按菜单、拖动选择把手与划线按钮共存；自动化成功不能替代这项实测。记录浏览器、步骤和结果。
- [ ] 提交本任务。

### 任务 5：保存、单词本、听写与备份

**Files:** `src/study/store.ts`, `Wordbook.tsx`, `Dictation.tsx`, `tests/store.test.ts`, `e2e/study.spec.ts`。

**Interfaces:** `saveRecord(kind:string,id:string,value:unknown):Promise<void>`；`loadRecord(kind:string,id:string):Promise<unknown>`；`exportStudy():Promise<Blob>`；`importStudy(blob:Blob):Promise<{imported:number}>`。导入前进行版本和结构验证。

- [ ] 失败测试覆盖同词去重但保留多个来源、导入恶意字段不执行、错误版本不覆盖已有数据、模拟配额耗尽返回保存错误。
- [ ] 实现 IndexedDB 答案、写作草稿、划线、单词/短语、听写记录；失败时保留内存草稿并提示导出，不能显示“已保存”。
- [ ] 接入选词收藏，保存原句及页码。听写在语音服务可用时隐藏答案播放，提交后校对，支持重播与错词再练；语音不可用时明确暂停听写。
- [ ] `npm test -- tests/store.test.ts`；`npx playwright test e2e/study.spec.ts` 验证真实重载、浏览器关闭重开、导出导入及已有数据不被覆盖。
- [ ] 提交本任务。浏览器清理数据无法靠本地数据库自行恢复，用户必须能取得备份。

### 任务 6：教材音频

**Files:** `src/media/audio.ts`, `AudioPlayer.tsx`, `tests/audio.test.ts`, `e2e/audio.spec.ts`。

**Interfaces:** `AudioResource {id,kind:'publisher'|'synthetic',source,trackId,status}`；`playAudio(resource:AudioResource):Promise<void>`。

- [ ] 使用任务 1 核实的音轨映射；按原题入口播放、暂停、重播和调整速度；未取得的音轨明确标注缺失。
- [ ] 测试失效链接、未触发用户手势、网络断开和切换题目停止旧音轨。不得自动播放或让两个轨道叠播。
- [ ] `npm test -- tests/audio.test.ts`、`npx playwright test e2e/audio.spec.ts`；真实手机点击播放可听见，并核对至少一段音轨与题号对应。
- [ ] 提交本任务及音轨核验记录。下载成功不能替代实际可播放验证。

### 任务 7：免费开源 AI、翻译和语音

**Files:** `src/ai/contracts.ts`, `client.ts`, `Tutor.tsx`, `tests/ai.test.ts`, `docs/ai-provider-audit.md`；必要时 `server/ai-proxy.ts`。

**Interfaces:** `translate(text:string):Promise<AIResult<string>>`；`reply(context:{exerciseId:string,text:string}):Promise<AIResult<string>>`；`transcribe(audio:Blob):Promise<AIResult<string>>`；`synthesize(text:string):Promise<AIResult<Blob>>`。

- [ ] 实施当时查询官方来源，分别核验模型许可证、免费额度、是否需账户/密钥、费用保护、浏览器或服务器接入条件及数据处理政策；不要把免费网页聊天界面当可调用 API。
- [ ] 在候选服务上验证最小真实请求；未找到满足“免费＋开源＋手机无需电脑”的服务时，报告该能力受阻，不安装付费替代，也不输出伪造成功。
- [ ] 先测试返回 `quota`、超时、401、不可用、取消录音与麦克风拒绝；确保不自动转付费、草稿保持、服务密钥不在前端。
- [ ] 接入真实文字问答、翻译、语音识别和合成；使用当前题目必要上下文。写作反馈标为学习建议；不伪称官方评分。
- [ ] `npm test -- tests/ai.test.ts`；实测录音→识别→模型回复→播放，以及听写语音闭环；记录实际模型与免费额度状态。
- [ ] 提交本任务。服务若要求新的用户账户授权，只在发现具体必需步骤时向用户说明。

### 任务 8：全书核对与可访问交付

**Files:** `e2e/acceptance.spec.ts`, `docs/verification.md`, `docs/content-coverage.md`，以及选定宿主要求的配置。

**Interfaces:** 使用前述内容 ID、分页、存储、资源与 AI 接口，不另造原型数据通路。

- [ ] 汇总每个原书页面、题目类型、答案校对、音轨、AI 能力的完成状态；区分可浏览与可交互，逐项列出未完成内容。
- [ ] 执行 `npm test`、`npm run build`、`npx playwright test`；修复失败。记录无法运行的测试及原因，不以 DOM 模拟测试冒充浏览器测试。
- [ ] 真机验收：长按划线、键盘输入、浮窗下方作答、连线、音频、刷新恢复、免费额度耗尽降级、单词听写。
- [ ] 使用可核实的私人访问部署方式交付手机 HTTPS 链接；若宿主不能保护教材，则采用私有资源或用户设备导入书籍方式，不能公开上传整书凑出链接。
- [ ] 保存源代码、内容转换结果、学习数据备份说明和核验报告；有 Git 仓库时提交到项目仓库，否则持久保存交付包。
- [ ] 最终报告分列已实现、已实测、未验证和受资源限制项。不得把第一单元完成称为全书完成。

## 自查结果与执行建议

- 需求映射：原页/大字/100与300/翻页→任务2；题型与写作→任务3；原生划线→任务4；收藏、保存和听写→任务5；原版音频→任务6；翻译、文字和语音互动→任务7；136页覆盖与真机交付→任务1和8。
- 保留用户批准的“删除点选划线”；没有将先前认可的原型当作正式代码直接上线。
- 尚未解决的外部依赖：教材音频、满足免费条件的 AI 服务、私人托管能力。先核实，不以占位按钮作为验收通过。
- 推荐在当前会话按任务顺序执行：各任务共享同一套页码、选区和答案数据，顺序实现较易保持一致；每阶段提交可核验成果，不重复要求批准已确认的功能。
- 本文的“待实施”勾选框全部保持未完成。原型批准记录日期：2026-11-10。
