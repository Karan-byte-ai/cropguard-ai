import "@/app/globals.css";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { locales } from "@/i18n";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { ThemeProvider } from "@/components/theme-provider";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";

export const dynamic = "force-dynamic";

export const viewport = {
  themeColor: "#276425",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: "CropGuard AI - Plant Disease Identification & Awareness",
  description:
    "Instant leaf disease diagnosis with Grad-CAM heatmaps, ICAR-grounded advisory, and live outbreak intelligence.",
  manifest: "/manifest.json",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <DisclaimerBanner />
            <Header locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
            <BottomNav locale={locale} />
            <OfflineIndicator />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
