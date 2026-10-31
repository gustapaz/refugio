export type Mode = "focus" | "rest";
export type Task = { id: string; title: string; done: boolean };
export type Session = {
  id: string;
  mode: Mode;
  seconds: number;
  at: number;
  task: string;
};
export type Timer = {
  id: string;
  mode: Mode;
  total: number;
  left: number;
  end: number | null;
  task: string;
};
export type State = {
  version: 1;
  tasks: Task[];
  selected: string | null;
  history: Session[];
  timer: Timer;
  room: "morning" | "sunset" | "night";
  rain: boolean;
  lamp: boolean;
  motion: boolean;
  minutes: number;
};
export const fresh = (): State => ({
  version: 1,
  tasks: [],
  selected: null,
  history: [],
  timer: {
    id: "",
    mode: "focus",
    total: 1500,
    left: 1500,
    end: null,
    task: "",
  },
  room: "morning",
  rain: false,
  lamp: false,
  motion: true,
  minutes: 25,
});
export function start(s: State, now: number, id: string): State {
  if (s.timer.end !== null) return s;
  const t = s.timer,
    left = t.left || t.total;
  return {
    ...s,
    timer: {
      ...t,
      id: t.left > 0 && t.id ? t.id : id,
      left,
      end: now + left * 1000,
      task:
        t.left > 0 && t.id
          ? t.task
          : s.tasks.find((x) => x.id === s.selected)?.title ||
            "Uma coisa de cada vez",
    },
  };
}
export function tick(s: State, now: number): State {
  const t = s.timer;
  if (t.end === null) return s;
  const left = Math.max(0, Math.min(t.total, Math.ceil((t.end - now) / 1000)));
  if (left === t.left && left > 0) return s;
  if (left > 0) return { ...s, timer: { ...t, left } };
  const history = s.history.some((h) => h.id === t.id)
    ? s.history
    : [
        ...s.history,
        { id: t.id, mode: t.mode, seconds: t.total, at: t.end, task: t.task },
      ].slice(-100);
  return { ...s, history, timer: { ...t, left: 0, end: null } };
}
export function pause(s: State, now: number): State {
  const n = tick(s, now);
  return { ...n, timer: { ...n.timer, end: null } };
}
export function reset(
  s: State,
  mode: Mode = s.timer.mode,
  minutes = mode === "rest" ? 5 : s.minutes,
): State {
  const total = Math.min(90, Math.max(1, Math.round(minutes))) * 60;
  return {
    ...s,
    timer: { id: "", mode, total, left: total, end: null, task: "" },
  };
}
export function formatTime(seconds: number) {
  const n = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
export function parseState(raw: string | null): State | null {
  try {
    if (!raw || raw.length > 60000) return null;
    const s = JSON.parse(raw);
    const text = (x: unknown, max: number) =>
      typeof x === "string" && x.length <= max;
    const int = (x: unknown, a: number, b: number) =>
      Number.isSafeInteger(x) && (x as number) >= a && (x as number) <= b;
    const mode = (x: unknown) => x === "focus" || x === "rest";
    if (
      s.version !== 1 ||
      !Array.isArray(s.tasks) ||
      s.tasks.length > 12 ||
      s.tasks.some(
        (t: Task) =>
          !t ||
          !text(t.id, 80) ||
          !t.id ||
          !text(t.title, 90) ||
          !t.title.trim() ||
          typeof t.done !== "boolean",
      ) ||
      new Set(s.tasks.map((t: Task) => t.id)).size !== s.tasks.length
    )
      return null;
    if (s.selected !== null && !s.tasks.some((t: Task) => t.id === s.selected))
      return null;
    if (
      !["morning", "sunset", "night"].includes(s.room) ||
      typeof s.rain !== "boolean" ||
      typeof s.lamp !== "boolean" ||
      typeof s.motion !== "boolean" ||
      !int(s.minutes, 1, 90)
    )
      return null;
    const t = s.timer;
    if (
      !t ||
      !mode(t.mode) ||
      !text(t.id, 80) ||
      !int(t.total, 60, 5400) ||
      !int(t.left, 0, t.total) ||
      (t.end !== null &&
        (!int(t.end, 1, 8640000000000000) || !t.id || t.left === 0)) ||
      !text(t.task, 90)
    )
      return null;
    if (
      !Array.isArray(s.history) ||
      s.history.length > 100 ||
      new Set(s.history.map((h: Session) => h.id)).size !== s.history.length ||
      s.history.some(
        (h: Session) =>
          !h ||
          !text(h.id, 80) ||
          !h.id ||
          !mode(h.mode) ||
          !int(h.seconds, 60, 5400) ||
          !int(h.at, 1, 8640000000000000) ||
          !text(h.task, 90),
      )
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
export function historyText(s: State) {
  return `REFÚGIO · Seus ciclos concluídos\n\n${s.history.map((h) => `${new Date(h.at).toLocaleString("pt-BR")} · ${h.mode === "focus" ? "Foco" : "Pausa"} · ${h.seconds / 60} min\n${h.task}`).join("\n\n") || "Nenhum ciclo concluído ainda."}\n\nO timer registra tempo decorrido, não mede atenção ou produtividade.\nhttps://gustapaz.github.io/refugio/`;
}
