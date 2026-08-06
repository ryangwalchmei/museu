import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainerfit 2.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-bt">
      <body>{children}</body>
    </html>
  );
}
