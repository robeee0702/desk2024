import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ClerkProvider, auth } from "@clerk/nextjs";
import Header from "../components/Header";
import { dark } from "@clerk/themes";
import "../globals.css";
import LeftSidebar from "../components/LeftSidebar";
import authCheck from "@/authCheck";
export const metadata = {
  icons: {
    icon: "/tech_logo.svg",
  },
  title: "TechVentory",
  description: "Inventory for us",
};

const font = Montserrat({ subsets: ["latin"] });

export default async function RootLayout({children}: {children: React.ReactNode}) { 

  await authCheck();

  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body
          className={`bg-gradient-to-l from-black84 to-black96 shadow-2xl ${font.className}`}
        >
          <div className="flex flex-col h-screen" id="app-root">
            <Header />
            <div className="flex lg:hidden">
              <LeftSidebar />
            </div>
              <main className="flex-1  flex justify-center w-full bg-white rounded-sm">
                {children}
              </main>
           
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
