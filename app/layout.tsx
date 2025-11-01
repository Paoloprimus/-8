import "./../styles/globals.css";

export const metadata = {
  title: "Runner PWA",
  description: "UI minimal per corsa con differenziali vocali",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
