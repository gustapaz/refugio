<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
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
import type { Mode, State } from "../lib/focus";
import { Ambience } from "../lib/sound";
const state = ref(fresh()),
  ready = ref(false),
  modal = ref<"tasks" | "ambience" | "history" | "help" | "reset" | null>(null),
  dialog = ref<HTMLDialogElement | null>(null),
  taskInput = ref(""),
  notice = ref(""),
  minutes = ref(25);
const soundOn = ref(false),
  soundKind = ref<"rain" | "wind" | "stream">("rain"),
  volume = ref(35),
  audioBusy = ref(false),
  quiet = ref(false);
let audio: Ambience | null = null,
  interval: ReturnType<typeof setInterval> | undefined,
  noticeTimer: ReturnType<typeof setTimeout> | undefined,
  pendingMode: Mode | null = null;
const timer = computed(() => state.value.timer),
  running = computed(() => timer.value.end !== null),
  elapsed = computed(() => timer.value.left < timer.value.total),
  clock = computed(() => formatTime(timer.value.left));
const currentTask = computed(() =>
  state.value.tasks.find((t) => t.id === state.value.selected),
);
const done = computed(() => state.value.tasks.filter((t) => t.done).length);
const completedFocus = computed(() =>
  state.value.history.filter((h) => h.mode === "focus"),
);
const focusMinutes = computed(() =>
  completedFocus.value.reduce((n, h) => n + h.seconds / 60, 0),
);
function announce(text: string) {
  notice.value = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = ""), 6500);
}
function updateClock() {
  const old = state.value;
  const next = tick(old, Date.now());
  state.value = next;
  if (
    next.history.length > old.history.length ||
    (next.timer.left === 0 && old.timer.end !== null)
  ) {
    announce(
      next.timer.mode === "focus"
        ? "Seu ciclo terminou. Você pode descansar."
        : "Sua pausa terminou. Volte no seu tempo.",
    );
    document.title = "Ciclo concluído · Refúgio";
  }
}
function toggleTimer() {
  if (!ready.value) return;
  if (running.value) {
    state.value = pause(state.value, Date.now());
    announce("Timer pausado. Continue quando quiser.");
  } else {
    state.value = start(state.value, Date.now(), crypto.randomUUID());
    document.title = "Refúgio — uma coisa de cada vez";
  }
}
function requestReset(mode: Mode = timer.value.mode) {
  pendingMode = mode;
  if (elapsed.value && timer.value.left > 0) show("reset");
  else applyReset();
}
function applyReset() {
  state.value = reset(
    state.value,
    pendingMode || timer.value.mode,
    pendingMode === "rest" ? 5 : state.value.minutes,
  );
  pendingMode = null;
  close();
}
function setMinutes(event?: Event) {
  const raw = event
    ? (event.target as HTMLInputElement).value
    : String(minutes.value);
  if (!raw) return;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1 || value > 90) {
    minutes.value = state.value.minutes;
    announce("Escolha entre 1 e 90 minutos.");
    return;
  }
  state.value.minutes = Math.round(value);
  minutes.value = state.value.minutes;
  if (!elapsed.value && !running.value && timer.value.mode === "focus")
    state.value = reset(state.value, "focus", state.value.minutes);
}
async function show(value: NonNullable<typeof modal.value>) {
  modal.value = value;
  await nextTick();
  dialog.value?.showModal();
}
function close() {
  dialog.value?.close();
  modal.value = null;
}
function addTask() {
  const title = taskInput.value.trim();
  if (!title) {
    announce("Escreva um pequeno passo antes de adicionar.");
    return;
  }
  if (state.value.tasks.length >= 12) {
    announce("Seu papel comporta 12 passos. Remova um para abrir espaço.");
    return;
  }
  const id = crypto.randomUUID();
  state.value.tasks.push({ id, title, done: false });
  if (!state.value.selected) state.value.selected = id;
  taskInput.value = "";
  announce("Pequeno passo adicionado.");
}
function removeTask(id: string) {
  state.value.tasks = state.value.tasks.filter((t) => t.id !== id);
  if (state.value.selected === id)
    state.value.selected = state.value.tasks.find((t) => !t.done)?.id || null;
}
async function toggleSound() {
  audioBusy.value = true;
  try {
    if (soundOn.value) {
      await audio?.stop();
      soundOn.value = false;
    } else {
      audio ??= new Ambience();
      await audio.play(soundKind.value, volume.value / 100);
      soundOn.value = true;
    }
  } catch {
    soundOn.value = false;
    announce(
      "O áudio não pôde começar neste navegador. O timer continua disponível.",
    );
  } finally {
    audioBusy.value = false;
  }
}
function soundSettings() {
  audio?.set(soundKind.value, volume.value / 100);
}
function exportHistory() {
  const url = URL.createObjectURL(
      new Blob([historyText(state.value)], {
        type: "text/plain;charset=utf-8",
      }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = "refugio-ciclos.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce("Seu registro foi exportado em texto.");
}
async function visibility() {
  if (document.hidden && soundOn.value) {
    await audio?.stop();
    soundOn.value = false;
    announce("O som foi pausado ao sair da aba.");
  }
  if (!document.hidden) updateClock();
}
onMounted(() => {
  try {
    const raw = localStorage.getItem("refugio:state:1");
    if (raw) {
      const parsed = parseState(raw);
      if (parsed) state.value = parsed;
      else
        announce(
          "O registro salvo não pôde ser lido. Começamos um novo espaço.",
        );
    }
  } catch {
    announce("Armazenamento indisponível. Esta visita ficará só em memória.");
  }
  minutes.value = state.value.minutes;
  ready.value = true;
  updateClock();
  interval = setInterval(updateClock, 250);
  document.addEventListener("visibilitychange", visibility);
});
watch(
  state,
  () => {
    if (ready.value)
      try {
        localStorage.setItem("refugio:state:1", JSON.stringify(state.value));
      } catch {
        announce(
          "Não foi possível salvar. Exporte seus ciclos para guardar o registro.",
        );
      }
  },
  { deep: true },
);
onBeforeUnmount(() => {
  clearInterval(interval);
  clearTimeout(noticeTimer);
  audio?.close();
  document.removeEventListener("visibilitychange", visibility);
});
</script>
<template>
  <div class="refugio-app" :class="{ 'quiet-mode': quiet }">
    <a class="skip" href="#main">Pular para o conteúdo</a>
    <header class="site-header">
      <a class="wordmark" href="/refugio/" aria-label="Refúgio, início"
        ><span aria-hidden="true">✳</span> refúgio</a
      ><span class="header-note">UM RESPIRO NO MEIO DO DIA</span>
      <div>
        <button @click="show('history')">
          Seu ritmo
          <span class="cycle-badge">{{ completedFocus.length }}</span></button
        ><button
          class="help-button"
          aria-label="Como usar o Refúgio"
          @click="show('help')"
        >
          ?
        </button>
      </div>
    </header>
    <main id="main">
      <div class="intro">
        <div>
          <p class="eyebrow">PODE CHEGAR, O CANTINHO É SEU.</p>
          <h1>Uma coisa<br /><em>de cada vez.</em></h1>
        </div>
        <p class="intro-aside">
          Lá fora, o mundo continua.<br />Aqui, cabe o seu próximo passo.
        </p>
      </div>
      <section class="room-section" aria-label="Seu cantinho de concentração">
        <div class="room-stamp">
          <span>SEU LUGAR<br />DE VOLTAR</span
          ><svg viewBox="0 0 80 80" aria-hidden="true">
            <path
              d="M13 56Q25 13 55 20q27 6 5 31T26 52"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="m23 46 2 9 9-2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </div>
        <Room
          :room="state.room"
          :rain="state.rain"
          :lamp="state.lamp"
          :motion="state.motion"
          :working="running && timer.mode === 'focus'"
          @lamp="state.lamp = !state.lamp"
          @rain="state.rain = !state.rain"
          @cat="announce('Ele ouviu você. Preferiu continuar a soneca. 🐾')"
        />
        <button class="task-note" @click="show('tasks')">
          <span>UM PEQUENO PASSO</span
          ><strong>{{ currentTask?.title || "O que cabe em hoje?" }}</strong
          ><small
            >{{
              state.tasks.length
                ? `${done}/${state.tasks.length} passos concluídos`
                : "Escreva uma intenção, sem pressa"
            }}
            <b aria-hidden="true">↗</b></small
          >
        </button>
      </section>
      <section class="focus-dock" aria-label="Timer de foco">
        <div class="mode-tabs" aria-label="Tipo de ciclo">
          <button
            :aria-pressed="timer.mode === 'focus'"
            @click="requestReset('focus')"
          >
            <span aria-hidden="true">◒</span> Concentrar</button
          ><button
            :aria-pressed="timer.mode === 'rest'"
            @click="requestReset('rest')"
          >
            <span aria-hidden="true">⌁</span> Respirar
          </button>
        </div>
        <div class="timer-display">
          <span
            class="time"
            role="timer"
            aria-label="Tempo restante"
            aria-live="off"
            >{{ clock }}</span
          ><span class="timer-caption">{{
            running
              ? "O tempo está correndo."
              : timer.left === 0
                ? "Um ciclo, um respiro."
                : elapsed
                  ? "Uma pausa também faz parte."
                  : "Seu tempo. Seu ritmo."
          }}</span>
        </div>
        <div class="timer-actions">
          <button class="start-button" :disabled="!ready" @click="toggleTimer">
            <span aria-hidden="true">{{ running ? "Ⅱ" : "▷" }}</span>
            {{
              running
                ? "Pausar"
                : timer.left === 0
                  ? "Novo ciclo"
                  : elapsed
                    ? "Continuar"
                    : "Começar"
            }}</button
          ><button
            class="reset-button"
            aria-label="Reiniciar timer"
            @click="requestReset()"
          >
            ↺
          </button>
        </div>
      </section>
      <div class="below-dock">
        <p v-if="running || elapsed">
          {{ timer.task || "Uma coisa de cada vez"
          }}<span> · {{ timer.mode === "focus" ? "foco" : "pausa" }}</span>
        </p>
        <label v-else
          >Duração do foco
          <input
            type="number"
            min="1"
            max="90"
            v-model="minutes"
            @input="setMinutes"
            aria-label="Duração do foco em minutos"
          />
          min</label
        >
        <div>
          <button @click="show('ambience')">
            <span aria-hidden="true">☷</span> Preparar ambiente</button
          ><button :aria-pressed="quiet" @click="quiet = !quiet">
            {{ quiet ? "Mostrar detalhes" : "Menos distrações" }}
          </button>
        </div>
      </div>
      <p class="small-promise">Nada para provar. Só um espaço para começar.</p>
    </main>
    <footer>
      <span>FEITO PARA CABER NO SEU DIA. SEM CONTA, SEM PRESSÃO.</span
      ><a
        href="https://github.com/gustapaz/refugio"
        target="_blank"
        rel="noreferrer"
        >Gustavo Paz · código ↗</a
      >
    </footer>
    <div v-if="notice" class="notice" role="status">
      {{ notice
      }}<button @click="notice = ''" aria-label="Fechar aviso">×</button>
    </div>
    <dialog
      v-if="modal"
      ref="dialog"
      aria-labelledby="dialog-title"
      @cancel.prevent="close"
    >
      <div class="dialog-header">
        <span>SEU PEQUENO REFÚGIO</span
        ><button aria-label="Fechar janela" @click="close">×</button>
      </div>
      <template v-if="modal === 'tasks'"
        ><p class="eyebrow">O POSSÍVEL É UM BOM COMEÇO</p>
        <h2 id="dialog-title">Um passo no papel.</h2>
        <p>
          Escolha uma intenção para acompanhar seu próximo ciclo. Não precisa
          dar conta de tudo.
        </p>
        <form @submit.prevent="addTask" class="task-form">
          <label for="task-title" class="sr-only">Novo pequeno passo</label
          ><input
            id="task-title"
            v-model="taskInput"
            maxlength="90"
            placeholder="Qual é o próximo pequeno passo?"
            required
          /><button type="submit" :disabled="state.tasks.length >= 12">
            Adicionar
          </button>
        </form>
        <p class="fine">
          Até 12 passos · {{ done }} de {{ state.tasks.length }} concluídos
        </p>
        <ul class="task-list">
          <li
            v-for="task in state.tasks"
            :key="task.id"
            :class="{ done: task.done }"
          >
            <input
              type="checkbox"
              v-model="task.done"
              :aria-label="`Concluir ${task.title}`"
            /><label class="task-title"
              ><input
                type="radio"
                name="intention"
                :value="task.id"
                v-model="state.selected"
              /><span>{{ task.title }}</span
              ><small v-if="state.selected === task.id"
                >INTENÇÃO ATUAL</small
              ></label
            ><button
              @click="removeTask(task.id)"
              :aria-label="`Remover ${task.title}`"
            >
              ×
            </button>
          </li>
        </ul>
        <div class="empty-note" v-if="!state.tasks.length">
          <span aria-hidden="true">✎</span>
          <p>
            Seu papel está em branco.<br />Um passo pequeno já ocupa um bom
            lugar.
          </p>
        </div>
        <p class="fine">
          A intenção de um ciclo em andamento fica registrada como começou.
          Alterações valem para o próximo ciclo.
        </p></template
      >
      <template v-else-if="modal === 'ambience'"
        ><p class="eyebrow">AJUSTE O MUNDO AQUI DENTRO</p>
        <h2 id="dialog-title">Do seu jeito.</h2>
        <fieldset class="room-options">
          <legend>Luz pela janela</legend>
          <label
            v-for="r in [
              { id: 'morning', name: 'Manhã', icon: '☀' },
              { id: 'sunset', name: 'Entardecer', icon: '◒' },
              { id: 'night', name: 'Noite', icon: '☾' },
            ]"
            :key="r.id"
            ><input
              type="radio"
              name="room"
              :value="r.id"
              v-model="state.room"
            /><span>{{ r.icon }}</span
            >{{ r.name }}</label
          >
        </fieldset>
        <div class="ambient-toggles">
          <label
            ><input type="checkbox" v-model="state.rain" /> Chuva na
            janela</label
          ><label
            ><input type="checkbox" v-model="state.lamp" /> Luminária
            acesa</label
          ><label
            ><input type="checkbox" v-model="state.motion" /> Movimento
            ambiente</label
          >
        </div>
        <div class="sound-section">
          <div>
            <h3>Um som para ficar.</h3>
            <button
              class="soft-button"
              @click="toggleSound"
              :disabled="audioBusy"
              :aria-pressed="soundOn"
            >
              {{
                audioBusy
                  ? "Preparando…"
                  : soundOn
                    ? "Desligar som"
                    : "Ligar som"
              }}
            </button>
          </div>
          <label
            >Textura sonora<select v-model="soundKind" @change="soundSettings">
              <option value="rain">Chuva suave</option>
              <option value="wind">Vento distante</option>
              <option value="stream">Água correndo</option>
            </select></label
          ><label class="volume-label"
            >Volume <span>{{ volume }}%</span
            ><input
              type="range"
              min="0"
              max="100"
              v-model.number="volume"
              @input="soundSettings"
          /></label>
          <p class="fine">
            Texturas sintetizadas, sem gravações. Som e chuva visual são
            controles independentes. O áudio para ao sair da aba e não liga
            sozinho ao recarregar.
          </p>
        </div></template
      >
      <template v-else-if="modal === 'history'"
        ><p class="eyebrow">CADA VOLTA TEM SEU TAMANHO</p>
        <h2 id="dialog-title">O ritmo é seu.</h2>
        <div class="history-summary">
          <div>
            <strong>{{ completedFocus.length }}</strong
            ><span>ciclos de foco</span>
          </div>
          <div>
            <strong>{{ focusMinutes }}</strong
            ><span>minutos decorridos</span>
          </div>
          <div>
            <strong>{{ done }}</strong
            ><span>passos marcados</span>
          </div>
        </div>
        <p class="fine">
          O timer registra tempo decorrido; não mede atenção ou produtividade.
          Até 100 ciclos ficam guardados neste navegador.
        </p>
        <ol class="history-list">
          <li v-for="session in [...state.history].reverse()" :key="session.id">
            <span>{{ session.mode === "focus" ? "◒" : "⌁" }}</span>
            <div>
              <strong>{{ session.task }}</strong
              ><small
                >{{ new Date(session.at).toLocaleString("pt-BR") }} ·
                {{ session.mode === "focus" ? "Foco" : "Pausa" }}</small
              >
            </div>
            <b>{{ session.seconds / 60 }} min</b>
          </li>
        </ol>
        <div class="empty-note" v-if="!state.history.length">
          <span aria-hidden="true">↺</span>
          <p>
            Seu primeiro ciclo ainda está por vir.<br />Comece quando fizer
            sentido.
          </p>
        </div>
        <button class="soft-button" @click="exportHistory">
          Baixar registro .txt ↓
        </button></template
      >
      <template v-else-if="modal === 'reset'"
        ><p class="eyebrow">TUDO BEM RECOMEÇAR</p>
        <h2 id="dialog-title">Um novo ciclo?</h2>
        <p>
          O tempo desta tentativa não será registrado como um ciclo concluído.
          Seus passos e ciclos anteriores continuam guardados.
        </p>
        <div class="dialog-actions">
          <button class="soft-button" @click="close">Continuar como está</button
          ><button class="start-button" @click="applyReset">
            Recomeçar ciclo
          </button>
        </div></template
      >
      <template v-else
        ><p class="eyebrow">SEM MANUAL COMPLICADO</p>
        <h2 id="dialog-title">Entre. Respire. Comece.</h2>
        <ol class="how-to">
          <li>Escreva uma intenção no papel ao lado da sala.</li>
          <li>Escolha o tempo do foco, de 1 a 90 minutos.</li>
          <li>Prepare a luz e, se quiser, ligue um som suave.</li>
          <li>Comece. Pause quando precisar. Depois, respire.</li>
        </ol>
        <p>
          O timer usa o relógio do dispositivo e continua com a aba em segundo
          plano. Ao terminar, registra um único ciclo e espera você iniciar
          outro. Não envia notificações e não começa pausas automaticamente.
        </p>
        <p>
          Este é um projeto de front-end com cenário demonstrativo. Tarefas e
          ciclos ficam só neste navegador. Não há conta, API, banco remoto ou
          sincronização. Som sempre começa desligado.
        </p></template
      >
    </dialog>
  </div>
</template>
