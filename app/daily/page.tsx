import type { Metadata } from "next";
import DailyGame from "./DailyGame";

export const metadata: Metadata = {
  title: "Today's Daily Game · PlayMini",
  description:
    "Fresh game pick every day. Same game for everyone. Build your streak by playing every day at PlayMini.",
  alternates: { canonical: "/daily" },
  openGraph: {
    title: "Today's Daily Game · PlayMini",
    description: "Fresh game pick every day. Build your streak.",
    type: "website",
    siteName: "PlayMini",
  },
};

export default function DailyPage() {
  return <DailyGame />;
}
