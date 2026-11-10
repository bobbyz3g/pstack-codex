import fs from 'node:fs';
import { render } from 'pele';
const [input, output = input?.replace(/\.mmd$/, '.svg')] = process.argv.slice(2);
if (!input || !output || input === output) throw new Error('Usage: node render-chart.mjs chart.mmd [chart.svg]');
const guide = fs.readFileSync(new URL('../references/render.md', import.meta.url), 'utf8');
const css = guide.match(/```css\r?\n([\s\S]*?)```/)[1];
const { svg } = render(fs.readFileSync(input, 'utf8'), { limit: 1_000_000, outputLimit: 8_000_000, maxEdges: 10_000 });
fs.writeFileSync(output, svg.replace(/(<svg\b[^>]*>)/, `$1<style>${css}</style>`));
