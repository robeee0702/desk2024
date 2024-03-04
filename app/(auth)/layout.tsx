import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";
import { dark } from "@clerk/themes";

export const metadata = {
  title: "TechVentory",
  description: "Inventory for us",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <ClerkProvider   appearance={{
      baseTheme: dark,
    }}>
      <html lang="en">
        <body>
          <div className="container mx-autoflex items-start justify-center min-h-screen mt-20">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
