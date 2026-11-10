import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const scripts = path.resolve(import.meta.dirname, '..');
const runtime = path.resolve(scripts, '../runtime');
const manifest = JSON.parse(fs.readFileSync(path.join(scripts, '../runtime-lock.json'), 'utf8'));
const javaFolder = manifest.java.directory;
const env = { ...process.env, JAVA: path.join(runtime, 'java', javaFolder, 'bin/java.exe'), TLA2TOOLS: path.join(runtime, 'tla2tools.jar') };
for (const [name, code] of [['TwoPhase', 1], ['TwoPhaseFixed', 0]] as const) {
  test(`native Windows checks ${name} with spaces and Unicode paths`, { skip: process.platform !== 'win32' }, () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statechart native-'));
    const model = path.join(tmp, '模型 with spaces');
    fs.cpSync(path.join(import.meta.dirname, 'corpus', name), model, { recursive: true });
    const out = path.join(tmp, 'result');
    const args = [path.join(scripts, 'statechart.ts'), path.join(model, `${name}.tla`), '--view', path.join(model, 'view.mjs'), '--out', out];
    const result = spawnSync(process.execPath, args, { env, encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, code, result.stderr);
    assert.equal(result.stderr, '');
    const report = fs.readFileSync(path.join(out, 'report.md'), 'utf8');
    assert.match(report, code ? /TCConsistent breaks/ : /TPTypeOK, TCConsistent, NoDeadlock/);
    if (code) assert.match(report, /shortest path has 5 steps/);
    assert.match(fs.readFileSync(path.join(out, 'chart.mmd'), 'utf8'), /stateDiagram/);
    const rendered = spawnSync(process.execPath, [path.join(scripts, 'render-chart.mjs'), path.join(out, 'chart.mmd')], { encoding: 'utf8', windowsHide: true });
    assert.equal(rendered.status, 0, rendered.stderr);
    assert.match(fs.readFileSync(path.join(out, 'chart.svg'), 'utf8'), /<svg\b/);
    assert.match(fs.readFileSync(path.join(out, 'chart.svg'), 'utf8'), /<style>/);
    const again = spawnSync(process.execPath, args, { env, encoding: 'utf8', windowsHide: true });
    assert.equal(again.status, 2);
    assert.equal(fs.readFileSync(path.join(out, 'report.md'), 'utf8'), report);
    assert.equal(fs.readFileSync(path.join(model, `${name}.tla`), 'utf8'), fs.readFileSync(path.join(import.meta.dirname, 'corpus', name, `${name}.tla`), 'utf8'), 'Temporary junction cleanup must preserve the source model');
    fs.rmSync(tmp, { recursive: true, force: true });
  });
}

test('PowerShell launcher locates its installed runtime without environment overrides', { skip: process.platform !== 'win32' }, () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statechart launcher-'));
  const cleanEnv = { ...process.env };
  delete cleanEnv.JAVA;
  delete cleanEnv.TLA2TOOLS;
  const model = path.join(import.meta.dirname, 'corpus/Counter/Counter.tla');
  const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(scripts, 'statechart.ps1'), model, '--out', path.join(tmp, 'chart')], { env: cleanEnv, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  assert.match(fs.readFileSync(path.join(tmp, 'chart/report.md'), 'utf8'), /Rules that hold/);
  const missing = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(scripts, 'statechart.ps1'), model, '--out', path.join(tmp, 'missing')], { env: { ...cleanEnv, TLA2TOOLS: path.join(tmp, 'missing.jar') }, encoding: 'utf8', windowsHide: true });
  assert.equal(missing.status, 2, 'A missing runtime must not look like a model violation (exit 1)');
  assert.match(missing.stderr, /setup-runtime.ps1/);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('Windows janitor terminates the owned process tree and cleans temporary folders on EOF', { skip: process.platform !== 'win32', timeout: 15000 }, async () => {
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'statechart-stage-'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'statechart-temp-'));
  const parent = spawn(process.execPath, ['-e', `const {spawn}=require('node:child_process'); const c=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore',windowsHide:true}); c.on('spawn',()=>process.stdout.write(String(c.pid))); setInterval(()=>{},1000);`], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  const parentExit = once(parent, 'exit');
  const [data] = await once(parent.stdout, 'data');
  const childPid = Number(data.toString());
  const janitor = spawn(process.execPath, [path.join(scripts, 'windows-janitor.ts'), String(parent.pid), stage, tmp], { windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] });
  const done = once(janitor, 'exit');
  janitor.stdin.end();
  assert.equal((await done)[0], 0);
  await parentExit;
  assert.throws(() => process.kill(childPid, 0));
  assert.equal(fs.existsSync(stage), false);
  assert.equal(fs.existsSync(tmp), false);
});
