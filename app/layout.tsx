import type { Metadata } from "next";
import Link from "next/link";
import MobileNav from "./components/MobileNav";
import "./globals.css";

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

const navLinks = [
  { href: "/2048", label: "2048" },
  { href: "/snake", label: "Snake" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
      <body className="bg-gray-950 text-white min-h-screen font-sans antialiased">
        <nav className="border-b border-gray-800 sticky top-0 z-50 bg-gray-950/90 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-white">
              PlayMini
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <MobileNav links={navLinks} />
          </div>
        </nav>

        {children}

        <footer className="border-t border-gray-800 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-gray-500">
            <p>Free browser games. No download, no sign-up required.</p>
            <p className="mt-2">
              <Link href="https://cashcalcs.com" className="hover:text-gray-300">CashCalcs</Link>
              {" | "}
              <Link href="https://benchmybrain.com" className="hover:text-gray-300">BenchMyBrain</Link>
              {" | "}
              <Link href="https://doodlelab.fun" className="hover:text-gray-300">DoodleLab</Link>
              {" | "}
              <Link href="/" className="hover:text-gray-300">PlayMini</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
