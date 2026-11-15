import Link from "next/link";
import { useTranslations } from "next-intl";
import { Camera, Upload, ShieldCheck, Zap, BookCheck, ArrowRight, BellRing, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("hero");
  const tNav = useTranslations("nav");

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-crop-50/60 via-background to-background dark:from-crop-950/20 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
          <Badge variant="outline" className="px-3 py-1 bg-crop-100/70 dark:bg-crop-900/40 border-crop-200 text-crop-800 dark:text-crop-300 gap-1.5 inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-crop-600" />
            AI-Powered Crop Health Intelligence
          </Badge>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {t("title")}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/${locale}/scan`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-crop-600/20 text-base">
                <Camera className="h-5 w-5" />
                {t("scanNow")}
              </Button>
            </Link>
            <Link href={`/${locale}/awareness`} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base">
                <BellRing className="h-5 w-5 text-amber-600" />
                {t("exploreNews")}
              </Button>
            </Link>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-8 max-w-2xl mx-auto border-t border-muted/80">
            <div className="space-y-1">
              <div className="text-xl sm:text-3xl font-extrabold text-crop-600 dark:text-crop-400">
                {t("kpiAccuracy")}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t("kpiAccuracyDesc")}</div>
            </div>
            <div className="space-y-1 sm:border-x border-muted pt-2 sm:pt-0">
              <div className="text-xl sm:text-3xl font-extrabold text-crop-600 dark:text-crop-400">
                {t("kpiLatency")}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t("kpiLatencyDesc")}</div>
            </div>
            <div className="space-y-1 pt-2 sm:pt-0">
              <div className="text-xl sm:text-3xl font-extrabold text-crop-600 dark:text-crop-400">
                {t("kpiSources")}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t("kpiSourcesDesc")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Carousel / Steps */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How CropGuard Works</h2>
          <p className="text-sm sm:text-base text-muted-foreground">3 simple steps to diagnose and treat diseased crops</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-crop-400 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-crop-100 text-crop-800 dark:bg-crop-900/60 dark:text-crop-300 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg">Snap or Upload</h3>
              <p className="text-sm text-muted-foreground">
                Photograph the affected leaf. In-browser blur and brightness checks ensure the highest diagnostic quality.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-crop-400 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-crop-100 text-crop-800 dark:bg-crop-900/60 dark:text-crop-300 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg">AI Vision & Heatmap</h3>
              <p className="text-sm text-muted-foreground">
                Neural networks identify the pathogen while Grad-CAM overlays highlight the exact symptom spots on the leaf.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-crop-400 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-crop-100 text-crop-800 dark:bg-crop-900/60 dark:text-crop-300 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold text-lg">Certified Treatment</h3>
              <p className="text-sm text-muted-foreground">
                Receive certified organic and chemical remedies grounded strictly in official ICAR & state university guides.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
