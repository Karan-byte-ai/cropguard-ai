import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sprout } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 font-bold text-lg md:text-xl tracking-tight text-crop-800 dark:text-crop-300"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crop-600 text-white shadow-sm">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="flex items-baseline gap-1">
            CropGuard <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-crop-100 text-crop-800 dark:bg-crop-900/60 dark:text-crop-300">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href={`/${locale}`}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            {t("home")}
          </Link>
          <Link
            href={`/${locale}/scan`}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            {t("scan")}
          </Link>
          <Link
            href={`/${locale}/awareness`}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            {t("awareness")}
          </Link>
          <Link
            href={`/${locale}/diseases`}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            {t("diseases")}
          </Link>
          <Link
            href={`/${locale}/history`}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            {t("history")}
          </Link>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
