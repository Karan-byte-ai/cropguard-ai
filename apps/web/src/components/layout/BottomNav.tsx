"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Newspaper, BookOpen, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = [
    { href: `/${locale}`, label: t("home"), icon: Home },
    { href: `/${locale}/scan`, label: t("scan"), icon: Camera, primary: true },
    { href: `/${locale}/awareness`, label: t("awareness"), icon: Newspaper },
    { href: `/${locale}/diseases`, label: t("diseases"), icon: BookOpen },
    { href: `/${locale}/history`, label: t("history"), icon: History },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-bottom shadow-lg"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex flex-col items-center justify-center group"
                aria-label={item.label}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-crop-600 text-white shadow-md active:scale-95 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-semibold text-crop-800 dark:text-crop-300 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-full py-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-crop-600 dark:text-crop-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="truncate max-w-[56px] text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
