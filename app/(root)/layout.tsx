import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Header from "../components/Header";

const font = Inter({ subsets: ["latin"] });

export const metadata = {
  icons: {
    icon: "/tech_logo.svg",
  },
  title: "TechVentory",
  description: "Inventory for us",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <ClerkProvider appearance={{ baseTheme: dark }}>
        <html lang="en">
          <body className={`${font.className} `}>
            <div>{children}</div>
          </body>
        </html>
      </ClerkProvider>
  );
}
