import { Shield, Lock, EyeOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy & Security Controls</h1>
        <p className="text-sm text-muted-foreground">
          How CropGuard AI safeguards farmer privacy, location, and data integrity.
        </p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <EyeOff className="h-5 w-5 text-crop-600" /> EXIF & Metadata Stripping
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              When an image is uploaded or captured, our server immediately strips all EXIF metadata, camera device serials, and GPS coordinates. We re-encode images to ensure no covert data remains.
            </p>
            <p>
              Only coarse regional tags (State or District level) are retained to supply relevant local weather and outbreak warnings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Lock className="h-5 w-5 text-crop-600" /> IP Hashing & Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Client IP addresses are cryptographically hashed using SHA-256 for abuse mitigation and rate limiting. Raw IPs are never persisted in our database.
            </p>
            <p>
              Anonymous scan images are automatically purged after 30 days unless you explicitly save them to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
