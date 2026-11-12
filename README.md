# pstack-codex

[![Verify skills](https://github.com/bobbyz3g/pstack-codex/actions/workflows/verify.yml/badge.svg)](https://github.com/bobbyz3g/pstack-codex/actions/workflows/verify.yml)

将 [cursor/plugins 的 pstack](https://github.com/cursor/plugins/tree/main/pstack) 技能逐个适配到 Codex。每个技能独立安装、记录上游版本和验证范围。

这是社区适配仓库，不是 Cursor 或 OpenAI 的官方插件。当前按技能目录分发，尚不提供整套 marketplace 插件安装。

## 技能

| 技能 | 功能 | 适配状态 | 验证平台 | 触发方式 |
| --- | --- | --- | --- | --- |
| [statechart](skills/statechart/SKILL.md) | 使用 TLA+/TLC 检查状态模型，输出违规路径、Mermaid 图和 SVG | 0.1.0 | Windows x64，Node.js 24 | 手动 `$statechart` |
| [correct](skills/correct/SKILL.md) | 从重复纠错中找出共同原因，用结构、类型、检查或行为测试防止重犯 | 0.1.0 | Windows 上完成行为验证；技能本身无平台依赖 | 手动 `$correct` |

其他 pstack 技能会在完成适配和验证后加入，不代表上游全部技能都能在 Codex 中直接运行。statechart 的 macOS、Linux 和 Windows ARM 运行时暂未验证。

## 安装和使用 correct

在 Codex 中发送：

```text
使用 skill-installer 安装这个技能：
https://github.com/bobbyz3g/pstack-codex/tree/main/skills/correct
```

下一轮对话即可使用；若未出现，重启 Codex。它没有安装脚本、后台进程或额外运行时，不需要 WSL。执行目标项目的检查仍需要该项目自己的开发依赖。

先只读调查：

```text
$correct 分析最近一个月支付模块反复出现的错误，引用不同发生实例的证据，并提出防止重犯的方案。暂时不要修改文件。
```

授权实施：

```text
$correct 根据刚才的证据，为重复出现的金额校验问题实现最小有效约束。
保持公开接口不变，在隔离副本中证明新检查能拦住历史错误，再验证修复后通过。不要提交。
```

只输入 `$correct` 默认先调查；明确要求修复才修改文件。提交、推送等操作遵循已有授权，不会因调用技能自动发生。技能不会安装自动纠错钩子，也不会为每次纠错自动运行。重复错误需要至少两个独立实例，同一次错误的提交、评论和修复不重复计数。

适配保留上游“结构 → 类型 → 可操作检查 → 行为测试 → 文档”的优先顺序，并补充范围控制、只读边界、隔离复现和证据不足时的处理。验证方法与局限见 [correct 行为验证](tests/correct/README.md)。

## 安装 statechart

先安装 [Node.js 24](https://nodejs.org/en/download)（包含 npm）。不需要 WSL，不需要预装 Java。

在 Codex 中发送：

```text
使用 skill-installer 安装这个技能，并按照 SKILL.md 完成运行依赖安装：
https://github.com/bobbyz3g/pstack-codex/tree/main/skills/statechart
```

也可以手动安装。在 PowerShell 中运行：

```powershell
git clone https://github.com/bobbyz3g/pstack-codex.git
$codexRoot = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$skillParent = Join-Path $codexRoot 'skills'
$skillDir = Join-Path $skillParent 'statechart'
if (Test-Path -LiteralPath $skillDir) { throw 'statechart 已存在，请先备份并按更新说明处理。' }
New-Item -ItemType Directory -Force -Path $skillParent | Out-Null
Copy-Item -LiteralPath './pstack-codex/skills/statechart' -Destination $skillDir -Recurse
& "$skillDir/scripts/setup-runtime.ps1"
```

安装脚本会下载固定版本的 Temurin JRE 和 TLC，验证 SHA256，并通过 npm 锁文件安装 Pele。文件只写入技能目录，不修改系统 PATH。需要访问 GitHub Releases 和 npm。

若 PowerShell 提示脚本执行被策略禁止，可为这一次执行使用：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$skillDir/scripts/setup-runtime.ps1"
```

这不会修改系统或用户的永久执行策略。安装后在新一轮对话中使用 `$statechart`；如果未出现，重启 Codex。

## 使用 statechart

```text
$statechart
我准备实现一个支持取消和重试的后台任务。
请检查“取消被接受后不能再变成成功”和“旧执行的回调不能改变新执行”。
先明确状态、事件和假设，再运行 TLC，给出状态图及违规路径。暂时不要写业务代码。
```

也可以直接运行已有模型：

```powershell
& "$skillDir/scripts/statechart.ps1" 'C:/models/Task.tla' --out 'C:/models/task-result'
node "$skillDir/scripts/render-chart.mjs" 'C:/models/task-result/chart.mmd'
```

`--out` 必须是新目录或空目录。通常输出 `report.md`、`chart.mmd`、`tlc.out`；渲染脚本另外生成 `chart.svg`。超过图的状态预算时，可能只画违规路径，或不生成图，具体以报告为准。

退出码：`0` 表示配置中的检查通过；`1` 表示发现违规，是正常检查结果；`2` 表示运行失败。报告中的未完成检查不能视为通过。模型结论只适用于明确的假设和范围，不能代替真实代码复现。

## statechart 本地适配内容

- 使用 `agents/openai.yaml` 保留上游的手动触发意图。
- 增加 PowerShell 启动和可重复执行的依赖安装脚本。
- 适配 Windows 进程树清理与临时目录变量。
- 隐藏 Java/TLC 等后台子进程的控制台窗口。
- 修复 Windows CRLF 输出导致 TLC 违规消息解析失败的问题。
- 使用临时目录联接避免 JVM 启动参数损坏中文模型路径；不复制或修改源模型。
- 提供固定版本的 SVG 渲染器，以及真实 TLC、路径、输出保护和进程清理测试。

在限制较强的沙箱中，`taskkill` 或临时目录清理可能需要额外权限。此时应报告失败，不能将任务当作已正确取消。遇到临时目录权限错误，可将本次进程的 `TEMP` 和 `TMP` 指向已有的可写 scratch 目录。

## 更新与维护

更新前先备份已安装的技能，保留本地修改。用新版本完整替换对应技能目录，不要只覆盖 `SKILL.md`。statechart 还需要重新执行 `setup-runtime.ps1`；correct 没有运行依赖安装步骤。

来源与适配记录见 [UPSTREAM.json](UPSTREAM.json)，每个技能也携带自己的来源记录。仓库固定到已验证的上游提交，不会静默跟随 `main`。新增技能及同步流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

开发验证：

```powershell
python -m pip install PyYAML==6.0.3
python scripts/validate_skills.py
& ./skills/statechart/scripts/setup-runtime.ps1 -Development
npm --prefix ./skills/statechart/scripts test
```

CI 验证所有技能的安装元数据、调用策略、来源一致性和许可证，并运行 statechart 单元测试及 Windows 集成测试。correct 的代理行为评估单独执行，不把包校验宣称为行为验证。保留的上游完整测试中有 Unix shebang、外部工具和额外依赖假设，`test:upstream` 不属于本仓库的 Windows 兼容承诺。

## 许可证与来源

保留 pstack 原作者 Lauren Tan 的 [MIT 许可证](LICENSE)及技能内的许可证副本。Java、TLC 和 Pele 使用各自的许可证，运行时和 `node_modules` 不提交到 Git。
