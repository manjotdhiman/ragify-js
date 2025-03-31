import { Inter } from "next/font/google";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata = {
  title: "Ragify.js Documentation",
  description: "A powerful RAG library for JavaScript/TypeScript",
  keywords: ["rag", "retrieval", "generation", "javascript", "typescript", "ai", "llm"],
  authors: [{ name: "Manjot Singh" }],
  creator: "Manjot Singh",
  publisher: "Ragify.js",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
};

const navbar = (
  <Navbar
    title="Ragify.js"
    extraContent={
      <a
        href="https://github.com/manjotdhiman/ragify-js"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    }
  />
);

const footer = (
  <Footer>
    MIT {new Date().getFullYear()} © Ragify.js. All rights reserved.
  </Footer>
);

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
} 