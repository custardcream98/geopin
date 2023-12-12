import "./global.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "GeoPin",
  description: "모두를 위한 지도",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center w-full px-4 lg:w-[1024px] lg:p-0 lg:mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
