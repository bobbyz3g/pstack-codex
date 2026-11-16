import assert from "node:assert/strict";
import { test } from "node:test";
import { render } from "pele";
import { mermaid as chartText } from "../backends/mermaid.ts";
import type { Graph } from "../ir.ts";
import { walk } from "../passes/reach.ts";
import { project } from "../pipeline.ts";
const pathPoints = (d: string) => {
  const points: number[][] = [];
  let [ax, ay] = [0, 0];
  for (const [, cmd, args] of d.matchAll(/([MLC])([^MLC]*)/g)) {
    const n = args.split(/[ ,]/).filter(Boolean).map(Number);
    const [x, y] = n.slice(-2);
    if (cmd !== "M")
      for (let t = 0; t <= 1; t += 1 / 64) {
        const u = 1 - t;
        points.push(
          cmd === "L"
            ? [ax + (x - ax) * t, ay + (y - ay) * t]
            : [
                u ** 3 * ax + 3 * u * u * t * n[0] + 3 * u * t * t * n[2] + t ** 3 * x,
                u ** 3 * ay + 3 * u * u * t * n[1] + 3 * u * t * t * n[3] + t ** 3 * y,
              ],
        );
      }
    [ax, ay] = [x, y];
  }
  return points;
};

test("an arrow into a parent from its only way in stays out of the parent's title bar in Pele 1.9.0", () => {
  const graph: Graph = { states: new Map(), steps: [] };
  for (const [id, at] of [
    ["ask", "Asking your view for labels"],
    ["flat", "Laying out the chart/Flat"],
    ["parents", "Laying out the chart/Parent states"],
    ["regions", "Laying out the chart/Regions"],
  ])
    graph.states.set(id, { vars: { at }, start: id === "ask", breaks: [] });
  for (const [to, action] of [
    ["flat", "String"],
    ["parents", "Array"],
    ["regions", "Object"],
  ])
    graph.steps.push({ from: "ask", to, action });
  const { chart } = project(graph, walk(graph), { state: (v) => String(v.at).split("/") }, []);
  const { svg } = render(chartText(chart));
  const bars = [
    ...svg.matchAll(
      /<g class="pele-cluster [^"]*" data-id="([^"]*)"><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"[^>]*\/><path d="M[\d.]+,([\d.]+)H/g,
    ),
  ].map(([, id, x, y, w, rule]) => ({ id, left: +x, right: +x + +w, top: +y, bottom: +rule }));
  assert.equal(bars.length, 1);
  const crossings: string[] = [];
  for (const [, id, d] of svg.matchAll(
    /<g class="pele-edge pele-transition" data-id="([^"]*)"><path d="([^"]*)"/g,
  ))
    for (const bar of bars)
      if (
        pathPoints(d).some(
          ([x, y]) => x > bar.left && x < bar.right && y > bar.top && y < bar.bottom,
        )
      )
        crossings.push(`${id} crosses the title bar of ${bar.id}`);
  assert.deepEqual(crossings, []);
});
