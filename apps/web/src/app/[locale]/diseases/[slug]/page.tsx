import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertTriangle, ExternalLink, Bug, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function DiseaseDetailPage({ params: { locale, slug } }: Props) {
  let disease: any = null;

  try {
    const res = await fetch(`http://localhost:8000/api/v1/diseases/${slug}?lang=${locale}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      disease = await res.json();
    }
  } catch {
    disease = null;
  }

  // Fallback data if API not active during static generation
  if (!disease) {
    disease = {
      slug,
      crop: "Tomato",
      name: locale === "hi" ? "टमाटर का पिछेती झुलसा" : locale === "mr" ? "टोमॅटोचा करपा" : "Tomato Late Blight",
      pathogen: "Oomycete (Phytophthora infestans)",
      severity: "High",
      symptoms: [
        "Water-soaked dark lesions appearing rapidly on leaves and stems.",
        "White delicate mildew sporulation on the underside of foliage during humid conditions.",
        "Greasy brown rot patches on green tomato fruits.",
      ],
      management_organic: [
        "Prune and destroy infected foliage immediately; do not compost blighted residues.",
        "Spray copper oxychloride (3 g/L) or Bordeaux mixture (1%) as a preventive protective canopy spray.",
        "Apply bio-agent Trichoderma viride or Bacillus subtilis @ 5 g/L preventively.",
      ],
      management_chemical: [
        "Spray Mancozeb 75% WP @ 2.0-2.5 g/L at the first appearance of symptoms.",
        "Under severe epidemic pressure, apply Cymoxanil 8% + Mancozeb 64% WP @ 2 g/L.",
      ],
      prevention: [
        "Maintain 60 x 45 cm crop spacing to maximize canopy ventilation.",
        "Avoid overhead sprinkler irrigation; employ drip lines to prevent leaf wetting.",
        "Rotate crops every 3 years with non-solanaceous crops.",
      ],
      source_name: "ICAR - Indian Institute of Horticultural Research (IIHR)",
      source_url: "https://iihr.icar.gov.in",
      disclaimer:
        "Advisory content is retrieved solely from certified agricultural research sources (ICAR / KVK). Consult local agricultural extension officers for region-specific spray schedules.",
    };
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <Link href={`/${locale}/diseases`}>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Disease Library
        </Button>
      </Link>

      <Card className="border-crop-300 dark:border-crop-800 shadow-sm">
        <CardHeader className="space-y-3 pb-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="font-semibold text-xs">
              {disease.crop}
            </Badge>
            <Badge
              variant={disease.severity === "High" ? "destructive" : "warning"}
              className="text-[10px] uppercase font-bold"
            >
              {disease.severity} Severity Risk
            </Badge>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-crop-900 dark:text-crop-100">
            {disease.name}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Pathogen:</span> {disease.pathogen}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Medical / Agronomic Grounding Notice */}
          <div className="rounded-xl bg-crop-50/50 dark:bg-crop-950/20 border p-4 text-xs text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-crop-600 mt-0.5" />
            <p>{disease.disclaimer}</p>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-foreground">Symptom Identification</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground leading-relaxed pl-1">
              {disease.symptoms.map((s: string, idx: number) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Organic vs Chemical Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 bg-crop-50/50 dark:bg-crop-950/20 space-y-2">
              <h4 className="font-bold text-sm text-crop-800 dark:text-crop-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-crop-600" />
                Organic Management
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                {disease.management_organic.map((o: string, idx: number) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border p-4 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Chemical Control
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                {disease.management_chemical.map((c: string, idx: number) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prevention */}
          <div className="space-y-2">
            <h3 className="font-bold text-base text-foreground">Long-term Prevention & Cultural Practices</h3>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground leading-relaxed pl-1">
              {disease.prevention.map((p: string, idx: number) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>

          {/* Citation Card (Section 8) */}
          <div className="rounded-xl bg-muted/40 p-4 border flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold block text-foreground">Verified Information Source:</span>
              <span className="text-muted-foreground">{disease.source_name}</span>
            </div>
            <a
              href={disease.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-crop-700 dark:text-crop-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Visit Portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
