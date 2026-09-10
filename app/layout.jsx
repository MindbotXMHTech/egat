import './globals.css'
import Providers from '../components/Providers'

export const metadata = {
  title: 'IHAMS — EGAT อรส.',
  description: 'Integrated Health of Assets Management System | กฟผ. ฝ่ายระบบสื่อสาร',
  icons: { icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="%230D2240"/><text x="50%" y="68%" text-anchor="middle" font-size="18" fill="%23E8960C">⚡</text></svg>' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-egat-bg text-egat-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
