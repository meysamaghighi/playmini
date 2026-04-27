import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://playmini.fun"),
  title: "PlayMini - Free Browser Games | 2048, Snake & More",
  description:
    "Free online mini games: 2048, Snake, and more classic arcade & puzzle games. No download, no sign-up. Play instantly in your browser.",
  openGraph: {
    title: "PlayMini - Free Browser Games",
    description:
      "Free online mini games you can play instantly. 2048, Snake, and more classics. No download required.",
    type: "website",
    siteName: "PlayMini",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-65D21P7J5P"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-65D21P7J5P');`,
          }}
        />
        <meta
          name="google-site-verification"
          content="ORYrIGzzyK2TBQTM6OgzsFisZceq4rBIRl4HZXMzQ48"
        />
        <meta
          name="google-adsense-account"
          content="ca-pub-2621005924235240"
        />
      </head>
      <body className="bg-paper text-ink min-h-screen font-body antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
