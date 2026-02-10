import type { Metadata } from "next";
//import { Roboto } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";

/*const font = Roboto({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: "400",
});
*/
export const metadata: Metadata = {
  title: "Loomis",
  description: "Loomis – önde gelen nakit yönetimi uzmanı.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
