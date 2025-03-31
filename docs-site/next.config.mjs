import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
  defaultShowCopyCode: true,
  staticImage: true,
  search: {
    codeblocks: true
  }
});

export default withNextra({
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true
  },
  basePath: "/ragify-js"
}); 