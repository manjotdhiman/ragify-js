export default {
  logo: <span style={{ fontWeight: 600 }}>Ragify.js</span>,
  project: {
    link: "https://github.com/manjotdhiman/ragify-js"
  },
  docsRepositoryBase: "https://github.com/manjotdhiman/ragify-js/tree/main/docs",
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Ragify.js"
    };
  },
  primaryHue: 210,
  navigation: {
    prev: true,
    next: true
  },
  footer: {
    text: `MIT ${new Date().getFullYear()} © Ragify.js.`
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Ragify.js" />
      <meta property="og:description" content="A powerful RAG library for JavaScript/TypeScript" />
    </>
  )
}; 