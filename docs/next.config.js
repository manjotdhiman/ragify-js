import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
  staticImage: true,
  search: {
    codeblocks: true
  },
});

export default withNextra({
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === "production" ? "/ragify-js" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/ragify-js/" : ""
}); 