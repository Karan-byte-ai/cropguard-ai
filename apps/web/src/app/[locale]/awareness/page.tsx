"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  BellRing,
  Filter,
  Search,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OutbreakMap } from "@/components/news/OutbreakMap";

export default function AwarenessPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("awareness");

  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const allAlerts = [
    {
      id: "alert-1",
      state: "Punjab",
      crop: "Wheat",
      disease: "Yellow Rust",
      severity: "high",
      active_until: "2026-11-20",
    },
    {
      id: "alert-2",
      state: "Maharashtra",
      crop: "Tomato",
      disease: "Late Blight",
      severity: "medium",
      active_until: "2026-11-25",
    },
    {
      id: "alert-3",
      state: "Uttar Pradesh",
      crop: "Potato",
      disease: "Early Blight",
      severity: "medium",
      active_until: "2026-11-22",
    },
  ];

  const allArticles = [
    {
      slug: "punjab-wheat-yellow-rust-vigilance",
      title: "ICAR Advisory: Urgent Yellow Stripe Rust Vigilance in Punjab & Haryana",
      summary:
        "Farmers advised to inspect lower leaves for yellow pustule lines following cloudy conditions. Apply Propiconazole 25 EC at 0.1% upon first observation.",
      source: "ICAR-IIWBR Karnal",
      published_at: "Today, 08:30 AM",
      crop: "Wheat",
      state: "Punjab",
    },
    {
      slug: "nashik-tomato-late-blight-advisory",
      title: "Late Blight Spread Monitored in Nashik & Pune Tomato Fields",
      summary:
        "State agricultural university issues preventive bio-control protocols. High morning humidity elevates fungal pressure across open vegetable fields.",
      source: "Mahatma Phule Krishi Vidyapeeth",
      published_at: "Yesterday",
      crop: "Tomato",
      state: "Maharashtra",
    },
    {
      slug: "potato-early-blight-uttar-pradesh",
      title: "Potato Early Blight Alert for Western Uttar Pradesh Tracts",
      summary:
        "Concentric target-board spots observed on older leaves. Extension officers recommend preventative Mancozeb spray and balanced potash nutrition.",
      source: "Central Potato Research Institute",
      published_at: "2 days ago",
      crop: "Potato",
      state: "Uttar Pradesh",
    },
    {
      slug: "cotton-whitefly-leaf-curl-punjab",
      title: "Whitefly Vigilance Advisory Issued for Cotton Tracts",
      summary:
        "Agricultural department advises yellow sticky traps and selective neem extract sprays to suppress whitefly vectors transmitting cotton leaf curl virus.",
      source: "Punjab Agri University",
      published_at: "3 days ago",
      crop: "Cotton",
      state: "Punjab",
    },
  ];

  const crops = ["All", "Wheat", "Tomato", "Potato", "Cotton"];

  // Filter articles
  const filteredArticles = allArticles.filter((article) => {
    if (selectedState && article.state !== selectedState) return false;
    if (selectedCrop && selectedCrop !== "All" && article.crop !== selectedCrop) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.crop.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const trending = [
    { disease: "Tomato Late Blight", crop: "Tomato", mentions: 142, trend: "+18%" },
    { disease: "Wheat Yellow Rust", crop: "Wheat", mentions: 98, trend: "+24%" },
    { disease: "Potato Early Blight", crop: "Potato", mentions: 65, trend: "Stable" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Active Outbreak Alerts Banner Strip */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" /> {t("activeAlerts")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="uppercase text-[10px]">
                    {alert.severity}
                  </Badge>
                  <span className="font-semibold text-xs sm:text-sm">{alert.disease}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Crop: {alert.crop} • Region: {alert.state}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground pt-2">
                Active until {alert.active_until}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search news or crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-crop-600"
          />
        </div>

        {/* Crop Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1" />
          {crops.map((c) => {
            const isSelected = (selectedCrop === null && c === "All") || selectedCrop === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCrop(c === "All" ? null : c)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-crop-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Articles + Sidebar (Choropleth Map + Trending) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="font-semibold text-lg">Verified Surveillance Feed</h3>
            <span className="text-xs text-muted-foreground">
              Showing {filteredArticles.length} updates
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm border rounded-xl">
              No outbreak reports match your current filter criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.slug} className="hover:border-crop-400 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
                      <span className="font-semibold text-crop-700 dark:text-crop-400">
                        {article.source}
                      </span>
                      <span>{article.published_at}</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg hover:text-crop-600 cursor-pointer">
                      <Link href={`/${locale}/awareness/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {article.crop}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {article.state}
                        </Badge>
                      </div>
                      <Link href={`/${locale}/awareness/${article.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs font-semibold text-crop-700 dark:text-crop-300"
                        >
                          {t("readMore")} <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Outbreak Map & Trending Diseases */}
        <div className="space-y-6">
          {/* Outbreak Map Component */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-crop-600" /> State Outbreak Map
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <OutbreakMap
                selectedState={selectedState}
                onSelectState={(state) => setSelectedState(state)}
              />
            </CardContent>
          </Card>

          {/* Trending Diseases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-crop-600" />
                {t("trending")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {trending.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 border-b last:border-b-0"
                >
                  <div>
                    <span className="font-semibold block text-foreground">{item.disease}</span>
                    <span className="text-muted-foreground">
                      Crop: {item.crop} • {item.mentions} scans
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-mono">
                    {item.trend}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
