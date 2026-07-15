export const metadata = {
  title: 'Mychatapp',
  description: 'Chat app na NICK AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sw">
      <body>{children}</body>
    </html>
  )
}
