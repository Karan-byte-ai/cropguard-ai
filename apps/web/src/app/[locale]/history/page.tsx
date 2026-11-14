import Link from "next/link";
import { History, Camera, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage({ params: { locale } }: { params: { locale: string } }) {
  const scans = [
    {
      id: "scan-sample-01",
      date: "Today, 10:14 AM",
      crop: "Tomato",
      disease: "Late Blight",
      confidence: 0.94,
      status: "Confirmed",
    },
    {
      id: "scan-sample-02",
      date: "Yesterday, 04:30 PM",
      crop: "Wheat",
      disease: "Healthy Leaf",
      confidence: 0.98,
      status: "Healthy",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Scan History</h1>
          <p className="text-sm text-muted-foreground">Your past diagnoses and field observations</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export PDF
        </Button>
      </div>

      <div className="space-y-4">
        {scans.map((scan) => (
          <Card key={scan.id} className="hover:border-crop-400 transition-colors">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base">{scan.crop}</span>
                  <Badge variant={scan.status === "Healthy" ? "success" : "warning"} className="text-xs">
                    {scan.disease}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>{scan.date}</span> • Confidence: {(scan.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <Link href={`/${locale}/scan/${scan.id}`}>
                <Button size="sm" variant="outline" className="text-xs">
                  View Result
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
