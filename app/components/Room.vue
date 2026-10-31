<script setup lang="ts">
defineProps<{
  room: string;
  rain: boolean;
  lamp: boolean;
  motion: boolean;
  working: boolean;
}>();
defineEmits<{ lamp: []; rain: []; cat: [] }>();
</script>
<template>
  <div
    class="room-scene"
    :class="[
      room,
      {
        'is-raining': rain,
        'lamp-on': lamp,
        'no-motion': !motion,
        'is-working': working,
      },
    ]"
  >
    <svg
      class="room-art"
      viewBox="0 0 1000 590"
      role="img"
      aria-label="Um cantinho ilustrado com janela para montanhas, mesa, livros, plantas e um gato dormindo."
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stop-color="var(--sky-top)" />
          <stop offset="1" stop-color="var(--sky-bottom)" />
        </linearGradient>
        <linearGradient id="wall" x2="1" y2="1">
          <stop stop-color="var(--wall-light)" />
          <stop offset="1" stop-color="var(--wall-dark)" />
        </linearGradient>
        <linearGradient id="sunbeam" x2="1" y2="1">
          <stop stop-color="#fff0b4" stop-opacity=".45" />
          <stop offset="1" stop-color="#fff0b4" stop-opacity="0" />
        </linearGradient>
        <radialGradient id="lamp-glow">
          <stop stop-color="#ffe9a0" stop-opacity=".7" />
          <stop offset="1" stop-color="#ffe9a0" stop-opacity="0" />
        </radialGradient>
        <clipPath id="window-clip">
          <path d="M325 293V115a110 110 0 0 1 220 0v178Z" />
        </clipPath>
        <pattern
          id="rain-lines"
          width="27"
          height="65"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M10 5 2 28M22 36 16 55"
            stroke="#e7eff2"
            stroke-width="1.4"
            opacity=".6"
          />
        </pattern>
      </defs>
      <ellipse
        cx="508"
        cy="541"
        rx="375"
        ry="25"
        fill="var(--shadow)"
        opacity=".17"
      />
      <path d="M153 446 492 565 850 444 514 327Z" fill="var(--floor)" />
      <path d="M153 446V114L514 9v318Z" fill="url(#wall)" />
      <path d="M514 9 850 123V444L514 327Z" fill="var(--wall-side)" />
      <path
        d="M153 438 514 319 850 436"
        fill="none"
        stroke="var(--trim)"
        stroke-width="8"
      />
      <path
        d="M153 446 492 565 850 444"
        fill="none"
        stroke="var(--floor-edge)"
        stroke-width="8"
      />
      <g class="window-group" transform="matrix(1,-.29,0,1,-18,110)">
        <path
          d="M313 305V114a122 122 0 0 1 244 0v191Z"
          fill="var(--wood-dark)"
        />
        <g clip-path="url(#window-clip)">
          <path d="M325 293V115a110 110 0 0 1 220 0v178Z" fill="url(#sky)" />
          <circle class="sun" cx="470" cy="120" r="27" fill="var(--sun)" />
          <g class="stars" fill="#fff3ca">
            <circle cx="362" cy="100" r="2" />
            <circle cx="398" cy="61" r="1.8" />
            <circle cx="503" cy="85" r="2" />
            <circle cx="432" cy="160" r="1.6" />
            <circle cx="511" cy="176" r="1.6" />
          </g>
          <path
            d="M300 250 362 155 427 241 470 179 570 270V310H300Z"
            fill="var(--mountain-back)"
          />
          <path
            d="M300 310 390 219 444 267 519 201 575 277V320Z"
            fill="var(--mountain-front)"
          />
          <path d="M300 293q70-40 128-5t145-8v45H300Z" fill="var(--trees)" />
          <rect
            class="rain"
            x="320"
            y="0"
            width="230"
            height="360"
            fill="url(#rain-lines)"
          />
        </g>
        <path
          d="M435 13V300M319 176h230"
          fill="none"
          stroke="var(--wood-dark)"
          stroke-width="9"
        />
        <path d="M301 306h269v13H301Z" fill="var(--wood)" />
      </g>
      <path
        class="light-beam"
        d="m308 319 224-61 258 203-181 72Z"
        fill="url(#sunbeam)"
      />
      <g class="art-print" transform="translate(622,130) skewY(18)">
        <rect width="88" height="112" rx="1" fill="var(--wood-dark)" />
        <rect x="7" y="7" width="74" height="98" fill="#efe3c7" />
        <circle cx="44" cy="40" r="19" fill="#cc7655" />
        <path d="M16 93 41 58 68 93" fill="#70826a" />
        <path d="M28 93 52 66 75 93" fill="#a5b29b" />
      </g>
      <g class="shelf">
        <path d="m613 285 141 47 35-13-141-47Z" fill="var(--wood)" />
        <path d="m613 285v10l141 47v-10Z" fill="var(--wood-dark)" />
        <path d="m631 281v-48l15 5v48Z" fill="#9c5546" />
        <path d="m648 286v-60l17 6v60Z" fill="#d0b47f" />
        <path d="m668 292 4-46 15 8-4 43Z" fill="#718277" />
        <path d="m690 300v-37l13 4v37Z" fill="#a68065" />
      </g>
      <ellipse
        cx="521"
        cy="471"
        rx="143"
        ry="39"
        fill="var(--rug)"
        opacity=".9"
      />
      <ellipse
        cx="521"
        cy="471"
        rx="120"
        ry="28"
        fill="none"
        stroke="var(--rug-line)"
        stroke-width="2"
        stroke-dasharray="4 4"
      />
      <g class="desk">
        <path d="m305 355 211-71 198 66-210 74Z" fill="var(--wood)" />
        <path d="m305 355v15l199 70v-16Z" fill="var(--wood-dark)" />
        <path d="m504 424 210-74v15l-210 75Z" fill="var(--wood-mid)" />
        <path
          d="m326 372v98l15 5V378Zm158 57v103l15 5V434Zm205-64v97l-15 5v-97Z"
          fill="var(--wood-dark)"
        />
        <path d="m388 350 97-34 95 32-96 34Z" fill="#404941" />
        <path d="m390 349-8-83 99-32 6 82Z" fill="#46534c" />
        <path d="m398 337-6-64 81-27 5 65Z" fill="var(--screen)" />
        <path
          class="screen-lines"
          d="m406 280 42-14m-41 25 58-20m-57 30 33-12"
          stroke="#c4d6b8"
          stroke-width="3"
          opacity=".6"
        />
        <path d="m414 352 63-21 60 20-63 22Z" fill="#657268" />
        <path d="m547 361 40-14 30 11-40 14Z" fill="#eee6cf" />
        <path d="m552 355 28-9 18 6-28 9Z" fill="#c87d5b" />
        <g class="mug">
          <ellipse cx="600" cy="318" rx="16" ry="6" fill="#e9d5ab" />
          <path d="M584 318v28q16 12 32 0v-28Z" fill="#d5b77b" />
          <ellipse cx="600" cy="318" rx="12" ry="4" fill="#594239" />
          <path
            d="M616 325q17-3 15 9t-15 9"
            stroke="#d5b77b"
            stroke-width="5"
            fill="none"
          />
          <path
            class="steam"
            d="M595 299q-7-11 1-20m9 18q-6-11 2-20"
            stroke="#f0e7d1"
            stroke-width="3"
            fill="none"
          />
        </g>
        <g class="lamp">
          <path
            d="M638 332v-70l-31-30"
            stroke="#314b41"
            stroke-width="7"
            fill="none"
          />
          <ellipse cx="638" cy="333" rx="22" ry="8" fill="#314b41" />
          <path d="m608 209-29 13-9 29 66-20Z" fill="var(--lamp-shade)" />
          <ellipse
            cx="603"
            cy="241"
            rx="32"
            ry="8"
            transform="rotate(-18 603 241)"
            fill="var(--lamp-light)"
          />
          <ellipse
            class="lamp-halo"
            cx="598"
            cy="280"
            rx="100"
            ry="85"
            fill="url(#lamp-glow)"
          />
        </g>
      </g>
      <g class="chair">
        <path d="m449 435-42-15v-40q21-17 42 3Z" fill="#8e5b45" />
        <path d="m407 420 42 15 45-16-41-14Z" fill="#a97956" />
        <path
          d="M414 426v58m29-47v57m45-72v58"
          stroke="#684c3b"
          stroke-width="7"
        />
      </g>
      <g class="plant">
        <path
          d="M238 399v-98m0 53-31-30m31 53 32-36"
          stroke="#4d6c50"
          stroke-width="5"
          fill="none"
        />
        <path
          class="leaf leaf-one"
          d="M238 337q-59-7-50-49 42 1 50 49Z"
          fill="#647b52"
        />
        <path
          class="leaf leaf-two"
          d="M238 318q-21-60 8-79 25 35-8 79Z"
          fill="#78915e"
        />
        <path
          class="leaf leaf-three"
          d="M239 365q3-56 48-65 2 47-48 65Z"
          fill="#8a9b69"
        />
        <path d="M211 389h55l-8 52q-20 12-39 0Z" fill="#bb7f5d" />
        <ellipse cx="238" cy="389" rx="28" ry="9" fill="#d59b74" />
        <ellipse cx="238" cy="389" rx="21" ry="5" fill="#614e39" />
      </g>
      <g class="cat">
        <ellipse cx="712" cy="456" rx="48" ry="15" fill="#bd8e68" />
        <ellipse cx="707" cy="441" rx="39" ry="25" fill="#ce9f73" />
        <path d="m674 427 3-24 20 14 18-14 3 25" fill="#ce9f73" />
        <ellipse cx="696" cy="432" rx="26" ry="20" fill="#dcb286" />
        <path
          d="m683 431 8 3m11 0 8-3"
          stroke="#6b503d"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <path d="m694 439 3 3 3-3" fill="#866247" />
        <path
          d="M732 445q28 17 6 23t-34-8"
          stroke="#b58360"
          stroke-width="13"
          fill="none"
          stroke-linecap="round"
        />
        <text
          class="cat-zzz"
          x="749"
          y="414"
          fill="var(--cat-zzz)"
          font-size="19"
          font-family="serif"
        >
          z z
        </text>
      </g>
      <g class="floor-books">
        <path d="m316 474 46-16 32 11-47 17Z" fill="#697d73" />
        <path d="M316 474v8l31 11v-7Z" fill="#4c635a" />
        <path d="m347 486 47-17v8l-47 16Z" fill="#e2d1ae" />
        <path d="m321 462 42-14 29 9-43 16Z" fill="#b86e51" />
        <path d="M321 462v9l28 10v-8Z" fill="#91533d" />
        <path d="m349 473 43-16v8l-43 16Z" fill="#e9d9ba" />
      </g>
    </svg>
    <button
      class="room-hotspot lamp-switch"
      @click="$emit('lamp')"
      :aria-pressed="lamp"
    >
      <span aria-hidden="true">✦</span>{{ lamp ? "Apagar luz" : "Acender luz" }}
    </button>
    <button
      class="room-hotspot window-switch"
      @click="$emit('rain')"
      :aria-pressed="rain"
    >
      <span aria-hidden="true">{{ rain ? "☂" : "☀" }}</span
      >{{ rain ? "Abrir o céu" : "Chuva na janela" }}
    </button>
    <button
      class="cat-switch"
      aria-label="Fazer carinho no gato"
      @click="$emit('cat')"
    >
      pspsps…
    </button>
  </div>
</template>
