import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

export function DisclaimerBanner() {
  const t = useTranslations("disclaimer");

  return (
    <aside aria-label="Agronomic Advice Disclaimer" className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs md:text-sm font-medium">
      <div className="container mx-auto flex items-center justify-center gap-2 text-center">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>{t("banner")}</span>
      </div>
    </aside>
  );
}
