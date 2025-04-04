import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import Image from "next/image";

import 'nextra-theme-docs/style.css'

const basePath = process.env.NODE_ENV === "production" ? "/ragify-js" : "";
 
export const metadata = {
  title: "Ragify.js",
  description: "A powerful RAG library for JavaScript/TypeScript"
}
 
const banner = (
  <Banner storageKey="ragify-banner">
    Ragify.js 0.1.1 is released 🎉 |{" "}
    <a
      href="https://www.linkedin.com/in/manjotdhiman/"
      target="_blank"
      rel="noopener noreferrer"
    >
      🚀 Manjot is available for hire or consultation! Connect on LinkedIn →
    </a>
  </Banner>
)

const navbar = (
  <Navbar
    logo={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img 
        src={`${basePath}/assets/logo.png`}
        alt="Ragify.js Logo" 
        width={150} 
        height={32} 
        style={{ objectFit: "contain" }}
      />
    </div>}
  />
)

const footer = <Footer>MIT {new Date().getFullYear()} © Ragify.js</Footer>
 
export default async function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Ragify.js" />
        <meta property="og:description" content="A powerful RAG library for JavaScript/TypeScript" />
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/manjotdhiman/ragify-js/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}