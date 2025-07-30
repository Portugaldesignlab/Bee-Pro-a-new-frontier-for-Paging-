import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Beepro - Professional Grid Layout Generator",
  description:
    "Create professional grid layouts for print and digital media with Beepro - the intelligent layout generator",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Beepro - Professional Grid Layout Generator",
    description:
      "Create professional grid layouts for print and digital media with Beepro - the intelligent layout generator",
    url: "https://beepro.app",
    siteName: "Beepro",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beepro - Professional Grid Layout Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beepro - Professional Grid Layout Generator",
    description:
      "Create professional grid layouts for print and digital media with Beepro - the intelligent layout generator",
    images: ["/og-image.jpg"],
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
