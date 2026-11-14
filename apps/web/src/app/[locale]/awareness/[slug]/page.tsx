import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ArticleDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <Link href={`/${locale}/awareness`}>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Outbreak News
        </Button>
      </Link>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Wheat</Badge>
            <Badge variant="outline">Punjab</Badge>
            <Badge variant="destructive">Yellow Rust Alert</Badge>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold leading-snug">
            ICAR Advisory: Urgent Yellow Stripe Rust Vigilance in Punjab & Haryana
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Published Today
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Northern Agro-Climatic Zone
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-sm text-foreground/90 leading-relaxed">
          <div className="rounded-lg bg-crop-50/50 dark:bg-crop-950/20 border p-4 text-xs text-muted-foreground space-y-1">
            <span className="font-semibold text-crop-800 dark:text-crop-300 block">
              Extractive Summary
            </span>
            <p>
              Recent microclimate shifts with cool nights and dense morning fog create conducive conditions for Stripe Rust (Puccinia striiformis). Agricultural scientists urge farmers to scout susceptible varieties immediately.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-foreground">Detailed Directives</h3>
            <p>
              Yellow stripe rust appears as linear rows of yellow-orange powdery pustules along leaf veins. Early detection is crucial to prevent spread to adjacent tillers.
            </p>
            <p>
              If yellow rust pustules are noticed in patches, spray Propiconazole 25 EC @ 0.1% (1 ml per litre of water) or Tebuconazole 250 EC @ 1 ml/L. Ensure spray reaches the lower foliage.
            </p>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-crop-600" />
              <span>Source: ICAR - Indian Institute of Wheat and Barley Research</span>
            </div>
            <a
              href="https://iiwbr.icar.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-crop-700 dark:text-crop-400 hover:underline"
            >
              Original Source <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
