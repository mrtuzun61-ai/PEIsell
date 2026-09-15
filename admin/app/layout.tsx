export const metadata = { title: 'ShootGo Admin' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f6f6f6' }}>
        {children}
      </body>
    </html>
  );
}
