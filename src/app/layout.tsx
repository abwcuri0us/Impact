import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ScrollProgress from "@/components/shared/ScrollProgress";
import FloatingButtons from "@/components/FloatingButtons";
import ClientChatbot from "@/components/ClientChatbot";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// JSON-LD Structured Data for Local Business
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Impact Computers",
  alternateName: "Impact Computers",
  url: "https://impactcomputers.in",
  description: "Government-authorized computer training institute in Navi Mumbai since 1997. MS-CIT center with 4 branches.",
  foundingDate: "1997",
  founder: {
    "@type": "Person",
    name: "Mr. Sharad Shinde",
  },
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "Near Bus Depot, Sector 19, Koparkhairne",
      addressLocality: "Navi Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400709",
      addressCountry: "IN",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Sicily Park, Sector 12B, Koparkhairne",
      addressLocality: "Navi Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400709",
      addressCountry: "IN",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Near D-Mart, Sector 7, Ghansoli",
      addressLocality: "Navi Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400701",
      addressCountry: "IN",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Haware Panchvati, Sector 5, Ghansoli",
      addressLocality: "Navi Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400701",
      addressCountry: "IN",
    },
  ],
  telephone: "+919768100649",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "07:00",
    closes: "22:00",
  },
  sameAs: [
    "https://www.instagram.com/impact_computergh007",
    "https://www.facebook.com/share/1EBaow79e7/",
  ],
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 10,
    maxValue: 20,
  },
};

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Impact Computers has 4 branches across Ghansoli (Sector 7 & 5) and Koparkhairne (Sector 19 & 12B), Navi Mumbai. Government-authorized MS-CIT training center. Learn Tally, Advanced Excel, and AI-powered courses. Job-oriented training since 1997.",
  keywords: [
    "MS-CIT in Ghansoli",
    "MS-CIT in Koparkhairne",
    "computer classes near me",
    "Tally course Ghansoli",
    "Tally course Koparkhairne",
    "Excel training Navi Mumbai",
    "computer training institute Navi Mumbai",
    "MS-CIT Ghansoli",
    "MS-CIT Koparkhairne",
    "computer classes Ghansoli",
    "Impact Computers",
    "government certified computer courses",
    "AI courses Navi Mumbai",
    "CAO course Ghansoli",
    "CMS course Navi Mumbai",
    "computer accountancy course",
    "computer management course",
    "computer classes Sector 7 Ghansoli",
    "computer classes near D-Mart Ghansoli",
    "computer classes Koparkhairne",
    "computer classes Sector 19 Koparkhairne",
    "computer classes Sicily Park Koparkhairne",
  ],
  authors: [{ name: "Impact Computers" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Impact Computers",
    description:
      "Join Maharashtra's trusted computer training institute with 4 branches. MS-CIT, Tally, Advanced Excel & AI courses. 25+ years of excellence in computer education.",
    type: "website",
    locale: "en_IN",
    siteName: "Impact Computers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact Computers",
    description: "4 branches in Ghansoli & Koparkhairne, Navi Mumbai. MS-CIT, Tally, Excel, Python & more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Search Console — replace with your actual verification code */}
        <meta name="google-site-verification" content="N_jXn77eRnsx-Cvrw8wuljKyEwZnKemWQFpggOGVFFw" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after {
                font-family: Georgia, 'Times New Roman', 'Palatino Linotype', 'Book Antiqua', serif !important;
              }
              span[style*="Impact"], span[style*="Arial Black"] {
                font-family: Impact, 'Arial Black', 'Helvetica Neue', sans-serif !important;
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="antialiased bg-background text-foreground"
        style={{ fontFamily: 'Georgia, "Times New Roman", "Palatino Linotype", serif' }}
      >
        <GoogleAnalytics />
        <ThemeProvider>
          <ScrollProgress />
          <Header />
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingButtons />
          <ClientChatbot />
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
