import "./globals.css";

export const metadata = {
  title: "Price Monitor",
  description: "Dashboard de monitoramento de preços",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}