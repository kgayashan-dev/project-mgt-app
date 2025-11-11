import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "Project Pulse",
  description: "A modern lending platform",
};
export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={` antialiased `}
      >

          <div> {children}</div>

        {modal}
      </body>
    </html>
  );
}
