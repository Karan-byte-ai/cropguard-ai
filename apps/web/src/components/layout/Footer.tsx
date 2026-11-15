import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sprout, ShieldAlert, Heart } from "lucide-react";

export function Footer({ locale }: { locale: string }) {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");

  return (
    <footer className="border-t bg-muted/30 py-8 mb-16 md:mb-0">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-crop-800 dark:text-crop-300">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-crop-600 text-white">
                <Sprout className="h-4 w-4" />
              </div>
              <span>CropGuard AI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              {tFooter("tagline")}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Certified ICAR / KVK Grounded Guidance</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={`/${locale}/scan`} className="hover:text-foreground">
                  {tNav("scan")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/awareness`} className="hover:text-foreground">
                  {tNav("awareness")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/diseases`} className="hover:text-foreground">
                  {tNav("diseases")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/history`} className="hover:text-foreground">
                  {tNav("history")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/history`} className="hover:text-foreground">
                  {tNav("history")}
                </Link>
              </li>

            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-foreground">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-foreground">
                  {tNav("privacy")}
                </Link>
              </li>
              <li>
                <a
                  href="https://icar.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  ICAR Portal
                </a>
              </li>
              <li>
                <a
                  href="https://kvk.icar.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  KVK Network
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <p>© {new Date().getFullYear()} CropGuard AI. {tFooter("rights")}</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
