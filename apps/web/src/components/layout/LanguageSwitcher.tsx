"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
];

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (nextLocale: string) => {
    // Set cookie for locale persistence (Section 5.4)
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Replace current locale prefix in pathname
    let newPath = pathname;
    const segments = pathname.split("/");
    if (segments[1] === "en" || segments[1] === "hi" || segments[1] === "mr") {
      segments[1] = nextLocale;
      newPath = segments.join("/");
    } else {
      newPath = `/${nextLocale}${pathname}`;
    }

    startTransition(() => {
      router.replace(newPath);
      router.refresh();
    });
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-muted/60 hover:bg-muted rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors">
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <select
        value={currentLocale}
        disabled={isPending}
        onChange={(e) => handleSelect(e.target.value)}
        className="bg-transparent border-none text-foreground text-xs font-semibold focus:outline-none cursor-pointer pr-1"
        aria-label="Select Language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-background text-foreground">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
