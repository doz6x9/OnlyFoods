export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black antialiased">
        {/* We remove the outer padding so the app feels full-screen */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}