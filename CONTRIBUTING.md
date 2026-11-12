# 维护方式

## 添加一个技能

1. 从 `cursor/plugins` 的明确提交复制目标技能到 `skills/<name>/`，保留所需 references、scripts、assets 和许可证。
2. 检查 Cursor 专属路径、工具、模型角色、代理类型和关联技能。没有完成适配的依赖要明确标出，不要宣称独立可用。
3. 用 `agents/openai.yaml` 表达 Codex 调用策略。保留上游原有的手动或自动触发意图。
4. 在技能的 `UPSTREAM.json` 记录来源提交和改动；在根目录 `UPSTREAM.json` 登记版本及平台。
5. 增加能覆盖真实行为的验证，并将相应检查接入 CI。
6. 更新 README 技能表。未运行验证的平台不能标成已验证。

技能目录必须自包含：通过 skill-installer 单独下载后，不应依赖仓库根目录的运行脚本。体积较大的运行时通过固定版本的安装脚本准备，不提交二进制或 node_modules。

## 同步上游

在独立临时目录获取上游，以技能记录的提交为旧基线：

```powershell
git clone https://github.com/cursor/plugins.git upstream-plugins
git -C upstream-plugins diff <旧提交> <新提交> -- pstack/skills/statechart
```

先看上游改动，再将适用部分带入本仓库。不要用整个上游文件夹覆盖适配版。按目标技能替换示例路径。保留 Codex 调用策略；statechart 还需保留 Windows 进程管理、CRLF 解析和隐藏窗口设置，correct 需保留授权边界与隔离验证要求。

更新后：

1. 运行依赖安装和默认测试。
2. 在干净目录单独安装技能，检查违规模型、修复模型及 SVG 输出。
3. 检查下载地址、SHA256 和 npm 锁文件；依赖更新须重新验证。
4. 更新根目录与技能内的来源记录。未同步的其他技能保持原提交。
5. 通过一个可审查的提交或 PR 交付；只有 CI 通过的提交才适合作为稳定安装版本。

不要自动合并上游更新或把未验证的代码自动发布成稳定版。

## statechart 测试

Windows x64、Node.js 24：

```powershell
& ./skills/statechart/scripts/setup-runtime.ps1 -Development
npm --prefix ./skills/statechart/scripts test
```

测试覆盖图生成、TLC 消息解析（包括 CRLF）、编译流水线，以及真实 TLC 的违规/通过模型、中文和空格路径、已有输出保护、SVG 渲染、PowerShell 启动和进程树清理。

不要在默认测试中直接运行所有上游测试：其中部分依赖可直接执行的 Unix 脚本和额外工具。若扩展这部分覆盖，应单独完成平台适配并说明所需条件。

## correct 与通用包验证

```powershell
python -m pip install PyYAML==6.0.3
python scripts/validate_skills.py
```

这条命令也在 CI 运行，检查技能发现所需元数据、调用策略、来源记录和许可证。它不执行代理，不证明指令会被正确遵循。

修改 correct 的行为指令后，按 [行为验证步骤](tests/correct/README.md) 在隔离仓库重跑只读与修复场景，记录实际产物及反例结果。不要把测试夹具复制进用户的业务仓库，也不要把模型输出措辞作为断言。
