import type { Metadata } from "next";
import MichaelGate from "./MichaelGate";

export const metadata: Metadata = {
  title: "Michael's Games",
  robots: { index: false, follow: false },
};

export default function MichaelLayout({ children }: { children: React.ReactNode }) {
  return <MichaelGate>{children}</MichaelGate>;
}
