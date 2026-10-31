export default defineNuxtConfig({
  compatibilityDate: "2026-10-30",
  devtools: { enabled: false },
  telemetry: false,
  app: {
    baseURL: "/refugio/",
    head: {
      htmlAttrs: { lang: "pt-BR" },
      title: "Refúgio — um lugar para fazer uma coisa de cada vez",
      meta: [
        {
          name: "description",
          content:
            "Seu cantinho de concentração: uma sala ilustrada, foco sem pressa, tarefas locais e sons que você escolhe.",
        },
        { name: "theme-color", content: "#eee7d9" },
        { property: "og:title", content: "Refúgio — uma coisa de cada vez" },
        {
          property: "og:description",
          content:
            "Uma janela aberta. Uma tarefa possível. Seu cantinho para se concentrar.",
        },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:url", content: "https://gustapaz.github.io/refugio/" },
        {
          property: "og:image",
          content: "https://gustapaz.github.io/refugio/social.png",
        },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      link: [
        { rel: "canonical", href: "https://gustapaz.github.io/refugio/" },
        { rel: "icon", type: "image/svg+xml", href: "/refugio/favicon.svg" },
      ],
    },
  },
  css: ["~/assets/main.css"],
  nitro: { preset: "static" },
});
