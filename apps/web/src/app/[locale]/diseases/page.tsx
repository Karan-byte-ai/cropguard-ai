import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, BookOpen, Bug, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DiseasesLibraryPage({ params: { locale } }: { params: { locale: string } }) {
  const diseases = [
    {
      slug: "tomato-late-blight",
      crop: "Tomato",
      name: locale === "hi" ? "टमाटर का पिछेती झुलसा" : locale === "mr" ? "टोमॅटोचा करपा" : "Tomato Late Blight (Phytophthora infestans)",
      pathogen: "Oomycete / Fungal",
      severity: "High",
    },
    {
      slug: "tomato-early-blight",
      crop: "Tomato",
      name: locale === "hi" ? "टमाटर का अगेती झुलसा" : locale === "mr" ? "टोमॅटोचा अगेती करपा" : "Tomato Early Blight (Alternaria solani)",
      pathogen: "Fungal",
      severity: "Medium",
    },
    {
      slug: "wheat-yellow-rust",
      crop: "Wheat",
      name: locale === "hi" ? "गेहूं का पीला रतुआ" : locale === "mr" ? "गव्हावरील पिवळा तांबेरा" : "Wheat Yellow Stripe Rust (Puccinia striiformis)",
      pathogen: "Fungal",
      severity: "High",
    },
    {
      slug: "potato-late-blight",
      crop: "Potato",
      name: locale === "hi" ? "आलू का पिछेती झुलसा" : locale === "mr" ? "बटाट्याचा पिछेती करपा" : "Potato Late Blight (Phytophthora infestans)",
      pathogen: "Fungal",
      severity: "High",
    },
    {
      slug: "rice-bacterial-blight",
      crop: "Rice",
      name: locale === "hi" ? "धान का जीवाणु झुलसा" : locale === "mr" ? "भातावरील जिवाणूजन्य करपा" : "Rice Bacterial Leaf Blight (Xanthomonas oryzae)",
      pathogen: "Bacterial",
      severity: "High",
    },
    {
      slug: "cotton-leaf-curl",
      crop: "Cotton",
      name: locale === "hi" ? "कपास का पत्ता मरोड़ रोग" : locale === "mr" ? "कापसावरील चुरडा-मुरडा" : "Cotton Leaf Curl Virus (CLCuV)",
      pathogen: "Viral",
      severity: "High",
    },
    {
      slug: "apple-scab",
      crop: "Apple",
      name: locale === "hi" ? "सेब का स्केब रोग" : locale === "mr" ? "सफरचंदावरील खवले रोग" : "Apple Scab (Venturia inaequalis)",
      pathogen: "Fungal",
      severity: "Medium",
    },
    {
      slug: "corn-common-rust",
      crop: "Maize",
      name: locale === "hi" ? "मक्का का रतुआ" : locale === "mr" ? "मक्यावरील तांबेरा" : "Maize Common Rust (Puccinia sorghi)",
      pathogen: "Fungal",
      severity: "Medium",
    },
    {
      slug: "grape-black-rot",
      crop: "Grape",
      name: locale === "hi" ? "अंगूर का काला सड़न" : locale === "mr" ? "द्राक्षांवरील काळी सड" : "Grape Black Rot (Guignardia bidwellii)",
      pathogen: "Fungal",
      severity: "Medium",
    },
    {
      slug: "soybean-rust",
      crop: "Soybean",
      name: locale === "hi" ? "सोयाबीन का रतुआ" : locale === "mr" ? "सोयाबीनवरील तांबेरा" : "Asian Soybean Rust (Phakopsora pachyrhizi)",
      pathogen: "Fungal",
      severity: "High",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Curated Disease Library</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore plant diseases with verified ICAR symptom descriptions and management protocols in English, Hindi, and Marathi.
        </p>
      </div>

      {/* Disease Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map((d) => (
          <Card key={d.slug} className="hover:border-crop-400 transition-colors flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-xs font-semibold">
                  {d.crop}
                </Badge>
                <Badge
                  variant={d.severity === "High" ? "destructive" : "warning"}
                  className="text-[10px] uppercase font-bold"
                >
                  {d.severity} Risk
                </Badge>
              </div>
              <CardTitle className="text-base font-bold leading-tight mt-1">
                <Link href={`/${locale}/diseases/${d.slug}`} className="hover:text-crop-600">
                  {d.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Type:</span> {d.pathogen}
              </div>
              <Link href={`/${locale}/diseases/${d.slug}`}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 justify-between">
                  <span>View Certified Advisory</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
