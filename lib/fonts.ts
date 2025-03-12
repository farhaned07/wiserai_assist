import { Inter } from "next/font/google"

// Inter as a fallback (visually similar to Söhne)
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

// Uncomment and use this if you have the Söhne font files
/*
export const sohne = localFont({
  src: [
    {
      path: '../fonts/soehne-web-buch.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/soehne-web-kraftig.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/soehne-web-halbfett.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/soehne-web-dreiviertelfett.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
})
*/

// Export the font you want to use
export const font = inter
// If you have Söhne, change to:
// export const font = sohne

