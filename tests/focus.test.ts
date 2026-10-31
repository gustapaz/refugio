import { it, expect } from "vitest";
import {
  fresh,
  start,
  tick,
  pause,
  reset,
  parseState,
  formatTime,
  historyText,
} from "../lib/focus";
const now = 1800000000000;
it("inicia com relógio absoluto e mantém uma única execução", () => {
  const s = start(fresh(), now, "a");
  expect(s.timer.end).toBe(now + 1500000);
  expect(start(s, now, "b")).toBe(s);
});
it("pausa, retoma com o restante e não conta o intervalo pausado", () => {
  let s = start(fresh(), now, "a");
  s = pause(s, now + 30000);
  expect(s.timer.left).toBe(1470);
  expect(s.timer.end).toBeNull();
  s = start(s, now + 300000, "b");
  expect(s.timer.id).toBe("a");
  expect(s.timer.end).toBe(now + 1770000);
});
it("conclui exatamente uma vez mesmo após ficar em segundo plano", () => {
  const s = start(fresh(), now, "a"),
    done = tick(s, now + 5000000);
  expect(done.history).toHaveLength(1);
  expect(done.timer.left).toBe(0);
  expect(tick(done, now + 9000000)).toBe(done);
  expect(done.history[0].at).toBe(now + 1500000);
});
it("novos ciclos recebem identidade nova e preservam histórico", () => {
  let s = tick(start(fresh(), now, "a"), now + 1500000);
  s = start(s, now + 1600000, "b");
  s = tick(s, now + 3100000);
  expect(s.history.map((h) => h.id)).toEqual(["a", "b"]);
});
it("preserva a intenção original mesmo que a tarefa seja apagada", () => {
  const s = fresh();
  s.tasks = [{ id: "t", title: "Ler um capítulo", done: false }];
  s.selected = "t";
  let n = start(s, now, "a");
  n.tasks = [];
  n.selected = null;
  n = tick(n, now + 1500000);
  expect(n.history[0].task).toBe("Ler um capítulo");
});
it("reinicia tentativas sem inventar ciclos concluídos", () => {
  const s = pause(start(fresh(), now, "a"), now + 20000),
    n = reset(s, "rest");
  expect(n.history).toHaveLength(0);
  expect(n.timer.total).toBe(300);
  expect(n.timer.id).toBe("");
  expect(reset(n, "focus", 1).timer.left).toBe(60);
});
it("retoma estado serializado com prazo absoluto sem duplicação", () => {
  const s = start(fresh(), now, "a"),
    n = parseState(JSON.stringify(s))!;
  expect(n).toEqual(s);
  expect(tick(n, now + 1500001).history).toHaveLength(1);
});
it("limita foco a 1–90 minutos e trata relógio voltando para trás", () => {
  expect(reset(fresh(), "focus", 0).timer.total).toBe(60);
  expect(reset(fresh(), "focus", 100).timer.total).toBe(5400);
  expect(tick(start(fresh(), now, "a"), now - 20000).timer.left).toBe(1500);
});
it("preserva apenas os últimos 100 ciclos", () => {
  let s = fresh();
  for (let i = 0; i < 103; i++)
    s = tick(start(s, now + i * 2000000, `${i}`), now + i * 2000000 + 1600000);
  expect(s.history).toHaveLength(100);
  expect(s.history[0].id).toBe("3");
});
it.each([
  null,
  "",
  "{}",
  "null",
  "{",
  JSON.stringify({ ...fresh(), minutes: 0 }),
  JSON.stringify({ ...fresh(), selected: "ausente" }),
  JSON.stringify({ ...fresh(), tasks: [{ id: "x", title: "", done: false }] }),
  JSON.stringify({ ...fresh(), timer: { ...fresh().timer, end: now } }),
])("descarta estado inválido %s", (raw) => expect(parseState(raw)).toBeNull());
it("formata relógio e exporta somente ciclos reais", () => {
  expect(formatTime(61)).toBe("01:01");
  expect(formatTime(-3)).toBe("00:00");
  expect(historyText(fresh())).toContain("Nenhum ciclo");
  expect(historyText(tick(start(fresh(), now, "a"), now + 1500000))).toContain(
    "25 min",
  );
});
