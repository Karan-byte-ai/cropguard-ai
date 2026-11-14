import { Sprout, ShieldCheck, Cpu, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">About CropGuard AI</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          CropGuard AI is an intelligent agricultural decision support platform engineered to bridge the gap between laboratory computer vision and real-world farm fields.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-5 w-5 text-crop-600" /> Explainable ML
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Fast CPU inference with ONNX Runtime, leaf verification, and Grad-CAM visual heatmaps ensuring transparent reasoning.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-crop-600" /> Grounded Advisory
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Zero hallucination policy: all management protocols are directly sourced and cited from ICAR, KVK, and accredited state agricultural universities.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
