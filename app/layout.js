import './globals.css';

export const metadata = {
  title: 'sondal.top — Sonda to argument.',
  description: 'Fakty spotykają opinie. Portal sond i ankiet łączący oficjalne dane z głosem społeczności.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
